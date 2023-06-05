import React, { useState, useEffect } from 'react'
import { BsCaretDown, BsCaretUp } from 'react-icons/bs'
import { BiArrowBack } from 'react-icons/bi'
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db } from '../config/fire'
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { Link } from 'react-router-dom'
import { Amplify, API, graphqlOperation, Auth } from 'aws-amplify';
import { getSong, listAlbums } from '../graphql/queries'
import { updateSong } from '../graphql/mutations'
import awsconfig from '../aws-exports';
import ImageWithFallback from '../components/ImageWithFallback';
import album_art from '../components/fallbackImages/album_art.jpeg';
Amplify.configure(awsconfig)
function Albums({ arr, setIsBigPlayerVisible, setSelectedSong, selectedSong, triggerShouldFetch }) {
    const [allAlbums, setAllAlbums] = useState(null)
    const [isAlbumVisible, setIsAlbumVisible] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null)
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
    useEffect(async () => {
        await getCurrentUser().then((res)=>{
            console.log(res)
            setCurrentUser(res)
        })
    }, [selectedSong, selectedAlbum]);
    useEffect(() => {
        setUpdatedArr(arr);
        return () => {
            setUpdatedArr();
        }
    }, [arr])
    useEffect(async () => {
        // onSnapshot(collection(db, 'albums'), (snap) => {
        //     let temp = []
        //     snap.docs.forEach(doc => {
        //         temp.push(doc.data())
        //     })
        //     setAllAlbums(temp)
        // })
        await API.graphql(graphqlOperation(listAlbums)).then((res) => {
            let temp = [];
            res.data?.listAlbums.items.forEach(doc => {
                console.log(doc);
                temp.push(doc);
            });
            setAllAlbums(temp);
        })
    }, [])
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
    // function upVote(key) {
    //     setDoc(doc(db, 'songs', key), {
    //         listOfUidUpVotes: arrayUnion(auth.currentUser.uid)
    //     }, { merge: true })
    //     setDoc(doc(db, 'songs', key), {
    //         listOfUidDownVotes: arrayRemove(auth.currentUser.uid)
    //     }, { merge: true })
    // }
    // function downVote(key) {
    //     setDoc(doc(db, 'songs', key), {
    //         listOfUidDownVotes: arrayUnion(auth.currentUser.uid)
    //     }, { merge: true })
    //     setDoc(doc(db, 'songs', key), {
    //         listOfUidUpVotes: arrayRemove(auth.currentUser.uid)
    //     }, { merge: true })
    // }
    // function removeVote(key) {
    //     setDoc(doc(db, 'songs', key), {
    //         listOfUidUpVotes: arrayRemove(auth.currentUser.uid)
    //     }, { merge: true })
    //     setDoc(doc(db, 'songs', key), {
    //         listOfUidDownVotes: arrayRemove(auth.currentUser.uid)
    //     }, { merge: true })
    // }
    if (isAlbumVisible) {
        return (
            <div className='page_container'>
                <div style={{ width: '-webkit-fill-available', height: '55px', display: 'flex' }}>
                    <BiArrowBack onClick={() => { setIsAlbumVisible(false) }} style={{ fontSize: '1.5em', color: '#f3b007', marginRight: '20px' }} />
                    <h4 style={{ margin: '0', color: '#f3b007' }}>{selectedAlbum.name}</h4>
                </div>
                {
                    updatedArr && updatedArr.sort((a, b) => a?.listOfUidUpVotes?.length - b?.listOfUidUpVotes?.length).reverse().map((one) => {
                        console.log(one?.partOf, selectedAlbum.key);
                        if (!(one?.partOf && one.partOf === selectedAlbum?.key)) {
                            return (<></>)
                        }
                        return (
                            <>
                                <div onClick={() => { setSelectedSong(one); }} style={{ width: '-webkit-fill-available', borderBottom: '1px solid #6d6d6d', padding: '10px', display: 'flex' }}>
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
                                    <div style={{ flex: '0.5', display: 'flex' }}>
                                        {
                                            currentUser?.attributes?.sub &&
                                            <div onClick={(e) => { e.stopPropagation() }} style={{ flex: '0.5', display: 'flex' }}>
                                                {
                                                    one?.listOfUidUpVotes?.includes(currentUser?.attributes?.sub) ?
                                                        <div onClick={async () => { await removeVote(one.key, 'upVote').catch((error) => { setUpdatedArr(arr); alert(`There was a problem removing your upvote on ${one.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', color: '#f3b007' }}>
                                                            {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                            <AiFillCaretUp style={{ fontSize: '1.5em', color: '#f3b007' }} />
                                                            {one?.listOfUidUpVotes?.length}
                                                        </div>
                                                        :
                                                        <div onClick={async () => { await upVote(one.key).catch((error) => { setUpdatedArr(arr); alert(`There was a problem upvoting ${one.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px' }}>
                                                            {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                            <BsCaretUp style={{ fontSize: '1.5em' }} />
                                                            {one?.listOfUidUpVotes?.length}
                                                        </div>
                                                }
                                                {
                                                    one?.listOfUidDownVotes?.includes(currentUser?.attributes?.sub) ?
                                                        <div onClick={async () => { await removeVote(one.key, 'downVote').catch((error) => { setUpdatedArr(arr); alert(`There was a problem removing your downvote on ${one.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', color: '#f3b007' }}>
                                                            {/* <AiFillCaretDown style={{ fontSize: '1.5em' }} /> */}
                                                            <AiFillCaretDown style={{ fontSize: '1.5em', color: '#f3b007' }} />
                                                            {one?.listOfUidDownVotes?.length}
                                                        </div>
                                                        :
                                                        <div onClick={async () => { await downVote(one.key).catch((error) => { setUpdatedArr(arr); alert(`There was a problem downvoting ${one.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px' }}>
                                                            {/* <AiFillCaretDown style={{ fontSize: '1.5em' }} /> */}
                                                            <BsCaretDown style={{ fontSize: '1.5em' }} />
                                                            {one?.listOfUidDownVotes?.length}
                                                        </div>
                                                }
                                            </div>
                                        }
                                        {
                                            !currentUser?.attributes?.sub &&
                                            <div onClick={(e) => { e.stopPropagation(); alert('Please Login or register to vote a song.') }} style={{ flex: '0.5', display: 'flex' }}>
                                                {
                                                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px' }}>
                                                        {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                        <BsCaretUp style={{ fontSize: '1.5em' }} />
                                                        {one?.listOfUidUpVotes?.length}
                                                    </div>
                                                }
                                                {
                                                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px' }}>
                                                        {/* <AiFillCaretDown style={{ fontSize: '1.5em' }} /> */}
                                                        <BsCaretDown style={{ fontSize: '1.5em' }} />
                                                        {one?.listOfUidDownVotes?.length}
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            </>
                        )
                    })
                }
                <br></br>
                <br></br>
                <br></br>
            </div>
        )
    }
    return (
        <div className='page_container'>
            <h6 style={{ marginBottom: '15px' }}>Albums</h6>
            <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', width: '100%' }}>
                {
                    allAlbums && allAlbums.map((one) => {
                        return (
                            <div onClick={() => { setSelectedAlbum(one); setIsAlbumVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                    fallbackSrc={album_art}
                                    style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                />
                                <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
                            </div>
                        )
                    })
                }
            </div>
            <br></br>
            <br></br>
            <br></br>
        </div>
    )
}

export default Albums