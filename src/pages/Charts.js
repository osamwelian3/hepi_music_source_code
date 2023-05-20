import React, { useState, useRef, useEffect } from 'react'
import { IoAddOutline, IoAddSharp } from 'react-icons/io5'
import { Modal, Spinner } from 'react-bootstrap';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, arrayRemove, arrayUnion, collection, doc, increment, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { BsCaretDown, BsCaretUp } from 'react-icons/bs';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { BiArrowBack } from 'react-icons/bi'
import { auth, db } from '../config/fire';
import { Link } from 'react-router-dom';
function Charts({ arr, setIsBigPlayerVisible, setSelectedSong, selectedSong }) {
    const [mainFil, setMainFil] = useState(50)
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
    console.log(mainFil);
    if (!arr) {
        return (<></>)
    }
    return (
        <div className='page_container'>
            <h6 style={{ marginBottom: '15px' }}>Charts</h6>
            <select value={mainFil} onChange={(e) => { setMainFil(e.target.value) }} className='btn' style={{ width: '-webkit-fill-available', padding: '10px 0px', maxWidth: '400px', color: '#f3b007', background: '#151515' }}>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
                <option value={150}>Top 150</option>
            </select>
            <hr></hr>
            {
                arr && arr.sort((a, b) => a?.listOfUidUpVotes?.length - b?.listOfUidUpVotes?.length).reverse().slice(0, mainFil).map((one) => {
                    return (
                        <>
                            <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '-webkit-fill-available', padding: '10px', borderBottom: '1px solid #6d6d6d', display: 'flex' }}>
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
                                {
                                    auth?.currentUser?.uid &&
                                    <div onClick={(e) => { e.stopPropagation() }} style={{ flex: '0.5', display: 'flex' }}>
                                        {
                                            one?.listOfUidUpVotes?.includes(auth.currentUser.uid) ?
                                                <div onClick={() => { removeVote(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em', color: '#f3b007' }}>
                                                    {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                    <AiFillCaretUp style={{ fontSize: '1.5em', color: '#f3b007' }} />
                                                    {one?.listOfUidUpVotes?.length}
                                                </div>
                                                :
                                                <div onClick={() => { upVote(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em' }}>
                                                    {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                    <BsCaretUp style={{ fontSize: '1.5em' }} />
                                                    {one?.listOfUidUpVotes?.length}
                                                </div>
                                        }
                                        {
                                            one?.listOfUidDownVotes?.includes(auth.currentUser.uid) ?
                                                <div onClick={() => { removeVote(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em', color: '#f3b007' }}>
                                                    {/* <AiFillCaretDown style={{ fontSize: '1.5em' }} /> */}
                                                    <AiFillCaretDown style={{ fontSize: '1.5em', color: '#f3b007' }} />
                                                    {one?.listOfUidDownVotes?.length}
                                                </div>
                                                :
                                                <div onClick={() => { downVote(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '0px 10px', fontSize: '0.8em' }}>
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
        </div >
    )
}

export default Charts