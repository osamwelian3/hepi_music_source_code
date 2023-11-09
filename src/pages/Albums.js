import React, { useState, useEffect } from 'react'
import { BsCaretDown, BsCaretUp } from 'react-icons/bs'
import { BiArrowBack } from 'react-icons/bi'
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db } from '../config/fire'
import { AiFillCaretDown, AiFillCaretUp, AiOutlineShareAlt } from 'react-icons/ai'
import { Link } from 'react-router-dom'
import { Amplify, API, graphqlOperation, Auth, DataStore } from 'aws-amplify';
import { getAlbum, getSong, listAlbums } from '../graphql/queries'
import { updateSong } from '../graphql/mutations'
import awsconfig from '../aws-exports';
import ImageWithFallback from '../components/ImageWithFallback';
import album_art from '../components/fallbackImages/album_art.jpeg';
import { Helmet } from 'react-helmet'
import { IoPlay } from 'react-icons/io5'
import { formatNumber } from '../utilities/utility'
import ShareDrawer from '../components/Share'
import { Album, Song } from '../models'
Amplify.configure(awsconfig)
function Albums({ arr, setPlaylist, setIsBigPlayerVisible, setSelectedSong, selectedSong, triggerShouldFetch, setGlobalAlbums, setGlobalCategories }) {
    const [allAlbums, setAllAlbums] = useState(null)
    const [isAlbumVisible, setIsAlbumVisible] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [updatedArr, setUpdatedArr] = useState(arr);
    const [isShareVisible, setIsShareVisible] = useState(false)
    const [fullyLoaded, setFullyLoaded] = useState(false)
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };
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
        const sub = DataStore.observeQuery(Album).subscribe(snapshot => {
            const {items, isSynced} = snapshot
            let temp = []
            if (isSynced) {
              items.forEach((album) => {
                temp.push(album)
              })
              setAllAlbums(temp)
            }
          })
        // await API.graphql(graphqlOperation(listAlbums)).then((res) => {
        //     let temp = [];
        //     res.data?.listAlbums.items.forEach(doc => {
        //         console.log(doc);
        //         temp.push(doc);
        //     });
        //     setAllAlbums(temp);
        // })
        return () => {
            sub.unsubscribe()
        }
    }, [])
    useEffect(async () => {
        const queryString = (window.location.search);
        const RetrivedchildKey = (queryString.substring(1));
        const urlParams = new URLSearchParams(queryString);
        const mParam = urlParams.get('a');
        console.log(mParam)
        console.log(RetrivedchildKey)
        let sub
        if (RetrivedchildKey) {
            console.log(RetrivedchildKey);
            const string = mParam;
            const substring = '%2Falbums';
            let newString = string;
            console.log(string)
            if (string.includes(substring)){
                newString = string.split(substring)[0]
                console.log(newString);
            }
            const substring2 = '/albums';
            if (string.includes(substring2)){
                newString = string.split(substring2)[0]
                console.log(newString);
            }
            sub = DataStore.observeQuery(Album, (a) => a.key.eq(newString)).subscribe(({ items }) => {
                setSelectedAlbum(items[0])
                setIsAlbumVisible(true)
            })
            // await API.graphql(graphqlOperation(getAlbum, {key: newString})).then((res)=>{
            //     setSelectedAlbum(res.data?.getAlbum)
            //     setIsAlbumVisible(true)
            // });
        }
        setFullyLoaded(true)

        return () => {
            if (sub) {
                sub.unsubscribe()
            }
        }
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
    // useEffect(()=>{
    //     if (isAlbumVisible) {
    //         setPlaylist(updatedArr.filter((song)=> song?.partOf === selectedAlbum?.key))
    //         console.log(updatedArr.filter((song)=> song?.partOf === selectedAlbum?.key))
    //     }
    // }, [isAlbumVisible])
    const shareStyle = {
        position: 'fixed',
        bottom: '200px',
        right: '0px',
        backgroundColor: isHovered ? 'darkorange' : 'orange',
        height: '64px',
        width: '64px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: '0.2s ease',
      };
    if (isAlbumVisible) {
        console.log(selectedAlbum)
        return (
            <div className='page_container'>
                <Helmet>
                    <title>{`${selectedAlbum.name} Album | Hepi Music`}</title>
                    <meta name="description" content={`Listen to ${selectedAlbum} Album on Hepi Music`} />
                    <meta name="keywords" content={`Hepi, Music, Albums, ${selectedAlbum.name}, Songs, Stream, Play, Online music, Best`} />

                    {/*<!--  Essential META Tags -->*/}
                    <meta property="og:title" content={`${selectedAlbum.name} Album | Hepi Music`} />
                    <meta property="og:type" content="music.album" />
                    <meta property="og:image:width" content="500" />
                    <meta property="og:image:height" content="500" />
                    <meta property="og:image" content={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+selectedAlbum?.thumbnailKey)} />
                    <meta property="og:url" content={`https://hepimusic.com/albums?a=${selectedAlbum?.key}`} />
                    <meta name="twitter:card" content="summary_large_image" />

                    {/*<!--  Non-Essential, But Recommended -->*/}
                    <meta property="og:description" content={`Listen to ${selectedAlbum.name} Album on Hepi Music`} />
                    <meta property="og:site_name" content={`Hepi Music ${selectedAlbum.name}`} />
                    <meta name="twitter:image:alt" content={`Hepi Music ${selectedAlbum.name}`}></meta>
                </Helmet>
                <div style={{ width: '-webkit-fill-available', height: '55px', display: 'flex', alignItems: 'center' }}>
                    <BiArrowBack onClick={() => { setIsAlbumVisible(false) }} style={{ fontSize: '1.5em', color: '#f3b007', marginRight: '20px' }} />
                    <h4 style={{ margin: '0', color: '#f3b007' }}>{selectedAlbum.name} </h4>
                    <span onClick={() => { setIsShareVisible(true) }}><AiOutlineShareAlt style={{ margin: '10px', fontSize: '2em', color: '#f3b007', display: 'block' }} /></span>
                </div>
                <ShareDrawer isOpen={isShareVisible} setIsOpen={setIsShareVisible} id={selectedAlbum?.key} song={null} album={selectedAlbum ? selectedAlbum : null} />
                {/* <div onClick={() => { setIsShareVisible(true) }} style={shareStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <AiOutlineShareAlt style={{ margin: '10px', fontSize: '3em' }} />
                </div> */}

                {
                    updatedArr && updatedArr.sort((a, b) => (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse().map((one) => {
                        // console.log(one?.partOf, selectedAlbum.key);
                        if (!(one?.partOf && one.partOf === selectedAlbum?.key)) {
                            return (<></>)
                        }
                        return (
                            <>
                                <div onClick={() => { setPlaylist(updatedArr.filter((song)=> song?.partOf === selectedAlbum?.key)); setGlobalAlbums(allAlbums); setGlobalCategories([]); setSelectedSong(one); }} style={{ width: '-webkit-fill-available', borderBottom: '1px solid #6d6d6d', padding: '10px', display: 'flex' }}>
                                    <Link to={'/song'}>
                                        <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                            fallbackSrc={album_art}
                                            style={{ height: '50px', width: '50px', borderRadius: '5px', marginRight: '15px' }}
                                        />
                                    </Link>
                                    <div style={{ flex: '1' }}>
                                        <Link to={'/song'} style={{ textDecoration: 'none', color: '#fff' }}>
                                            <p style={{ fontSize: '0.9em', marginBottom: '0px' }}>{one.name}</p>
                                            <p style={{ fontSize: '0.8em', marginBottom: '0px' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/><span>{formatNumber(one?.listens?.length)}</span></em></p>
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
                <span className='render' style={{display: 'none'}}>Rendered</span>
            </div>
        )
    }
    if (fullyLoaded && !isAlbumVisible) return (
        <div className='page_container'>
            <Helmet>
                <title>{'Albums | Hepi Music'}</title>
                <meta name="description" content={`Albums on Hepi Music`} />
                <meta name="keywords" content={`Hepi, Music, Albums, Songs, Stream, Play, Online music, Best`} />

                {/*<!--  Essential META Tags -->*/}
                <meta property="og:title" content={`Albums | Hepi Music`} />
                <meta property="og:type" content="music.album" />
                <meta property="og:image:width" content="500" />
                <meta property="og:image:height" content="500" />
                <meta property="og:image" content="%PUBLIC_URL%/logo2.jpg" />
                <meta property="og:url" content="https://hepimusic.com/albums" />
                <meta name="twitter:card" content="summary_large_image" />

                {/*<!--  Non-Essential, But Recommended -->*/}
                <meta property="og:description" content={`Albums on Hepi Music`} />
                <meta property="og:site_name" content={`Hepi Music Albums`} />
                <meta name="twitter:image:alt" content={`Hepi Music Albums`}></meta>
            </Helmet>
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
            <span className='render' style={{display: 'none'}}>Rendered</span>
        </div>
    )

    return (<></>)
}

export default Albums