import React from 'react'
import { BiArrowBack } from 'react-icons/bi'
import { useHistory } from 'react-router-dom'
import album_art from '../components/fallbackImages/album_art.jpeg'
import ImageWithFallback from '../components/ImageWithFallback'
import { Helmet } from 'react-helmet'
import { formatNumber } from '../utilities/utility'
import { IoPlay } from 'react-icons/io5'
import moment from 'moment'

function All({ selectedCategory, arr, setSelectedSong, setIsBigPlayerVisible }) {
    const history = useHistory()
    return (
        <div className='page_container'>
            <Helmet>
                <title>{`${selectedCategory} | Hepi Music`}</title>
                <meta name="description" content={`${selectedCategory} on Hepi Music`} />
                <meta name="keywords" content={`Hepi, Music, ${selectedCategory}, Songs, Stream, Play, Online music, Best`} />

                {/*<!--  Essential META Tags -->*/}
                <meta property="og:title" content={`${selectedCategory} | Hepi Music`} />
                <meta property="og:type" content="music.album" />
                <meta property="og:image" content="%PUBLIC_URL%/logo1.jpg" />
                <meta property="og:url" content="https://hepimusic.com/library" />
                <meta name="twitter:card" content="summary_large_image" />

                {/*<!--  Non-Essential, But Recommended -->*/}
                <meta property="og:description" content={`${selectedCategory} on Hepi Music`} />
                <meta property="og:site_name" content={`Hepi Music ${selectedCategory}`} />
                <meta name="twitter:image:alt" content={`Hepi Music ${selectedCategory}`}></meta>
            </Helmet>
            <div style={{ width: '-webkit-fill-available', height: '55px', display: 'flex' }}>
                <BiArrowBack onClick={() => { history.goBack() }} style={{ fontSize: '1.5em', color: '#f3b007', marginRight: '20px' }} />
                <h4 style={{ margin: '0', color: '#f3b007' }}>{selectedCategory}</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', width: '100%' }}>
                {
                    arr && selectedCategory !== 'Top 50' && arr.filter(song => song.selectedCategory === selectedCategory).map((one) => {
                        return (
                            <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                    fallbackSrc={album_art}
                                    style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                />
                                <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
                                <p style={{ marginTop: '0px', paddingLeft: '5px' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/><span>{formatNumber(one.listens.length)}</span></em></p>
                            </div>
                        )
                    })
                }
                {
                    arr && selectedCategory === 'Top 50' && arr.sort((a, b) => (a?.listOfUidUpVotes?.length+a?.listens?.length) - (b?.listOfUidUpVotes?.length+a?.listens?.length)).reverse().map((one) => {
                        return (
                            <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                    fallbackSrc={album_art}
                                    style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                />
                                <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
                                <p style={{ marginTop: '0px', paddingLeft: '5px' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/><span>{formatNumber(one.listens.length)}</span></em></p>
                            </div>
                        )
                    })
                }
                {
                    arr && selectedCategory === 'Latest release' && arr.filter((song) => { const createdAt = moment(song.createdAt); const threeDaysAgo = moment().subtract(3, 'days'); return createdAt.isAfter(threeDaysAgo); }).reverse().map((one) => {
                        return (
                            <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                    fallbackSrc={album_art}
                                    style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                />
                                <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
                                <p style={{ marginTop: '0px', paddingLeft: '5px' }}><em style={{display: 'flex'}}><IoPlay style={{display: 'inline-block', alignSelf: 'center'}}/><span>{formatNumber(one.listens.length)}</span></em></p>
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
}

export default All