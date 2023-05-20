import React, { useState, useRef, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/fire';
import { Link } from 'react-router-dom';
function Favorite({ setSelectedSong, setIsBigPlayerVisible }) {
    const [allSongs, setAllSongs] = useState(null)
    useEffect(() => {
        onSnapshot(collection(db, 'songs'), (snap) => {
            let temp = []
            snap.docs.forEach(doc => {
                temp.push(doc.data())
            })
            setAllSongs(temp)
        })
    }, [])
    console.log('came');

    return (
        <div className='page_container' style={{ padding: '10px 0px' }}>
            <h6 style={{ marginBottom: '15px', marginLeft: '10px' }}>Favorites</h6>
            <div style={{ padding: '10px 15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', width: '100%' }}>
                    {
                        allSongs && allSongs.filter(song => song.listOfUidUpVotes.includes(auth?.currentUser?.uid)).map((one) => {
                            return (
                                <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                    <Link to={'/song'}>
                                        <img src={one.thumbnail}
                                            style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                        />
                                    </Link>
                                    <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
                                </div>
                            )
                        })
                    }
                    {
                        allSongs && allSongs.filter(song => song.listOfUidUpVotes.includes(auth?.currentUser?.uid)).length === 0 &&
                        <center><p style={{ width: 'max-content', marginLeft: '10px' }}>Upvote songs to make them favorite</p></center>
                    }
                </div>
            </div>
            <br></br>
            <br></br>
            <br></br>
        </div>
    )
}

export default Favorite