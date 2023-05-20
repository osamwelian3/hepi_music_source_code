import React, { useState, useEffect } from "react"
import AudioPlayer from 'react-h5-audio-player';
import { AiFillCloseCircle, AiOutlineShareAlt } from "react-icons/ai";
import { SocialIcon } from "react-social-icons";
import { BsCaretDown, BsCaretUp } from "react-icons/bs";

import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { auth, db } from "../config/fire";
import ShareDrawer from "../components/Share";
import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc } from "firebase/firestore";
function BigPlayer({ selectedSong, setSelectedSong }) {
    const [isShareVisible, setIsShareVisible] = useState(false)
    const [liveSong, setLiveSong] = useState(null)
    useEffect(() => {
        const queryString = (window.location.search);
        const RetrivedchildKey = (queryString.substring(1));
        console.log(RetrivedchildKey)
        if (selectedSong) {
            onSnapshot(doc(db, 'songs', selectedSong?.key), (snap) => {
                setLiveSong(snap.data())
            })
        } else if (RetrivedchildKey) {
            onSnapshot(doc(db, 'songs', RetrivedchildKey), (snap) => {
                setLiveSong(snap.data())
                setSelectedSong(snap.data())
            })
        }
    }, [selectedSong])

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
    return (
        <div className='detail_modal' style={{ height: '100vh', maxHeight: 'max-content', width: '100vw', position: 'fixed', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', top: '0px', left: '0', zIndex: '99', background: '#000' }}>
            <ShareDrawer isOpen={isShareVisible} setIsOpen={setIsShareVisible} id={liveSong?.key} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div onClick={() => { setIsShareVisible(true) }} style={{ position: 'absolute', display: 'flex', alignItems: 'center', color: '#f3b007', top: '10px', left: '10px' }}>
                    <AiOutlineShareAlt style={{ margin: '10px', fontSize: '2em', color: '#f3b007' }} />Share
                </div>
                <img src={liveSong?.thumbnail}
                    style={{ height: '170px', width: '170px', borderRadius: '20px' }}
                />
                <h4 style={{ margin: '0px', textAlign: 'center', marginBottom: '20px', marginTop: '8px' }}>{liveSong?.name}</h4>
                <div style={{ display: 'flex', background: '#00000050', justifyContent: 'space-around', border: '1px solid #505050', borderRadius: '50vh', width: '180px', margin: '10px 0px' }}>
                    {
                        auth?.currentUser?.uid &&
                        <div style={{ flex: '0.5', display: 'flex' }}>
                            {
                                liveSong?.listOfUidUpVotes?.includes(auth.currentUser.uid) ?
                                    <div onClick={() => { removeVote(liveSong.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#f3b007' }}>
                                        {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                        <AiFillCaretUp style={{ fontSize: '1.7em', color: '#f3b007' }} />
                                        {liveSong?.listOfUidUpVotes?.length}
                                    </div>
                                    :
                                    <div onClick={() => { upVote(liveSong.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#ccc' }}>
                                        {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                        <BsCaretUp style={{ fontSize: '1.7em' }} />
                                        {liveSong?.listOfUidUpVotes?.length}
                                    </div>
                            }
                            {
                                liveSong?.listOfUidDownVotes?.includes(auth.currentUser.uid) ?
                                    <div onClick={() => { removeVote(liveSong.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#f3b007' }}>
                                        {/* <AiFillCaretDown style={{ fontSize: '1.7em' }} /> */}
                                        <AiFillCaretDown style={{ fontSize: '1.7em', color: '#f3b007' }} />
                                        {liveSong?.listOfUidDownVotes?.length}
                                    </div>
                                    :
                                    <div onClick={() => { downVote(liveSong.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '5px 10px', color: '#ccc' }}>
                                        {/* <AiFillCaretDown style={{ fontSize: '1.7em' }} /> */}
                                        <BsCaretDown style={{ fontSize: '1.7em' }} />
                                        {liveSong?.listOfUidDownVotes?.length}
                                    </div>
                            }
                        </div>
                    }
                    {
                        !auth?.currentUser?.uid &&
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
                            <img style={{ height: '60px', marginLeft: '0px', marginRight: '15px', width: '60px', borderRadius: '50vh' }} src={liveSong?.selectedCreator?.thumbnail} />
                        </div>
                        <div style={{ flex: '1' }}>
                            <h3 style={{ color: '#fff' }}>{liveSong?.selectedCreator?.name}</h3>
                            <h6 style={{ color: '#fff', padding: '0px 10px', paddingLeft: '0', marginBottom: '0' }}>{liveSong?.selectedCreator?.desc}</h6>
                        </div>
                    </div>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                        <SocialIcon url={`https://twitter.com/${liveSong?.selectedCreator?.twitter}`} bgColor="#00000000" fgColor="#007bff" style={{ marginRight: '15px' }} />
                        <SocialIcon url={`https://www.instagram.com/${liveSong?.selectedCreator?.instagram}`} bgColor="#00000000" fgColor="#e94475" style={{ marginRight: '15px' }} />
                        <SocialIcon url={`https://www.facebook.com/${liveSong?.selectedCreator?.facebook}`} bgColor="#00000000" fgColor="#3b5998" style={{ marginRight: '15px' }} />
                        <SocialIcon url={`https://www.youtube.com/${liveSong?.selectedCreator?.youtube}`} bgColor="#00000000" fgColor="#ff3333" style={{ marginRight: '15px' }} />
                    </div>
                </div>
            }
        </div>
    )
}
export default BigPlayer