import React, { useState, useRef, useEffect } from 'react'
import { IoAddOutline, IoAddSharp } from 'react-icons/io5'
import { Modal, Spinner } from 'react-bootstrap';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, arrayRemove, arrayUnion, collection, doc, increment, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { BsCaretDown, BsCaretUp } from 'react-icons/bs';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { BiArrowBack } from 'react-icons/bi'
import { auth, db } from '../config/fire';
import { Link } from 'react-router-dom';
import { Amplify, API, Auth, graphqlOperation } from 'aws-amplify';
import { getSong, listSongs } from '../graphql/queries';
import { updateSong } from '../graphql/mutations';
import awsconfig from '../aws-exports';
import ImageWithFallback from '../components/ImageWithFallback';
import album_art from '../components/fallbackImages/album_art.jpeg';
Amplify.configure(awsconfig);
function Charts({ arr, setIsBigPlayerVisible, setSelectedSong, selectedSong, triggerShouldFetch }) {
    const [mainFil, setMainFil] = useState(50)
    const [currentUser, setCurrentUser] = useState(null)
    const [updatedArr, setUpdatedArr] = useState(arr);
    async function getCurrentUser(){
        const promise = new Promise(async function (resolve){
            await Auth.currentUserInfo().then((user)=>{
                resolve(user);
            });
        });

        return await promise;
    }
    
    useEffect(() => {
        setUpdatedArr(arr);
        return () => {
            setUpdatedArr();
        }
    }, [arr])
    
    useEffect(async () => {
        await getCurrentUser().then((res)=>{
            console.log(res)
            setCurrentUser(res)
        })
    }, [selectedSong]);
    console.log(currentUser)
    async function upVote(key) {
        const updateArr = arr.map((item) => {
            if (item.key === key) {
              return {
                ...item,
                listOfUidUpVotes: [...item.listOfUidUpVotes, currentUser?.attributes?.sub],
                listOfUidDownVotes: item.listOfUidDownVotes.filter(
                  (uid) => uid !== currentUser?.attributes?.sub
                ),
              };
            }
            return item;
        });
        setUpdatedArr(updateArr);
        // setDoc(doc(db, 'songs', key), {
        //     listOfUidUpVotes: arrayUnion(auth.currentUser.uid)
        // }, { merge: true })
        // setDoc(doc(db, 'songs', key), {
        //     listOfUidDownVotes: arrayRemove(auth.currentUser.uid)
        // }, { merge: true })
        await API.graphql(graphqlOperation(getSong, {key: key})).then(async (getRes)=>{
            console.log(getRes.data?.getSong.listOfUidUpVotes);
            let temp = [];
            temp = temp.concat(getRes.data?.getSong.listOfUidUpVotes);
            const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = getRes.data?.getSong
            temp.push(currentUser?.attributes?.sub)
            modifiedSong.listOfUidUpVotes = temp;
            modifiedSong.listOfUidDownVotes = getRes.data?.getSong.listOfUidUpVotes.filter(item => item !== currentUser?.attributes?.sub)
            console.log(modifiedSong);
            await API.graphql(graphqlOperation(updateSong, {input: modifiedSong})).then((res)=>{
                console.log(res);
                triggerShouldFetch();
            });
        })
    }
    async function downVote(key) {
        const updateArr = arr.map((item) => {
            if (item.key === key) {
              return {
                ...item,
                listOfUidDownVotes: [...item.listOfUidDownVotes, currentUser?.attributes?.sub],
                listOfUidUpVotes: item.listOfUidUpVotes.filter(
                  (uid) => uid !== currentUser?.attributes?.sub
                ),
              };
            }
            return item;
        });
        setUpdatedArr(updateArr);
        // setDoc(doc(db, 'songs', key), {
        //     listOfUidDownVotes: arrayUnion(auth.currentUser.uid)
        // }, { merge: true })
        // setDoc(doc(db, 'songs', key), {
        //     listOfUidUpVotes: arrayRemove(auth.currentUser.uid)
        // }, { merge: true })

        await API.graphql(graphqlOperation(getSong, {key: key})).then(async (getRes)=>{
            console.log(getRes.data?.getSong.listOfUidUpVotes);
            let temp = [];
            temp = temp.concat(getRes.data?.getSong.listOfUidDownVotes);
            const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = getRes.data?.getSong
            temp.push(currentUser?.attributes?.sub)
            modifiedSong.listOfUidDownVotes = temp;
            modifiedSong.listOfUidUpVotes = getRes.data?.getSong.listOfUidUpVotes.filter(item => item !== currentUser?.attributes?.sub)
            console.log(modifiedSong);
            await API.graphql(graphqlOperation(updateSong, {input: modifiedSong})).then((res)=>{
                console.log(res);
                triggerShouldFetch();
            });
        })
    }
    async function removeVote(key, voteType) {
        // setDoc(doc(db, 'songs', key), {
        //     listOfUidUpVotes: arrayRemove(auth.currentUser.uid)
        // }, { merge: true })
        // setDoc(doc(db, 'songs', key), {
        //     listOfUidDownVotes: arrayRemove(auth.currentUser.uid)
        // }, { merge: true })
        await API.graphql(graphqlOperation(getSong, {key: key})).then(async (getRes)=>{
            console.log(getRes.data?.getSong.listOfUidUpVotes);
            const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = getRes.data?.getSong
            modifiedSong.listOfUidUpVotes = [];
            modifiedSong.listOfUidDownVotes = [];
            if (voteType === 'upVote'){
                const updateArr = arr.map((item) => {
                    if (item.key === key) {
                      return {
                        ...item,
                        listOfUidDownVotes: [...item.listOfUidDownVotes],
                        listOfUidUpVotes: item.listOfUidUpVotes.filter(
                          (uid) => uid !== currentUser?.attributes?.sub
                        ),
                      };
                    }
                    return item;
                });
                setUpdatedArr(updateArr);
                console.log(modifiedSong);
                await API.graphql({query: updateSong, variables: {input: modifiedSong}}).then(async (res)=>{
                    console.log(res);
                    const temp = getRes.data?.getSong.listOfUidUpVotes.filter(item => item !== currentUser?.attributes?.sub)
                    console.log(Object.values(getRes.data?.getSong.listOfUidUpVotes))
                    console.log(temp.length === 0)
                    console.log(typeof(temp));
                    modifiedSong.listOfUidUpVotes = temp;
                    modifiedSong.listOfUidDownVotes = getRes.data?.getSong.listOfUidDownVotes
                    console.log(modifiedSong);
                    await API.graphql({query: updateSong, variables: {input: modifiedSong}}).then((res)=>{
                        console.log(res);
                        triggerShouldFetch();
                    });
                });
            }
            if (voteType === 'downVote'){
                const updateArr = arr.map((item) => {
                    if (item.key === key) {
                      return {
                        ...item,
                        listOfUidUpVotes: [...item.listOfUidUpVotes],
                        listOfUidDownVotes: item.listOfUidDownVotes.filter(
                          (uid) => uid !== currentUser?.attributes?.sub
                        ),
                      };
                    }
                    return item;
                });
                setUpdatedArr(updateArr);
                console.log(modifiedSong);
                await API.graphql({query: updateSong, variables: {input: modifiedSong}}).then(async (res)=>{
                    console.log(res);
                    const temp = getRes.data?.getSong.listOfUidDownVotes.filter(item => item !== currentUser?.attributes?.sub)
                    console.log(temp)
                    modifiedSong.listOfUidDownVotes = temp;
                    modifiedSong.listOfUidUpVotes = getRes.data?.getSong.listOfUidUpVotes
                    console.log(modifiedSong);
                    await API.graphql({query: updateSong, variables: {input: modifiedSong}}).then((res)=>{
                        console.log(res);
                        triggerShouldFetch();
                    });
                });
            }
        })
    }
    console.log(mainFil);
    console.log(updatedArr);
    if (!updatedArr) {
        return (<></>)
    }
    return (
        <div className='page_container'>
            <h6 style={{ marginBottom: '15px' }}>Charts</h6>
            <select value={mainFil} onChange={(e) => { setMainFil(e.target.value) }} className='btn' style={{ width: '-webkit-fill-available', padding: '10px 0px', maxWidth: '400px', color: '#f3b007', background: '#151515' }}>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
                <option value={150}>Top 150</option>
            </select>
            <hr></hr>
            {
                updatedArr && updatedArr.sort((a, b) => a?.listOfUidUpVotes?.length - b?.listOfUidUpVotes?.length).reverse().slice(0, mainFil).map((one) => {
                    return (
                        <>
                            <div  onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '-webkit-fill-available', padding: '10px', borderBottom: '1px solid #6d6d6d', display: 'flex' }}>
                                <Link to={'/song'}>
                                    <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                        fallbackSrc={album_art}
                                        style={{ height: '50px', width: '50px', borderRadius: '5px', marginRight: '15px' }}
                                    />
                                </Link>
                                <div style={{ flex: '1' }}>
                                    <Link to={'/song'} style={{ textDecoration: 'none', color: '#fff' }}>
                                        <p style={{ fontSize: '0.9em', marginBottom: '0px' }}>{one.name}</p>
                                        <p style={{ fontSize: '0.8em', color: '#ccc', margin: '0' }}>{one?.selectedCreator?.name}</p>
                                        <p style={{ fontSize: '0.8em', color: '#ccc', margin: '0', color: '#f3b007', fontWeight: 'bold' }}>{one?.key === selectedSong?.key && 'Currently Playing'}</p>
                                    </Link>
                                </div>
                                {
                                    currentUser?.attributes?.sub &&
                                    <div onClick={(e) => { e.stopPropagation() }} style={{ flex: '0.5', display: 'flex' }}>
                                        {
                                            one?.listOfUidUpVotes?.includes(currentUser?.attributes.sub) ?
                                                <div onClick={async () => { await removeVote(one.key, 'upVote').catch((error) => { setUpdatedArr(arr); alert(`There was a problem removing your upvote on ${one.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em', color: '#f3b007' }}>
                                                    {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                    <AiFillCaretUp style={{ fontSize: '1.5em', color: '#f3b007' }} />
                                                    {one?.listOfUidUpVotes?.length}
                                                </div>
                                                :
                                                <div onClick={async () => { await upVote(one.key).catch((error) => { setUpdatedArr(arr); alert(`There was a problem upvoting ${one.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em' }}>
                                                    {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                    <BsCaretUp style={{ fontSize: '1.5em' }} />
                                                    {one?.listOfUidUpVotes?.length}
                                                </div>
                                        }
                                        {
                                            one?.listOfUidDownVotes?.includes(currentUser?.attributes?.sub) ?
                                                <div onClick={async () => { await removeVote(one.key, 'downVote').catch((error) => { setUpdatedArr(arr); alert(`There was a problem removing your downvote on ${one.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em', color: '#f3b007' }}>
                                                    {/* <AiFillCaretDown style={{ fontSize: '1.5em' }} /> */}
                                                    <AiFillCaretDown style={{ fontSize: '1.5em', color: '#f3b007' }} />
                                                    {one?.listOfUidDownVotes?.length}
                                                </div>
                                                :
                                                <div onClick={async () => { await downVote(one.key).catch((error) => { setUpdatedArr(arr); alert(`There was a problem downvoting ${one.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em' }}>
                                                    {/* <AiFillCaretDown style={{ fontSize: '1.5em' }} /> */}
                                                    <BsCaretDown style={{ fontSize: '1.5em' }} />
                                                    {one?.listOfUidDownVotes?.length}
                                                </div>
                                        }
                                    </div>
                                }
                                {
                                    !currentUser &&
                                    <div onClick={(e) => { e.stopPropagation(); alert('Please Login or register to vote a song.') }} style={{ flex: '0.5', display: 'flex' }}>
                                        {
                                            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em' }}>
                                                {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                <BsCaretUp style={{ fontSize: '1.5em' }} />
                                                {one?.listOfUidUpVotes?.length}
                                            </div>
                                        }
                                        {
                                            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em' }}>
                                                {/* <AiFillCaretDown style={{ fontSize: '1.5em' }} /> */}
                                                <BsCaretDown style={{ fontSize: '1.5em' }} />
                                                {one?.listOfUidDownVotes?.length}
                                            </div>
                                        }
                                    </div>
                                }
                            </div>
                        </>
                    )
                })
            }
            <br></br>
            <br></br>
        </div >
    )
}

export default Charts