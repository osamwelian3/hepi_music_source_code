import { collection, onSnapshot } from 'firebase/firestore';
import React, { useState, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'
import { IoCloseSharp, IoPlay } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import '../components/mp.css';
import { db } from '../config/fire';
import ImageWithFallback from '../components/ImageWithFallback';
import album_art from '../components/fallbackImages/album_art.jpeg';
import Helmet from 'react-helmet';
import { v4 as uuidv4 } from 'uuid'

import { Amplify, Storage, API, graphqlOperation, DataStore } from 'aws-amplify';
import { listCategories } from '../graphql/queries';
import awsconfig from '../aws-exports';
import { updateSong } from '../graphql/mutations';
import { formatNumber } from '../utilities/utility';
import moment from 'moment';
import { Category } from '../models';
Amplify.configure(awsconfig);
function Library({ setSelectedSong, setIsBigPlayerVisible, arr, setPlaylist, setSelectedCategory, setGlobalCategories, setGlobalAlbums }) {
    const [allCategories, setAllCategories] = useState([])
    const [currentImage, setCurrentImage] = useState();
    const [q, setQ] = useState('')
    useEffect(async () => {
        DataStore.observeQuery(Category).subscribe(snapshot => {
            const {items, isSynced} = snapshot
            let temp = []
            if (isSynced) {
              items.forEach((category) => {
                temp.push(category)
              })
              setAllCategories(temp)
            }
          })
        // await API.graphql(graphqlOperation(listCategories)).then((res)=>{
        //     let temp = []
        //     res.data?.listCategories.items.forEach(async doc => {
        //         temp.push(doc)
        //     });
        //     setAllCategories(temp.reverse())
        // }).catch((error)=>{
        //     console.log(error);
        // });
    }, [])

    // useEffect(async ()=>{
    //     // getImage('images/mmi u fine.jpg')
    // }, [])
    // function getImage(key){
    //     let promise = new Promise()
    //     const image = await Storage.get(key);
    //     setCurrentImage({key: image});
    //     return (
    //         <Link to={'/song'}>
    //             <img src={currentImage['images/mmi u fine.jpg']}
    //                 style={{ width: '120px', height: '120px', borderRadius: '10px' }}
    //             />
    //         </Link>
    //     )
    // }
    return (
        <div className='page_container' style={{ padding: '10px 0px' }}>
            <Helmet>
                <title>{`Music Library | Hepi Music`}</title>
                <meta name="description" content="Find and play all the greatest Kenyan hits." />
                <meta name="keywords" content="Hepi, Music, Songs, Stream, Play, Online music, Best, All songs" />

                {/*<!--  Essential META Tags -->*/}
                <meta property="og:title" content="Music Library | Hepi Music" />
                <meta property="og:type" content="website" />
                <meta property="og:image:width" content="500" />
                <meta property="og:image:height" content="500" />
                <meta property="og:image" content="%PUBLIC_URL%/logo2.jpg" />
                <meta property="og:url" content="https://hepimusic.com" />
                <meta name="twitter:card" content="summary_large_image" />

                {/*<!--  Non-Essential, But Recommended -->*/}
                <meta property="og:description" content="Live love music | Find and play all the greatest Kenyan hits." />
                <meta property="og:site_name" content="Hepi Music Library" />
                <meta name="twitter:image:alt" content="Hepi Music Library"></meta>
            </Helmet>
            <div className='searchbar_container'>
                <div style={{
                    width: 'min-content', border: '2px solid #f3b00770', borderRadius: '50vh', padding: '10px',
                    display: 'flex', alignItems: 'center', position: 'relative'
                }}>
                    <FaSearch style={{ color: '#f3b007', fontSize: '1.1em', margin: '0px 10px' }} />
                    <input type={'text'} value={q} onChange={(e) => { setQ(e.target.value) }} placeholder='Search a song...' className='search_input' />
                    {
                        q !== '' &&
                        <IoCloseSharp style={{ color: '#f3b007', fontSize: '1.5em', margin: '0px 10px', right: '5px', position: 'absolute' }} onClick={() => { setQ('') }} />
                    }
                </div>
            </div>
            {
                q === '' &&
                <>
                    {
                        arr && arr.filter((song) => { const created = moment(song.createdAt); const threeDaysAgo = moment().subtract(3, 'days'); return created.isAfter(threeDaysAgo); }).slice(0, 10).length > 0 && 
                        (
                            <div>
                                {allCategories.filter((cat) => cat.name === "Latest release").length < 1 ? setAllCategories([{key: uuidv4(), name: "Latest release"}, ...allCategories?.filter((categ => categ.name !== "Latest release"))]) : ''}
                                {console.log(JSON.stringify(arr && arr.filter((song) => { const created = moment(song.createdAt); const threeDaysAgo = moment().subtract(3, 'days'); return created.isAfter(threeDaysAgo); }).slice(0, 10)))}
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ padding: '0px 20px', margin: '0' }}>Latest release</h4>
                                    <Link to={'/all'}>
                                        <p onClick={() => { setSelectedCategory('Latest release') }} style={{ padding: '0px 20px', margin: '0', color: '#ccc' }}>View all</p>
                                    </Link>
                                </div>
                                <div style={{ padding: '10px 0px', minWidth: '100vw', paddingLeft: '20px', height: 'max-content', display: 'flex', overflow: 'scroll' }}>
                                    {
                                        arr.filter((song) => { const created = moment(song.createdAt); const threeDaysAgo = moment().subtract(3, 'days'); return created.isAfter(threeDaysAgo); }).sort((a,b)=> moment(a.createdAt).diff(moment(b.createdAt))).slice(0, 10).map((one, index) => {
                                            return (
                                                <div key={one?.key} onClick={() => { setPlaylist(arr.filter((song) => { const created = moment(song.createdAt); const threeDaysAgo = moment().subtract(3, 'days'); return created.isAfter(threeDaysAgo); }).sort((a,b)=> moment(a.createdAt).diff(moment(b.createdAt)))); setSelectedCategory("Latest release"); setSelectedSong(one); setIsBigPlayerVisible(true); setGlobalAlbums([]); setGlobalCategories(allCategories) }} style={{ minWidth: 'max-content', height: 'max-content', padding: '10px' }}>
                                                    <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                                        fallbackSrc={album_art}
                                                        style={{ width: '120px', height: '120px', borderRadius: '10px' }}
                                                    />
                                                    <p style={{ marginBottom: '0', marginTop: '3px', maxWidth: '150px', fontSize: '0.9em' }}>{one.name}</p>
                                                    {/* <p style={{ marginBottom: '0', marginTop: '3px', maxWidth: '150px', fontSize: '0.8em' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/>{`${formatNumber(one?.listens?.length)}`}</em></p> */}
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>

                        )
                    }
                    {
                        allCategories && allCategories.filter(categ => categ.name !== "Top 50" && categ.name !== "Latest release").map(one => {
                            const oneCateg = one;
                            console.log(one.name)
                            return (
                                <div key={one?.key}>
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ padding: '0px 20px', margin: '0' }}>{one.name}</h4>
                                        <Link to={'/all'}>
                                            <p onClick={() => { setSelectedCategory(one.name) }} style={{ padding: '0px 20px', margin: '0', color: '#ccc' }}>View all</p>
                                        </Link>
                                    </div>
                                    <div style={{ padding: '10px 0px', minWidth: '100vw', paddingLeft: '20px', height: 'max-content', display: 'flex', overflow: 'scroll' }}>
                                        {
                                            arr && arr.filter(song => song.selectedCategory === one.name).sort((a,b)=> moment(a.createdAt).diff(moment(b.createdAt))).reverse().slice(0, 10).map((one) => {
                                                console.log(one.selectedCategory)
                                                // console.log(song.selectedCategory)
                                                // Storage.get(one.thumbnailKey, { download: true })
                                                const key = one.thumbnailKey
                                                return (
                                                    <div key={one?.key} onClick={() => { setPlaylist(arr.filter(song => song.selectedCategory === oneCateg.name).sort((a,b)=> moment(a.createdAt).diff(moment(b.createdAt))).reverse()); setGlobalCategories(allCategories); setGlobalAlbums([]); setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ minWidth: 'max-content', height: 'max-content', padding: '10px' }}>
                                                        <Link to={'/song'}>
                                                            <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                                                fallbackSrc={album_art}
                                                                style={{ width: '120px', height: '120px', borderRadius: '10px' }}
                                                            />
                                                        </Link>
                                                        <p style={{ marginBottom: '0', marginTop: '3px', maxWidth: '150px', fontSize: '0.9em' }}>{one.name}</p>
                                                        {/* <p style={{ marginBottom: '0', marginTop: '3px', maxWidth: '150px', fontSize: '0.8em' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/><span>{`${formatNumber(one?.listens?.length)}`}</span></em></p> */}
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ padding: '0px 20px', margin: '0' }}>Top 50</h4>
                        <Link to={'/all'}>
                            <p onClick={() => { setSelectedCategory('Top 50') }} style={{ padding: '0px 20px', margin: '0', color: '#ccc' }}>View all</p>
                        </Link>
                    </div>
                    {allCategories.filter((cat) => cat.name === "Top 50").length < 1 ? setAllCategories([...allCategories?.filter((categ => categ.name !== "Top 50")), {key: uuidv4(), name: "Top 50"}]) : ''}
                    <div style={{ padding: '10px 0px', minWidth: '100vw', paddingLeft: '20px', height: 'max-content', display: 'flex', overflow: 'scroll' }}>
                        {
                            arr && arr.sort((a, b) => (a?.listOfUidUpVotes?.length + a?.listens?.length - a?.listOfUidDownVotes?.length) - (b?.listOfUidUpVotes?.length + b?.listens?.length - b?.listOfUidDownVotes?.length)).reverse().slice(0, 10).map((one) => {
                                return (
                                    <div key={one?.key} onClick={() => { setPlaylist(arr.sort((a, b) => (a?.listOfUidUpVotes?.length + a?.listens?.length - a?.listOfUidDownVotes?.length) - (b?.listOfUidUpVotes?.length + b?.listens?.length - b?.listOfUidDownVotes?.length)).reverse().slice(0, 50)); setSelectedCategory("Top 50"); setSelectedSong(one); setIsBigPlayerVisible(true); setGlobalAlbums([]); setGlobalCategories(allCategories) }} style={{ minWidth: 'max-content', height: 'max-content', padding: '10px' }}>
                                        <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                            fallbackSrc={album_art}
                                            style={{ width: '120px', height: '120px', borderRadius: '10px' }}
                                        />
                                        <p style={{ marginBottom: '0', marginTop: '3px', maxWidth: '150px', fontSize: '0.9em' }}>{one.name}</p>
                                        {/* <p style={{ marginBottom: '0', marginTop: '3px', maxWidth: '150px', fontSize: '0.8em' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/>{`${formatNumber(one?.listens?.length)}`}</em></p> */}
                                    </div>
                                )
                            })
                        }
                    </div>
                </>
            }
            {
                q !== '' &&
                <div style={{ padding: '10px 15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', width: '100%' }}>
                        <Helmet>
                            <title>Search - {q} | Hepi Music</title>
                            <meta name="description" content="Search for songs" />
                            <meta name="keywords" content="Hepi, Music, Songs, Stream, Search" />
                        </Helmet>
                        {
                            arr && arr.filter(song => song.name.toLowerCase().includes(q.toLowerCase())).map((one) => {
                                return (
                                    <div key={one?.key} onClick={() => { setPlaylist(arr.filter(song => song.name.toLowerCase().includes(q.toLowerCase()))); setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                        <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                            fallbackSrc={album_art}
                                            style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                        />
                                        <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
                                        <p style={{ marginTop: '0px', paddingLeft: '5px' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/>{formatNumber(one.listens.length)}</em></p>
                                    </div>
                                )
                            })
                        }
                    </div>
                    {
                        arr && arr.filter(song => song.name.toLowerCase().includes(q.toLowerCase())).length === 0 &&
                        <center><p>No match found</p></center>
                    }
                </div>
            }
            <br></br>
            <br></br>
            <br></br>
            <Link style={{color: 'white'}} to={'/privacy'}>
                <p style={{ padding: '0px 20px', margin: '0', color: '#ccc', display: 'inline-block' }}>Privacy Policy</p>
            </Link>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <span className='render' style={{display: 'none'}}>Rendered</span>
        </div>
    )
}

export default Library 