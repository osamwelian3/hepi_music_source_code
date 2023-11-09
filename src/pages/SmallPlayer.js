import React, { useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FaExpandArrowsAlt } from 'react-icons/fa';
import { TbArrowsMinimize } from 'react-icons/tb';
import { API, Amplify, DataStore, graphqlOperation } from 'aws-amplify';
import { Song } from '../models/index';
import { updateSong } from '../graphql/mutations';
import { v4 as uuidv4 } from "uuid";
import moment from 'moment';
function SmallPlayer({ selectedSong, setSelectedSong, allSongs, setAllSongs, userInfo, globalAlbums, globalCategories, setPlaylist, globalSongs, selectedCategory, setSelectedCategory }) {
    const [playedStreams, setPlayedStreams] = useState([]);
    const location = useLocation()
    const history = useHistory()
    console.log(allSongs)
    function next() {
        console.log(globalCategories);
        allSongs.filter((song, i) => {
            if (song.key === selectedSong.key) {
                console.log(i+1);
                console.log(allSongs.length)
                if ((i+1) === allSongs.length){
                    console.log('End of playlist, creating new playlist')
                    console.log(globalCategories)
                    console.log(globalAlbums)
                    if (globalCategories.length > 0){
                        for (let i = 0; i < globalCategories.length; i++) {
                            let category = globalCategories[i];
                            let index = i;
                        //globalCategories.forEach((category, index) => {
                            if (selectedCategory === category?.name) {
                                if ((index+1) !== globalCategories.length){
                                    if (selectedCategory === "Top 50") {
                                        const tempPlaylist = globalSongs.filter((song) => { const created = moment(song.createdAt); const threeDaysAgo = moment().subtract(3, 'days'); return created.isAfter(threeDaysAgo); }).sort((a,b)=> a.createdAt - b.createdAt).reverse()
                                        setPlaylist(tempPlaylist)
                                        setSelectedSong(tempPlaylist[0])
                                        setSelectedCategory('')
                                        break
                                    } else if (selectedCategory === "Latest release"){
                                        console.log([...globalSongs.filter(song => song.selectedCategory === globalCategories[index+1].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()]);
                                        setPlaylist([...globalSongs.filter(song => song.selectedCategory === globalCategories[index+1].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()])
                                        const tempPlaylist = [...globalSongs.filter(song => song.selectedCategory === globalCategories[index+1].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()]
                                        console.log(tempPlaylist[0])
                                        setSelectedSong(tempPlaylist[0])
                                        setSelectedCategory('')
                                        break
                                    }
                                } else {
                                    const tempPlaylist = globalSongs.filter((song) => { const created = moment(song.createdAt); const threeDaysAgo = moment().subtract(3, 'days'); return created.isAfter(threeDaysAgo); }).sort((a,b)=> a.createdAt - b.createdAt).reverse()
                                    setPlaylist(tempPlaylist)
                                    setSelectedSong(tempPlaylist[0])
                                    setSelectedCategory('')
                                    break
                                }
                            } else if (selectedSong?.selectedCategory === category?.name) {
                                console.log(globalCategories[index])
                                console.log(globalCategories[index+1])
                                if ((index+1) !== globalCategories.length) {
                                    if (globalCategories[index+1].name === "Top 50"){
                                        const tempPlaylist = globalSongs.sort((a, b) => (a?.listOfUidUpVotes?.length + a?.listens?.length - a?.listOfUidDownVotes?.length) - (b?.listOfUidUpVotes?.length + b?.listens?.length - b?.listOfUidDownVotes?.length)).reverse().slice(0, 50)
                                        setPlaylist(tempPlaylist)
                                        console.log(tempPlaylist[0])
                                        setSelectedSong(tempPlaylist[0])
                                        setSelectedCategory('Top 50')
                                        break
                                    }
                                    console.log('not equal')
                                    console.log([...globalSongs.filter(song => song.selectedCategory === globalCategories[index+1].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()]);
                                    setPlaylist([...globalSongs.filter(song => song.selectedCategory === globalCategories[index+1].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()])
                                    const tempPlaylist = [...globalSongs.filter(song => song.selectedCategory === globalCategories[index+1].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()]
                                    console.log(tempPlaylist[0])
                                    setSelectedSong(tempPlaylist[0])
                                    break
                                } else {
                                    console.log('equal')
                                    setPlaylist([...globalSongs.filter(song => song.selectedCategory === globalCategories[0].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()])
                                    const tempPlaylist = [...globalSongs.filter(song => song.selectedCategory === globalCategories[0].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()]
                                    console.log(tempPlaylist[0])
                                    setSelectedSong(tempPlaylist[0])
                                    break
                                }
                            }
                        }//)
                    } else if (globalAlbums.length > 0){
                        globalAlbums.filter((album, index) => {
                            if (selectedSong?.partOf === album?.key) {
                                console.log(globalAlbums[index])
                                console.log(globalAlbums[index+1])
                                if ((index+1) !== globalAlbums.length) {
                                    console.log('not equal')
                                    console.log([...globalSongs.filter(song => song.partOf === globalAlbums[index+1].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()]);
                                    setPlaylist([...globalSongs.filter(song => song.partOf === globalAlbums[index+1].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()])
                                    const tempPlaylist = [...globalSongs.filter(song => song.partOf === globalAlbums[index+1].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()]
                                    console.log(tempPlaylist[0])
                                    setSelectedSong(tempPlaylist[0])
                                } else {
                                    console.log('equal')
                                    setPlaylist([...globalSongs.filter(song => song.partOf === globalAlbums[0].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()])
                                    const tempPlaylist = [...globalSongs.filter(song => song.partOf === globalAlbums[0].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()]
                                    console.log(tempPlaylist[0])
                                    setSelectedSong(tempPlaylist[0])
                                }
                            }
                        })
                    } else {
                        setSelectedSong(allSongs[0])
                    }
                } else {
                    setSelectedSong(allSongs[i + 1])
                }
            }
        });
    }
    function prev() {
        allSongs.filter((song, i) => {
            if (song.key === selectedSong.key) {
                console.log(i);
                console.log(i-1)
                if ((i-1) < 0){
                    console.log('End of playlist, creating new playlist')
                    console.log(globalCategories)
                    console.log(globalAlbums)
                    if (globalCategories.length > 0){
                        for (let i = globalCategories.length-1; i >= 0; i--) {
                            let category = globalCategories[i];
                            let index = i;
                        //globalCategories.filter((category, index) => {
                            console.log(selectedCategory)
                            console.log(globalCategories[index-1]?.name)
                            if (selectedCategory === category?.name){
                                if (selectedCategory === "Top 50") {
                                    console.log([...globalSongs.filter(song => song.selectedCategory === globalCategories[globalCategories.length-2].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()]);
                                    setPlaylist([...globalSongs.filter(song => song.selectedCategory === globalCategories[globalCategories.length-2].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()])
                                    const tempPlaylist = [...globalSongs.filter(song => song.selectedCategory === globalCategories[globalCategories.length-2].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()]
                                    console.log(tempPlaylist[tempPlaylist.length-1])
                                    setSelectedSong(tempPlaylist[tempPlaylist.length-1])
                                    setSelectedCategory('')
                                    break
                                } else if (selectedCategory === "Latest release"){
                                    const tempPlaylist = globalSongs.sort((a, b) => (a?.listOfUidUpVotes?.length + a?.listens?.length - a?.listOfUidDownVotes?.length) - (b?.listOfUidUpVotes?.length + b?.listens?.length - b?.listOfUidDownVotes?.length)).reverse().slice(0, 50)
                                    setPlaylist(tempPlaylist)
                                    setSelectedSong(tempPlaylist[tempPlaylist.length-1])
                                    setSelectedCategory('Top 50')
                                    break
                                }
                            } else if (selectedSong?.selectedCategory === category?.name) {
                                console.log(globalCategories[index])
                                console.log(globalCategories[index+1])
                                if ((index-1) >= 0) {
                                    if (globalCategories[index-1].name === "Latest release"){
                                        const tempPlaylist = globalSongs.filter((song) => { const created = moment(song.createdAt); const threeDaysAgo = moment().subtract(3, 'days'); return created.isAfter(threeDaysAgo); }).sort((a,b)=> a.createdAt - b.createdAt).reverse()
                                        setPlaylist(tempPlaylist)
                                        setSelectedSong(tempPlaylist[tempPlaylist.length-1])
                                        setSelectedCategory('Latest release')
                                        break
                                    }
                                    console.log('not equal')
                                    console.log([...globalSongs.filter(song => song.selectedCategory === globalCategories[index-1].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()]);
                                    setPlaylist([...globalSongs.filter(song => song.selectedCategory === globalCategories[index-1].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()])
                                    const tempPlaylist = [...globalSongs.filter(song => song.selectedCategory === globalCategories[index-1].name).sort((a,b)=> a.createdAt - b.createdAt).reverse()]
                                    console.log(tempPlaylist[tempPlaylist.length-1])
                                    setSelectedSong(tempPlaylist[tempPlaylist.length-1])
                                    break
                                } else {
                                    console.log('equal')
                                    const tempPlaylist = globalSongs.sort((a, b) => (a?.listOfUidUpVotes?.length + a?.listens?.length - a?.listOfUidDownVotes?.length) - (b?.listOfUidUpVotes?.length + b?.listens?.length - b?.listOfUidDownVotes?.length)).reverse().slice(0, 50)
                                    setPlaylist(tempPlaylist)
                                    console.log(tempPlaylist[tempPlaylist.length-1])
                                    setSelectedSong(tempPlaylist[tempPlaylist.length-1])
                                    break
                                }
                            }
                        }//)
                    } else if (globalAlbums.length > 0){
                        globalAlbums.filter((album, index) => {
                            if (selectedSong?.partOf === album?.key) {
                                console.log(globalAlbums[index])
                                console.log(globalAlbums[index-1])
                                if ((index-1) >= 0) {
                                    console.log('not equal')
                                    console.log([...globalSongs.filter(song => song.partOf === globalAlbums[index-1].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()]);
                                    setPlaylist([...globalSongs.filter(song => song.partOf === globalAlbums[index-1].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()])
                                    const tempPlaylist = [...globalSongs.filter(song => song.partOf === globalAlbums[index-1].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()]
                                    console.log(tempPlaylist[tempPlaylist.length-1])
                                    setSelectedSong(tempPlaylist[tempPlaylist.length-1])
                                } else {
                                    console.log('equal')
                                    setPlaylist([...globalSongs.filter(song => song.partOf === globalAlbums[globalAlbums.length-1].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()])
                                    const tempPlaylist = [...globalSongs.filter(song => song.partOf === globalAlbums[globalAlbums.length-1].key).sort((a,b)=> (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+b?.listens?.length)).reverse()]
                                    console.log(tempPlaylist[tempPlaylist.length-1])
                                    setSelectedSong(tempPlaylist[tempPlaylist.length-1])
                                }
                            }
                        })
                    } else {
                        setSelectedSong(allSongs[allSongs.length-1])
                    }
                } else {
                    setSelectedSong(allSongs[i - 1])
                }
            }
        });
    }
    if (location.pathname === '/login' || location.pathname === '/admin' || location.pathname === '/profile' || location.pathname === '/aboutus' || location.pathname === '/privacy') {
        return (<></>)
    }
    const minimizeBtn = async () => {
        try {
            const queryString = (window.location.search);
            const RetrivedchildKey = (queryString.substring(1));
            if (RetrivedchildKey){
                history.push('/')
            } else {
                history.goBack()
            }
        } catch (error){
            history.goBack()
        }
        
    }

    const onPlayCallback = async () => {
        console.log('on Play')
        console.log(allSongs)

        // Check if the stream has already been played
        const hasPlayed = playedStreams.includes(selectedSong?.key);
        if (!hasPlayed) {
            const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...song } = selectedSong
            const modifiedSong = {...song, listens: song.listens ? [...song.listens, userInfo ? userInfo?.attributes?.sub : `Anonymous${uuidv4().slice(0, 4)}`] : [userInfo ? userInfo?.attributes?.sub : `Anonymous${uuidv4().slice(0, 4)}`], trendingListens: song.trendingListens ? [...song.trendingListens, userInfo ? JSON.stringify({timestamp: moment().toDate(), listen: userInfo?.attributes?.sub}) : JSON.stringify({timestamp: moment().toDate(), listen: `Anonymous${uuidv4().slice(0, 4)}`})] : [userInfo ? JSON.stringify({timestamp: moment().toDate(), listen: userInfo?.attributes?.sub}) : JSON.stringify({timestamp: moment().toDate(), listen: `Anonymous${uuidv4().slice(0, 4)}`})] }
            console.log(modifiedSong)
            const clearedListens = {...modifiedSong, listens: [], trendingListens: []}
            clearedListens.listens = []
            clearedListens.trendingListens = []
            console.log("clearedListens")
            console.log(clearedListens)

            const original = await DataStore.query(Song, selectedSong?.key)
            if (original) {
                console.log('DataStore fetch Song Success')
                const updatedSong = await DataStore.save(
                    Song.copyOf(original, updated => {
                        updated.listens = [...original.listens, userInfo ? userInfo?.attributes?.sub : `Anonymous${uuidv4().slice(0, 4)}`]
                    })
                )
                if (updatedSong) {
                    console.log('DataStore Update Song Success')
                } else {
                    console.log('DataStore Update Song Failed')
                }
            } else {
                console.log('DataStore fetch Song Failed')
            }

            // await API.graphql(graphqlOperation(updateSong, { input: clearedListens })).then(async (res)=>{
            //     console.log(res);
            //     await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
            //         setSelectedSong((prevState) => {
            //             const newState = {...prevState}
            //             newState.listens = res?.data?.updateSong?.listens;
            //             newState.trendingListens = res?.data?.updateSong?.trendingListens;
            //             return newState
            //         })
            //         setAllSongs((prevSongs) => {
            //             // Make a copy of the songs list
            //             const updatedSongs = [...prevSongs];
                
            //             // Find the object with the specific id
            //             const foundSong = updatedSongs.find((song) => song.key === res?.data?.updateSong?.key);
                
            //             // Modify the listens property of the found object
            //             if (foundSong) {
            //                 foundSong.listens = res?.data?.updateSong?.listens;
            //                 foundSong.trendingListens = res?.data?.updateSong?.trendingListens;
            //             }
                
            //             // Return the updated songs list
            //             return updatedSongs;
            //         });
    
            //         // Add the stream key to the playedStreams array
            //         setPlayedStreams((prevPlayedStreams) => [...prevPlayedStreams, modifiedSong.key]);
            //         console.log('listen added succesfuly')
            //     }).catch((error) => {
            //         console.log(error)
            //     })
            // }).catch((error)=>{
            //     console.log(error);
            // })
        }
    }

    return (
        <div className='detail_modal' style={{ height: 'min-content', maxHeight: 'max-content', width: '100vw', position: 'fixed', display: location.pathname === '/login' ? 'none' : 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bottom: '0px', left: '0', zIndex: '99', background: '#000' }}>
            <AudioPlayer
                autoPlay
                src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+selectedSong?.fileKey)}
                onPlay={e => onPlayCallback()}
                // onListen={e => console.log(e.target.currentTime)}
                style={{ maxWidth: '450px' }}
                showSkipControls={true}
                showJumpControls={false}
                onClickNext={() => { next() }}
                onClickPrevious={() => { prev() }}
                onEnded={() => { next() }}
                crossOrigin='allow'
                customVolumeControls={
                    [
                        <FaExpandArrowsAlt style={{ color: '#fff', margin: '0px 5px', color: '#000' }} />
                    ]
                }
                customAdditionalControls={
                    location.pathname !== '/song' ?
                        [

                            <Link to={'/song'}>
                                <FaExpandArrowsAlt style={{ color: '#aaa', margin: '0px 5px', fontSize: '1.2em' }} />
                            </Link>
                        ]
                        :
                        [
                            <TbArrowsMinimize onClick={() => { minimizeBtn() }} style={{ color: '#aaa', margin: '0px 5px', fontSize: '1.2em' }} />

                        ]
                }
            />
        </div>
    )
}

export default SmallPlayer