import React, { useState, useRef, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/fire';
import { Link } from 'react-router-dom';
import album_art from '../components/fallbackImages/album_art.jpeg'
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
import ImageWithFallback from '../components/ImageWithFallback';
import { Helmet } from 'react-helmet';
import { formatNumber } from '../utilities/utility';
import { IoPlay } from 'react-icons/io5';
Amplify.configure(awsconfig)
function Favorite({ setSelectedSong, setIsBigPlayerVisible, arr, setPlaylist }) {
    const [allSongs, setAllSongs] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    async function getCurrentUser(){
        const promise = new Promise(async function (resolve){
            await Auth.currentUserInfo().then((user)=>{
                resolve(user);
            });
        });

        return await promise;
    }
    useEffect(()=>{
        setAllSongs(arr)
    }, [arr])
    useEffect(async () => {
        await getCurrentUser().then((res)=>{
            console.log(res)
            setCurrentUser(res)
        })
    }, [allSongs]);
    // useEffect(() => {
    //     onSnapshot(collection(db, 'songs'), (snap) => {
    //         let temp = []
    //         snap.docs.forEach(doc => {
    //             temp.push(doc.data())
    //         })
    //         setAllSongs(temp)
    //     })
    // }, [])
    console.log('came');

    return (
        <div className='page_container' style={{ padding: '10px 0px' }}>
            <Helmet>
                <title>{`Favorites | Hepi Music`}</title>
                <meta name="description" content="All your favorite Kenyan hits in one place." />
                <meta name="keywords" content="Hepi, Music, Favorites, Songs, Stream, Play, Online music, Best" />

                {/*<!--  Essential META Tags -->*/}
                <meta property="og:title" content="Favorites | Hepi Music" />
                <meta property="og:type" content="music.album" />
                <meta property="og:image:width" content="500" />
                <meta property="og:image:height" content="500" />
                <meta property="og:image" content="%PUBLIC_URL%/logo2.jpg" />
                <meta property="og:url" content="https://hepimusic.com/fav" />
                <meta name="twitter:card" content="summary_large_image" />

                {/*<!--  Non-Essential, But Recommended -->*/}
                <meta property="og:description" content="All your favorite Kenyan hits in one place." />
                <meta property="og:site_name" content="Hepi Music Favorites" />
                <meta name="twitter:image:alt" content="Hepi Music Favorites"></meta>
            </Helmet>
            <h6 style={{ marginBottom: '15px', marginLeft: '10px' }}>Favorites</h6>
            <div style={{ padding: '10px 15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', width: '100%' }}>
                    {
                        allSongs && allSongs.filter(song => song.listOfUidUpVotes.includes(currentUser?.attributes?.sub)).map((one) => {
                            return (
                                <div onClick={() => { setPlaylist(allSongs.filter(song => song.listOfUidUpVotes.includes(currentUser?.attributes?.sub))); setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                    <Link to={'/song'}>
                                        <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                            fallbackSrc={album_art}
                                            style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                        />
                                    </Link>
                                    <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
                                    <p style={{ marginTop: '0px', paddingLeft: '5px' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/><span>{formatNumber(one.listens.length)}</span></em></p>
                                </div>
                            )
                        })
                    }
                    {
                        allSongs && allSongs.filter(song => song.listOfUidUpVotes.includes(currentUser?.attributes?.sub)).length === 0 &&
                        <center><p style={{ width: 'max-content', marginLeft: '10px' }}>Upvote songs to make them favorite</p></center>
                    }
                </div>
            </div>
            <br></br>
            <br></br>
            <br></br>
            <span className='render' style={{display: 'none'}}>Rendered</span>
        </div>
    )
}

export default Favorite