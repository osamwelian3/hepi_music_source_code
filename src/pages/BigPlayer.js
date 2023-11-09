import React, { useState, useEffect } from "react"
import AudioPlayer from 'react-h5-audio-player';
import { AiFillCloseCircle, AiOutlineShareAlt } from "react-icons/ai";
import { SocialIcon } from "react-social-icons";
import { BsCaretDown, BsCaretUp } from "react-icons/bs";

import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { auth, db } from "../config/fire";
import ShareDrawer from "../components/Share";
import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc } from "firebase/firestore";
import { Amplify, API, graphqlOperation, Auth, DataStore } from "aws-amplify";
import { getSong } from "../graphql/queries";
import { updateSong } from '../graphql/mutations';
import awsconfig from '../aws-exports';
import ImageWithFallback from "../components/ImageWithFallback";
import album_art from '../components/fallbackImages/album_art.jpeg';
import { Helmet } from "react-helmet";
import { IoPlay } from "react-icons/io5";
import { formatNumber } from "../utilities/utility";
import { Song } from "../models";
Amplify.configure(awsconfig);
function BigPlayer({ selectedSong, setSelectedSong, triggerShouldFetch }) {
    const [isShareVisible, setIsShareVisible] = useState(false)
    const [liveSong, setLiveSong] = useState(null)
    const [liveSongB, setLiveSongB] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
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
    }, [selectedSong]);
    console.log(currentUser?.attributes.sub)
    useEffect(async () => {
        const queryString = (window.location.search);
        const RetrivedchildKey = (queryString.substring(1));
        const urlParams = new URLSearchParams(queryString);
        const mParam = urlParams.get('m');
        console.log(mParam)
        console.log(RetrivedchildKey)
        console.log(selectedSong)
        let sub
        if (selectedSong) {
            console.log(selectedSong)

            sub = DataStore.observeQuery(Song, (s) => s.key.eq(selectedSong?.key)).subscribe(({ items }) => {
                setLiveSong(items[0])
                setLiveSongB(items[0])
            })
            
            // await API.graphql(graphqlOperation(getSong, {key: selectedSong?.key})).then((res)=>{
            //     setLiveSong(res.data?.getSong);
            //     setLiveSongB(res.data?.getSong);
            // });
        } else if (RetrivedchildKey) {
            console.log(RetrivedchildKey);
            const string = mParam;
            const substring = '%2Fsong';
            let newString = string;
            console.log(string)
            if (string.includes(substring)){
                newString = string.split(substring)[0]
                console.log(newString);
            }
            const substring2 = '/song';
            if (string.includes(substring2)){
                newString = string.split(substring2)[0]
                console.log(newString);
            }

            sub = DataStore.observeQuery(Song, (s) => s.key.eq(newString)).subscribe(({ items }) => {
                setLiveSong(items[0])
                setLiveSongB(items[0])
                setSelectedSong(items[0])
            })
            
            // await API.graphql(graphqlOperation(getSong, {key: newString})).then((res)=>{
            //     setLiveSong(res.data?.getSong);
            //     setLiveSongB(res.data?.getSong);
            //     setSelectedSong(res.data?.getSong)
            // });
        }

        return () => {
            if (sub) {
                sub.unsubscribe()
            }
        }
    }, [selectedSong])

    async function upVote(key) {
        const updatedSong = {
            ...liveSong,
            listOfUidUpVotes: [...liveSong.listOfUidUpVotes, currentUser?.attributes?.sub],
            listOfUidDownVotes: liveSong.listOfUidDownVotes.filter(
              (uid) => uid !== currentUser?.attributes?.sub
            ),
          }
        setLiveSong(updatedSong);
        
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
        const updatedSong = {
            ...liveSong,
            listOfUidDownVotes: [...liveSong.listOfUidDownVotes, currentUser?.attributes?.sub],
            listOfUidUpVotes: liveSong.listOfUidUpVotes.filter(
              (uid) => uid !== currentUser?.attributes?.sub
            ),
          }
        setLiveSong(updatedSong);

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
                const updatedSng = {
                    ...liveSong,
                    listOfUidDownVotes: [...liveSong.listOfUidDownVotes],
                    listOfUidUpVotes: liveSong.listOfUidUpVotes.filter(
                        (uid) => uid !== currentUser?.attributes?.sub
                    ),
                    }
                setLiveSong(updatedSng);
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
                const updatedSng = {
                    ...liveSong,
                    listOfUidUpVotes: [...liveSong.listOfUidUpVotes],
                    listOfUidDownVotes: liveSong.listOfUidDownVotes.filter(
                        (uid) => uid !== currentUser?.attributes?.sub
                    ),
                    };
                setLiveSong(updatedSng);
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
        //         const updatedSong = {
        //             ...liveSong,
        //             listOfUidDownVotes: [...liveSong.listOfUidDownVotes],
        //             listOfUidUpVotes: liveSong.listOfUidUpVotes.filter(
        //               (uid) => uid !== currentUser?.attributes?.sub
        //             ),
        //           }
        //         setLiveSong(updatedSong);
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
        //         const updatedSong = {
        //             ...liveSong,
        //             listOfUidUpVotes: [...liveSong.listOfUidUpVotes],
        //             listOfUidDownVotes: liveSong.listOfUidDownVotes.filter(
        //               (uid) => uid !== currentUser?.attributes?.sub
        //             ),
        //           };
        //         setLiveSong(updatedSong);
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
    return (
        <div className='detail_modal' style={{ height: '100vh', maxHeight: 'max-content', width: '100vw', position: 'fixed', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', top: '0px', left: '0', zIndex: '99', background: '#000' }}>
            <Helmet>
                <title>{liveSong ? `${liveSong?.name}` : `No song selected`} | Hepi Music</title>
                <meta name="description" content={liveSong ? `Play ${liveSong?.name} on Hepi Music` : `No song selected`} />
                <meta name="keywords" content={liveSong ? `${liveSong?.name}, Hepi, Music, Songs, Stream, Play, Online music, Best` : ``} />

                {/*<!--  Essential META Tags -->*/}
                <meta property="og:title" content={liveSong ? `${liveSong?.name} | Hepi Music` : `No song selected | Hepi Music`} />
                <meta property="og:type" content="song" />
                <meta property="og:image:width" content="500" />
                <meta property="og:image:height" content="500" />
                <meta property="og:image" content={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+liveSong?.thumbnailKey)} />
                <meta property="og:url" content={`https://hepimusic.com/song?m=${liveSong?.key}`} />
                <meta name="twitter:card" content="summary_large_image" />

                {/*<!--  Non-Essential, But Recommended -->*/}
                <meta property="og:description" content={liveSong ? `Play ${liveSong?.name} on Hepi Music` : `No song selected`} />
                <meta property="og:site_name" content={liveSong ? `Play ${liveSong?.name} on Hepi Music` : `No song selected`} />
                <meta name="twitter:image:alt" content={liveSong ? `${liveSong?.name} | Hepi Music` : 'Hepi Music'}></meta>
            </Helmet>
            {/* helmet here waits for the livesong to be set so listen to it */}
            { liveSong && <span className='render' style={{display: 'none'}}>Rendered</span> }
            <ShareDrawer isOpen={isShareVisible} setIsOpen={setIsShareVisible} id={liveSong?.key} song={liveSong ? liveSong : null} album={null} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div onClick={() => { setIsShareVisible(true) }} style={{ position: 'absolute', display: 'flex', alignItems: 'center', color: '#f3b007', top: '10px', left: '10px' }}>
                    <AiOutlineShareAlt style={{ margin: '10px', fontSize: '2em', color: '#f3b007' }} />Share
                </div>
                <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+liveSong?.thumbnailKey)}
                    fallbackSrc={album_art}
                    style={{ height: '170px', width: '170px', borderRadius: '20px' }}
                />
                <h4 style={{ margin: '0px', textAlign: 'center', marginBottom: '20px', marginTop: '8px' }}>{liveSong?.name}</h4>
                <p style={{ color: 'white', marginTop: '3px', maxWidth: '150px', fontSize: '1.1em', marginBottom: '0px' }}><em style={{display: 'flex'}}>{liveSong ? <><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/><>{formatNumber(liveSong?.listens?.length)}</></> : ''}</em></p>
                <div style={{ display: 'flex', background: '#00000050', justifyContent: 'space-around', border: '1px solid #505050', borderRadius: '50vh', width: '180px', margin: '10px 0px' }}>
                    {
                        currentUser?.attributes?.sub &&
                        <div style={{ flex: '0.5', display: 'flex' }}>
                            {
                                liveSong?.listOfUidUpVotes?.includes(currentUser?.attributes?.sub) ?
                                    <div onClick={async () => { await removeVote(liveSong.key, 'upVote').catch((error) => { setLiveSong(liveSongB); alert(`There was a problem removing your upvote on ${liveSong?.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#f3b007' }}>
                                        {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                        <AiFillCaretUp style={{ fontSize: '1.7em', color: '#f3b007' }} />
                                        {liveSong?.listOfUidUpVotes?.length}
                                    </div>
                                    :
                                    <div onClick={async () => { await upVote(liveSong.key).catch((error) => { setLiveSong(liveSongB); alert(`There was a problem upVoting ${liveSong?.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#ccc' }}>
                                        {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                        <BsCaretUp style={{ fontSize: '1.7em' }} />
                                        {liveSong?.listOfUidUpVotes?.length}
                                    </div>
                            }
                            {
                                liveSong?.listOfUidDownVotes?.includes(currentUser?.attributes?.sub) ?
                                    <div onClick={async () => { await removeVote(liveSong.key, 'downVote').catch((error) => { setLiveSong(liveSongB); alert(`There was a problem removing your downVote on ${liveSong?.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#f3b007' }}>
                                        {/* <AiFillCaretDown style={{ fontSize: '1.7em' }} /> */}
                                        <AiFillCaretDown style={{ fontSize: '1.7em', color: '#f3b007' }} />
                                        {liveSong?.listOfUidDownVotes?.length}
                                    </div>
                                    :
                                    <div onClick={async () => { await downVote(liveSong.key).catch((error) => { setLiveSong(liveSongB); alert(`There was a problem downVoting ${liveSong?.name}. Ensure you have an internet connection.`); console.log(error);}) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#ccc' }}>
                                        {/* <AiFillCaretDown style={{ fontSize: '1.7em' }} /> */}
                                        <BsCaretDown style={{ fontSize: '1.7em' }} />
                                        {liveSong?.listOfUidDownVotes?.length}
                                    </div>
                            }
                        </div>
                    }
                    {
                        !currentUser &&
                        <div onClick={(e) => { e.stopPropagation(); alert('Please Login or register to vote a song.') }} style={{ flex: '0.5', display: 'flex' }}>
                            {
                                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#ccc' }}>
                                    {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                    <BsCaretUp style={{ fontSize: '1.7em' }} />
                                    {liveSong?.listOfUidUpVotes?.length}
                                </div>
                            }
                            {
                                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#ccc' }}>
                                    {/* <AiFillCaretDown style={{ fontSize: '1.7em' }} /> */}
                                    <BsCaretDown style={{ fontSize: '1.7em' }} />
                                    {liveSong?.listOfUidDownVotes?.length}
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>
            {/* <AudioPlayer
                autoPlay
                src={liveSong?.fileUrl}
                onPlay={e => console.log("on Play")}
                style={{ maxWidth: '450px' }}
            /> */}
            {
                liveSong?.selectedCreator &&
                <div>
                    <h3 style={{ width: '-webkit-fill-available', margin: '15px', marginTop: '0px', maxWidth: '400px' }}>Creator</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '10px 10px', height: 'max-content', padding: '15px', borderRadius: '50vh', marginBottom: '0' }}>
                        <div>
                            <img style={{ height: '60px', marginLeft: '0px', marginRight: '15px', width: '60px', borderRadius: '50vh' }} src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+JSON.parse(liveSong?.selectedCreator)?.thumbnailKey) } />
                        </div>
                        <div style={{ flex: '1' }}>
                            <h3 style={{ color: '#fff' }}>{JSON.parse(liveSong?.selectedCreator)?.name}</h3>
                            <h6 style={{ color: '#fff', padding: '0px 10px', paddingLeft: '0', marginBottom: '0' }}>{JSON.parse(liveSong?.selectedCreator)?.desc}</h6>
                        </div>
                    </div>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                        <SocialIcon url={`https://twitter.com/${JSON.parse(liveSong?.selectedCreator)?.twitter}`} bgColor="#00000000" fgColor="#007bff" style={{ marginRight: '15px' }} />
                        <SocialIcon url={`https://www.instagram.com/${JSON.parse(liveSong?.selectedCreator)?.instagram}`} bgColor="#00000000" fgColor="#e94475" style={{ marginRight: '15px' }} />
                        <SocialIcon url={`https://www.facebook.com/${JSON.parse(liveSong?.selectedCreator)?.facebook}`} bgColor="#00000000" fgColor="#3b5998" style={{ marginRight: '15px' }} />
                        <SocialIcon url={`https://www.youtube.com/${JSON.parse(liveSong?.selectedCreator)?.youtube}`} bgColor="#00000000" fgColor="#ff3333" style={{ marginRight: '15px' }} />
                    </div>
                </div>
            }
        </div>
    )
}
export default BigPlayer