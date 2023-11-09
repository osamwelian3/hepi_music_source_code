import React, { useState, useRef, useEffect } from 'react'
import { IoAddOutline, IoAddSharp, IoPlay } from 'react-icons/io5'
import { Modal, Spinner } from 'react-bootstrap';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, arrayRemove, arrayUnion, collection, doc, increment, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { BsCaretDown, BsCaretUp, BsPlay } from 'react-icons/bs';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { BiArrowBack } from 'react-icons/bi'
import { auth, db } from '../config/fire';
import { Link } from 'react-router-dom';
import { Amplify, API, Auth, DataStore, graphqlOperation } from 'aws-amplify';
import { getSong, listSongs } from '../graphql/queries';
import { updateSong } from '../graphql/mutations';
import awsconfig from '../aws-exports';
import ImageWithFallback from '../components/ImageWithFallback';
import album_art from '../components/fallbackImages/album_art.jpeg';
import { Helmet } from 'react-helmet';
import { formatNumber } from '../utilities/utility';
import { Song } from '../models';
Amplify.configure(awsconfig);
function Charts({ arr, setPlaylist, setIsBigPlayerVisible, setSelectedSong, selectedSong, triggerShouldFetch }) {
    const [updatedArr, setUpdatedArr] = useState(arr);
    const [mainFil, setMainFil] = useState(50)
    const [currentUser, setCurrentUser] = useState(null)
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
        
        const original = await DataStore.query(Song, key)

        if (original) {
            console.log('DataStore fetch upvote Song Success')
            let temp = []
            temp = temp.concat(original.listOfUidUpVotes);
            temp.push(currentUser?.attributes?.sub)
            const updatedSong = await DataStore.save(
                Song.copyOf(original, updated => {
                    updated.listOfUidUpVotes = temp
                    updated.listOfUidDownVotes = original.listOfUidDownVotes.filter(item => item !== currentUser?.attributes?.sub)
                })
            )
            if (updatedSong) {
                console.log('DataStore Update upvote Song Success')
                triggerShouldFetch()
            } else {
                console.log('DataStore Update upvote Song Failed')
            }
        } else {
            console.log('DataStore fetch upvote Song Failed')
        }
        // await API.graphql(graphqlOperation(getSong, {key: key})).then(async (getRes)=>{
        //     console.log(getRes.data?.getSong.listOfUidUpVotes);
        //     let temp = [];
        //     temp = temp.concat(getRes.data?.getSong.listOfUidUpVotes);
        //     const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = getRes.data?.getSong
        //     temp.push(currentUser?.attributes?.sub)
        //     modifiedSong.listOfUidUpVotes = temp;
        //     modifiedSong.listOfUidDownVotes = getRes.data?.getSong.listOfUidDownVotes.filter(item => item !== currentUser?.attributes?.sub)
        //     console.log(modifiedSong);
        //     await API.graphql(graphqlOperation(updateSong, {input: modifiedSong})).then((res)=>{
        //         console.log(res);
        //         triggerShouldFetch();
        //     });
        // })
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

        const original = await DataStore.query(Song, key)

        if (original) {
            console.log('DataStore fetch downvote Song Success')
            let temp = []
            temp = temp.concat(original.listOfUidDownVotes);
            temp.push(currentUser?.attributes?.sub)
            const updatedSong = await DataStore.save(
                Song.copyOf(original, updated => {
                    updated.listOfUidDownVotes = temp
                    updated.listOfUidUpVotes = original.listOfUidUpVotes.filter(item => item !== currentUser?.attributes?.sub)
                })
            )
            if (updatedSong) {
                console.log('DataStore Update downvote Song Success')
                triggerShouldFetch()
            } else {
                console.log('DataStore Update downvote Song Failed')
            }
        } else {
            console.log('DataStore fetch downvote Song Failed')
        }
        // await API.graphql(graphqlOperation(getSong, {key: key})).then(async (getRes)=>{
        //     console.log(getRes.data?.getSong.listOfUidUpVotes);
        //     let temp = [];
        //     temp = temp.concat(getRes.data?.getSong.listOfUidDownVotes);
        //     const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = getRes.data?.getSong
        //     temp.push(currentUser?.attributes?.sub)
        //     modifiedSong.listOfUidDownVotes = temp;
        //     modifiedSong.listOfUidUpVotes = getRes.data?.getSong.listOfUidUpVotes.filter(item => item !== currentUser?.attributes?.sub)
        //     console.log(modifiedSong);
        //     await API.graphql(graphqlOperation(updateSong, {input: modifiedSong})).then((res)=>{
        //         console.log(res);
        //         triggerShouldFetch();
        //     });
        // })
    }
    async function removeVote(key, voteType) {
        // setDoc(doc(db, 'songs', key), {
        //     listOfUidUpVotes: arrayRemove(auth.currentUser.uid)
        // }, { merge: true })
        // setDoc(doc(db, 'songs', key), {
        //     listOfUidDownVotes: arrayRemove(auth.currentUser.uid)
        // }, { merge: true })

        const original = await DataStore.query(Song, key)

        if (original) {
            console.log('DataStore fetch removeVote Song Success')
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
                const updatedSong = await DataStore.save(
                    Song.copyOf(original, updated => {
                        updated.listOfUidUpVotes = original.listOfUidUpVotes.filter(item => item !== currentUser?.attributes?.sub)
                    })
                )
                if (updatedSong) {
                    console.log('DataStore Update Song remove upvote Success')
                    triggerShouldFetch()
                } else {
                    console.log('DataStore Update Song remove upvote Failed')
                }
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
                const updatedSong = await DataStore.save(
                    Song.copyOf(original, updated => {
                        updated.listOfUidDownVotes = original.listOfUidDownVotes.filter(item => item !== currentUser?.attributes?.sub)
                    })
                )
                if (updatedSong) {
                    console.log('DataStore Update Song remove downvote Success')
                    triggerShouldFetch()
                } else {
                    console.log('DataStore Update Song remove downvote Failed')
                }
            }
        } else {
            console.log('DataStore fetch removeVote Song Failed')
        }
        // await API.graphql(graphqlOperation(getSong, {key: key})).then(async (getRes)=>{
        //     console.log(getRes.data?.getSong.listOfUidUpVotes);
        //     const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = getRes.data?.getSong
        //     modifiedSong.listOfUidUpVotes = [];
        //     modifiedSong.listOfUidDownVotes = [];
        //     if (voteType === 'upVote'){
        //         const updateArr = arr.map((item) => {
        //             if (item.key === key) {
        //               return {
        //                 ...item,
        //                 listOfUidDownVotes: [...item.listOfUidDownVotes],
        //                 listOfUidUpVotes: item.listOfUidUpVotes.filter(
        //                   (uid) => uid !== currentUser?.attributes?.sub
        //                 ),
        //               };
        //             }
        //             return item;
        //         });
        //         setUpdatedArr(updateArr);
        //         console.log(modifiedSong);
        //         await API.graphql({query: updateSong, variables: {input: modifiedSong}}).then(async (res)=>{
        //             console.log(res);
        //             const temp = getRes.data?.getSong.listOfUidUpVotes.filter(item => item !== currentUser?.attributes?.sub)
        //             console.log(Object.values(getRes.data?.getSong.listOfUidUpVotes))
        //             console.log(temp.length === 0)
        //             console.log(typeof(temp));
        //             modifiedSong.listOfUidUpVotes = temp;
        //             modifiedSong.listOfUidDownVotes = getRes.data?.getSong.listOfUidDownVotes
        //             console.log(modifiedSong);
        //             await API.graphql({query: updateSong, variables: {input: modifiedSong}}).then((res)=>{
        //                 console.log(res);
        //                 triggerShouldFetch();
        //             });
        //         });
        //     }
        //     if (voteType === 'downVote'){
        //         const updateArr = arr.map((item) => {
        //             if (item.key === key) {
        //               return {
        //                 ...item,
        //                 listOfUidUpVotes: [...item.listOfUidUpVotes],
        //                 listOfUidDownVotes: item.listOfUidDownVotes.filter(
        //                   (uid) => uid !== currentUser?.attributes?.sub
        //                 ),
        //               };
        //             }
        //             return item;
        //         });
        //         setUpdatedArr(updateArr);
        //         console.log(modifiedSong);
        //         await API.graphql({query: updateSong, variables: {input: modifiedSong}}).then(async (res)=>{
        //             console.log(res);
        //             const temp = getRes.data?.getSong.listOfUidDownVotes.filter(item => item !== currentUser?.attributes?.sub)
        //             console.log(temp)
        //             modifiedSong.listOfUidDownVotes = temp;
        //             modifiedSong.listOfUidUpVotes = getRes.data?.getSong.listOfUidUpVotes
        //             console.log(modifiedSong);
        //             await API.graphql({query: updateSong, variables: {input: modifiedSong}}).then((res)=>{
        //                 console.log(res);
        //                 triggerShouldFetch();
        //             });
        //         });
        //     }
        // })
    }
    // useEffect(()=>{
    //     if (updatedArr && mainFil){
    //         setPlaylist(updatedArr?.sort((a, b) => { const aLength = (a?.listOfUidUpVotes?.length || 0) + (a?.listens?.length || 0) - (a?.listOfUidDownVotes?.length || 0); const bLength = (b?.listOfUidUpVotes?.length || 0) + (b?.listens?.length || 0) - (a?.listOfUidDownVotes?.length || 0); return aLength - bLength; }).reverse().slice(0, mainFil));
    //         console.log(updatedArr.sort((a, b) => {
    //             const aLength = (a?.listOfUidUpVotes?.length || 0) + (a?.listens?.length || 0) - (a?.listOfUidDownVotes?.length || 0);
    //             const bLength = (b?.listOfUidUpVotes?.length || 0) + (b?.listens?.length || 0) - (a?.listOfUidDownVotes?.length || 0);
    //             return aLength - bLength;
    //         }).reverse().slice(0, mainFil))
    //     }
    // }, [mainFil, updatedArr])
    console.log(mainFil);
    console.log(updatedArr);
    if (!updatedArr) {
        return (<></>)
    }
    return (
        <div className='page_container'>
            <Helmet>
                <title>{'Charts | Hepi Music'}</title>
                <meta name="description" content={`Top ${mainFil} rated on Hepi Music`} />
                <meta name="keywords" content="Hepi, Music, Favorites, Songs, Stream, Play, Online music, Best" />

                {/*<!--  Essential META Tags -->*/}
                <meta property="og:title" content="Charts | Hepi Music" />
                <meta property="og:type" content="music.album" />
                <meta property="og:image:width" content="500" />
                <meta property="og:image:height" content="500" />
                <meta property="og:image" content="%PUBLIC_URL%/logo2.jpg" />
                <meta property="og:url" content="https://hepimusic.com/charts" />
                <meta name="twitter:card" content="summary_large_image" />

                {/*<!--  Non-Essential, But Recommended -->*/}
                <meta property="og:description" content={`Top ${mainFil} rated on Hepi Music`} />
                <meta property="og:site_name" content="Hepi Music Charts" />
                <meta name="twitter:image:alt" content="Hepi Music Charts"></meta>
            </Helmet>
            <h6 style={{ marginBottom: '15px' }}>Charts</h6>
            <select value={mainFil} onChange={(e) => { setMainFil(e.target.value) }} className='btn' style={{ width: '-webkit-fill-available', padding: '10px 0px', maxWidth: '400px', color: '#f3b007', background: '#151515' }}>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
                <option value={150}>Top 150</option>
            </select>
            <hr></hr>
            {
                updatedArr && updatedArr.sort((a, b) => {
                    // (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)
                    const aLength = (a?.listOfUidUpVotes?.length || 0) + (a?.listens?.length || 0) - (a?.listOfUidDownVotes?.length || 0);
                    const bLength = (b?.listOfUidUpVotes?.length || 0) + (b?.listens?.length || 0) - (a?.listOfUidDownVotes?.length || 0);
                    return aLength - bLength;
                }).reverse().slice(0, mainFil).map((one, index) => {
                    return (
                        <>
                            <div  onClick={() => { setPlaylist(updatedArr?.sort((a, b) => { const aLength = (a?.listOfUidUpVotes?.length || 0) + (a?.listens?.length || 0) - (a?.listOfUidDownVotes?.length || 0); const bLength = (b?.listOfUidUpVotes?.length || 0) + (b?.listens?.length || 0) - (a?.listOfUidDownVotes?.length || 0); return aLength - bLength; }).reverse()); setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '-webkit-fill-available', padding: '10px', borderBottom: '1px solid #6d6d6d', display: 'flex' }}>
                                <span style={{display: 'block', marginRight: '10px', alignSelf: 'center'}}>{index+1}</span>
                                <Link style={{alignSelf: 'center'}} to={'/song'}>
                                    <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                        fallbackSrc={album_art}
                                        style={{ height: '50px', width: '50px', borderRadius: '5px', marginRight: '15px' }}
                                    />
                                </Link>
                                <div style={{ flex: '1' }}>
                                    <Link to={'/song'} style={{ textDecoration: 'none', color: '#fff' }}>
                                        <p style={{ fontSize: '0.9em', marginBottom: '0px' }}>{one.name}</p>
                                        <p style={{ fontSize: '0.8em', color: '#ccc', margin: '0' }}>{JSON.parse(one?.selectedCreator)?.name}</p>
                                        <p style={{ fontSize: '0.8em', color: '#ccc', margin: '0' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/><span>{formatNumber(one?.listens?.length)}</span></em></p>
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
            <span className='render' style={{display: 'none'}}>Rendered</span>
        </div >
    )
}

export default Charts