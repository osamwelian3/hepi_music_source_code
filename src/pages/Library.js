import { collection, onSnapshot } from 'firebase/firestore';
import React, { useState, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'
import { IoCloseSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import '../components/mp.css';
import { db } from '../config/fire';
function Library({ setSelectedSong, setIsBigPlayerVisible, arr, setSelectedCategory }) {
    const [allCategories, setAllCategories] = useState(null)
    const [q, setQ] = useState('')
    useEffect(() => {
        onSnapshot(collection(db, 'categories'), (snap) => {
            let temp = []
            snap.docs.forEach(doc => {
                temp.push(doc.data())
            })
            setAllCategories(temp.reverse())
        })
    }, [])
    return (
        <div className='page_container' style={{ padding: '10px 0px' }}>
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
                        allCategories && allCategories.map(one => {
                            return (
                                <>
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ padding: '0px 20px', margin: '0' }}>{one.name}</h4>
                                        <Link to={'/all'}>
                                            <p onClick={() => { setSelectedCategory(one.name) }} style={{ padding: '0px 20px', margin: '0', color: '#ccc' }}>View all</p>
                                        </Link>
                                    </div>
                                    <div style={{ padding: '10px 0px', minWidth: '100vw', paddingLeft: '20px', height: 'max-content', display: 'flex', overflow: 'scroll' }}>
                                        {
                                            arr && arr.filter(song => song.selectedCategory === one.name).slice(0, 10).map((one) => {
                                                return (
                                                    <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ minWidth: 'max-content', height: 'max-content', padding: '10px' }}>
                                                        <Link to={'/song'}>
                                                            <img src={one.thumbnail}
                                                                style={{ width: '120px', height: '120px', borderRadius: '10px' }}
                                                            />
                                                        </Link>
                                                        <p style={{ marginBottom: '0', marginTop: '3px', maxWidth: '150px', fontSize: '0.9em' }}>{one.name}</p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </>
                            )
                        })
                    }
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ padding: '0px 20px', margin: '0' }}>Top 50</h4>
                        <Link to={'/all'}>
                            <p onClick={() => { setSelectedCategory('Top 50') }} style={{ padding: '0px 20px', margin: '0', color: '#ccc' }}>View all</p>
                        </Link>
                    </div>
                    <div style={{ padding: '10px 0px', minWidth: '100vw', paddingLeft: '20px', height: 'max-content', display: 'flex', overflow: 'scroll' }}>
                        {
                            arr && arr.sort((a, b) => a?.listOfUidUpVotes?.length - b?.listOfUidUpVotes?.length).reverse().slice(0, 10).map((one) => {
                                return (
                                    <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ minWidth: 'max-content', height: 'max-content', padding: '10px' }}>
                                        <Link to={'/song'}>
                                            <img src={one.thumbnail}
                                                style={{ width: '120px', height: '120px', borderRadius: '10px' }}
                                            />
                                        </Link>
                                        <p style={{ marginBottom: '0', marginTop: '3px', maxWidth: '150px', fontSize: '0.9em' }}>{one.name}</p>
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
                        {
                            arr && arr.filter(song => song.name.toLowerCase().includes(q.toLowerCase())).map((one) => {
                                return (
                                    <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                        <img src={one.thumbnail}
                                            style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                        />
                                        <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
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
        </div>
    )
}

export default Library 