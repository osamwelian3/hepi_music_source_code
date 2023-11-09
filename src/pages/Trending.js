import React, { useState, useEffect } from 'react';
import { IoPlay } from 'react-icons/io5'
import { BsCaretDown, BsCaretUp } from 'react-icons/bs';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Amplify, API, Auth, graphqlOperation } from 'aws-amplify';
import { getSong, listSongs } from '../graphql/queries';
import { updateSong } from '../graphql/mutations';
import awsconfig from '../aws-exports';
import ImageWithFallback from '../components/ImageWithFallback';
import album_art from '../components/fallbackImages/album_art.jpeg';
import { Helmet } from 'react-helmet';
import { formatNumber, timelineFormat } from '../utilities/utility';
Amplify.configure(awsconfig);
function Trending({ setSelectedSong, arr, setPlaylist, setIsBigPlayerVisible, selectedSong, triggerShouldFetch }) {
    const [updatedArr, setUpdatedArr] = useState(arr);
    const [mainFil, setMainFil] = useState(10)
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

    useEffect(()=>{
        if(arr){
            // Assume you have fetched the list of songs and stored them in the 'songs' array
            console.log(arr)
            const songs = [...arr]; // Array of songs fetched from your database
            console.log(songs)

            // Function to filter the listenCount array to include only listens within the last 3 days
            function filterListenCount(listenCount) {
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

                // Parse the stringified JSON objects and filter by timestamp
                const filteredListens = listenCount
                    .map(JSON.parse) // Parse the stringified JSON objects back to JavaScript objects
                    .filter(listen => new Date(listen.timestamp) >= threeDaysAgo);

                // Stringify the filtered listens back to JSON
                console.log(filteredListens.map(JSON.stringify))
                return filteredListens.map(JSON.stringify);
            }

            // console.log(filterListenCount(['{"timestamp":"2023-07-20T16:06:53.702Z","listen":"91d34d2a-3001-7095-546c-6df22cb9d8a2"}', '{"timestamp":"2023-07-19T16:06:53.702Z","listen":"91d34d2a-3001-7095-546c-6df22cb9d8a3"}', '{"timestamp":"2023-07-18T16:06:53.702Z","listen":"91d34d2a-3001-7095-546c-6df22cb9d8a4"}', '{"timestamp":"2023-07-17T16:06:53.702Z","listen":"91d34d2a-3001-7095-546c-6df22cb9d8a5"}']))

            // Iterate through the songs and update their listenCount arrays
            songs.forEach(song => {
                song.trendingListens = song?.trendingListens ? filterListenCount(song?.trendingListens) : [];
            });

            console.log(songs.filter(song => song?.trendingListens.length > 0 ))
            setUpdatedArr(songs.filter(song => song?.trendingListens.length > 0 ))
        }
    }, [arr])

    async function upVote(key) {
        const updateArr = updatedArr.map((item) => {
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
        await API.graphql(graphqlOperation(getSong, {key: key})).then(async (getRes)=>{
            console.log(getRes.data?.getSong.listOfUidUpVotes);
            let temp = [];
            temp = temp.concat(getRes.data?.getSong.listOfUidUpVotes);
            const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = getRes.data?.getSong
            temp.push(currentUser?.attributes?.sub)
            modifiedSong.listOfUidUpVotes = temp;
            modifiedSong.listOfUidDownVotes = getRes.data?.getSong.listOfUidDownVotes.filter(item => item !== currentUser?.attributes?.sub)
            console.log(modifiedSong);
            await API.graphql(graphqlOperation(updateSong, {input: modifiedSong})).then((res)=>{
                console.log(res);
                triggerShouldFetch();
            });
        })
    }
    async function downVote(key) {
        const updateArr = updatedArr.map((item) => {
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
        await API.graphql(graphqlOperation(getSong, {key: key})).then(async (getRes)=>{
            console.log(getRes.data?.getSong.listOfUidUpVotes);
            const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = getRes.data?.getSong
            modifiedSong.listOfUidUpVotes = [];
            modifiedSong.listOfUidDownVotes = [];
            if (voteType === 'upVote'){
                const updateArr = updatedArr.map((item) => {
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
                const updateArr = updatedArr.map((item) => {
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
    console.log(updatedArr.reverse().slice(0, mainFil).length);
    if (updatedArr.reverse().slice(0, mainFil).length <= 0) {
        return (
            <div className='page_container'>
                <p>There are no trending songs at the moment, check out our <Link style={{color: '#f3b007', textDecoration: 'none'}} to='/'>Library</Link> for all your favorite Kenyan content.</p>
            </div>
        )
    }
    return ( 
        <div className='page_container'>
            <Helmet>
                <title>{'Trending | Hepi Music'}</title>
                <meta name="description" content={`Trending on Hepi Music`} />
                <meta name="keywords" content="Hepi, Music, Trending, Songs, Stream, Play, Online music, Best" />

                {/*<!--  Essential META Tags -->*/}
                <meta property="og:title" content="Trending | Hepi Music" />
                <meta property="og:type" content="music.album" />
                <meta property="og:image:width" content="500" />
                <meta property="og:image:height" content="500" />
                <meta property="og:image" content="%PUBLIC_URL%/logo2.jpg" />
                <meta property="og:url" content="https://hepimusic.com/trending" />
                <meta name="twitter:card" content="summary_large_image" />

                {/*<!--  Non-Essential, But Recommended -->*/}
                <meta property="og:description" content={`Trending on Hepi Music`} />
                <meta property="og:site_name" content="Trending Songs on Hepi Music" />
                <meta name="twitter:image:alt" content="Trending Songs on Hepi Music"></meta>
            </Helmet>
            <h6 style={{ marginBottom: '15px' }}>Trending</h6>
            {/* <select value={mainFil} onChange={(e) => { setMainFil(e.target.value) }} className='btn' style={{ width: '-webkit-fill-available', padding: '10px 0px', maxWidth: '400px', color: '#f3b007', background: '#151515' }}>
                <option value={10}>Top 10 trending</option>
                <option value={20}>Top 20 trending</option>
                <option value={100}>Top 100 trending</option>
            </select> */}
            <hr></hr>
            {
                updatedArr && updatedArr.sort((a,b)=>{return (a?.trendingListens?.length || 0) - (b?.trendingListens?.length || 0)}).reverse().slice(0, mainFil).map((one, index) => {
                    return (
                        <>
                            <div  onClick={() => { setPlaylist(updatedArr?.sort((a,b)=>{return (a?.trendingListens?.length || 0) - (b?.trendingListens?.length || 0)}).reverse()); setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '-webkit-fill-available', padding: '10px', borderBottom: '1px solid #6d6d6d', display: 'flex' }}>
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
                                        <p style={{ fontSize: '0.8em', color: '#ccc', margin: '0' }}>{timelineFormat(one?.createdAt)}</p>
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
     );
}

export default Trending;