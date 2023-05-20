import React, { useState, useEffect } from 'react'
import { BsCaretDown, BsCaretUp } from 'react-icons/bs'
import { BiArrowBack } from 'react-icons/bi'
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db } from '../config/fire'
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { Link } from 'react-router-dom'
function Albums({ arr, setIsBigPlayerVisible, setSelectedSong, selectedSong }) {
    const [allAlbums, setAllAlbums] = useState(null)
    const [isAlbumVisible, setIsAlbumVisible] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null)
    useEffect(() => {
        onSnapshot(collection(db, 'albums'), (snap) => {
            let temp = []
            snap.docs.forEach(doc => {
                temp.push(doc.data())
            })
            setAllAlbums(temp)
        })
    }, [])
    function upVote(key) {
        setDoc(doc(db, 'songs', key), {
            listOfUidUpVotes: arrayUnion(auth.currentUser.uid)
        }, { merge: true })
        setDoc(doc(db, 'songs', key), {
            listOfUidDownVotes: arrayRemove(auth.currentUser.uid)
        }, { merge: true })
    }
    function downVote(key) {
        setDoc(doc(db, 'songs', key), {
            listOfUidDownVotes: arrayUnion(auth.currentUser.uid)
        }, { merge: true })
        setDoc(doc(db, 'songs', key), {
            listOfUidUpVotes: arrayRemove(auth.currentUser.uid)
        }, { merge: true })
    }
    function removeVote(key) {
        setDoc(doc(db, 'songs', key), {
            listOfUidUpVotes: arrayRemove(auth.currentUser.uid)
        }, { merge: true })
        setDoc(doc(db, 'songs', key), {
            listOfUidDownVotes: arrayRemove(auth.currentUser.uid)
        }, { merge: true })
    }
    if (isAlbumVisible) {
        return (
            <div className='page_container'>
                <div style={{ width: '-webkit-fill-available', height: '55px', display: 'flex' }}>
                    <BiArrowBack onClick={() => { setIsAlbumVisible(false) }} style={{ fontSize: '1.5em', color: '#f3b007', marginRight: '20px' }} />
                    <h4 style={{ margin: '0', color: '#f3b007' }}>{selectedAlbum.name}</h4>
                </div>
                {
                    arr && arr.sort((a, b) => a?.listOfUidUpVotes?.length - b?.listOfUidUpVotes?.length).reverse().map((one) => {
                        console.log(one?.partOf, selectedAlbum.key);
                        if (!(one?.partOf && one.partOf === selectedAlbum?.key)) {
                            return (<></>)
                        }
                        return (
                            <>
                                <div onClick={() => { setSelectedSong(one); }} style={{ width: '-webkit-fill-available', borderBottom: '1px solid #6d6d6d', padding: '10px', display: 'flex' }}>
                                    <Link to={'/song'}>
                                        <img src={one.thumbnail}
                                            style={{ height: '50px', width: '50px', borderRadius: '5px', marginRight: '15px' }}
                                        />
                                    </Link>
                                    <div style={{ flex: '1' }}>
                                        <Link to={'/song'} style={{ textDecoration: 'none', color: '#fff' }}>
                                            <p style={{ fontSize: '0.9em', marginBottom: '0px' }}>{one.name}</p>
                                            <p style={{ fontSize: '0.8em', color: '#ccc', margin: '0' }}>{one?.selectedCreator?.name}</p>
                                            <p style={{ fontSize: '0.8em', color: '#ccc', margin: '0', color: '#f3b007', fontWeight: 'bold' }}>{one?.key === selectedSong?.key && 'Currently Playing'}</p>
                                        </Link>
                                    </div>
                                    <div style={{ flex: '0.5', display: 'flex' }}>
                                        {
                                            auth?.currentUser?.uid &&
                                            <div onClick={(e) => { e.stopPropagation() }} style={{ flex: '0.5', display: 'flex' }}>
                                                {
                                                    one?.listOfUidUpVotes?.includes(auth.currentUser.uid) ?
                                                        <div onClick={() => { removeVote(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', color: '#f3b007' }}>
                                                            {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                            <AiFillCaretUp style={{ fontSize: '1.5em', color: '#f3b007' }} />
                                                            {one?.listOfUidUpVotes?.length}
                                                        </div>
                                                        :
                                                        <div onClick={() => { upVote(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px' }}>
                                                            {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                            <BsCaretUp style={{ fontSize: '1.5em' }} />
                                                            {one?.listOfUidUpVotes?.length}
                                                        </div>
                                                }
                                                {
                                                    one?.listOfUidDownVotes?.includes(auth.currentUser.uid) ?
                                                        <div onClick={() => { removeVote(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', color: '#f3b007' }}>
                                                            {/* <AiFillCaretDown style={{ fontSize: '1.5em' }} /> */}
                                                            <AiFillCaretDown style={{ fontSize: '1.5em', color: '#f3b007' }} />
                                                            {one?.listOfUidDownVotes?.length}
                                                        </div>
                                                        :
                                                        <div onClick={() => { downVote(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px' }}>
                                                            {/* <AiFillCaretDown style={{ fontSize: '1.5em' }} /> */}
                                                            <BsCaretDown style={{ fontSize: '1.5em' }} />
                                                            {one?.listOfUidDownVotes?.length}
                                                        </div>
                                                }
                                            </div>
                                        }
                                        {
                                            !auth?.currentUser?.uid &&
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
            </div>
        )
    }
    return (
        <div className='page_container'>
            <h6 style={{ marginBottom: '15px' }}>Albums</h6>
            <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', width: '100%' }}>
                {
                    allAlbums && allAlbums.map((one) => {
                        return (
                            <div onClick={() => { setSelectedAlbum(one); setIsAlbumVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                <img src={one.thumbnail}
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
        </div>
    )
}

export default Albums