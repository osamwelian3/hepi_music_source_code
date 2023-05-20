import React, { useState, useRef, useEffect } from 'react'
import { IoAddOutline, IoAddSharp } from 'react-icons/io5'
import { Modal, Spinner } from 'react-bootstrap';
import { db, storage } from '../../config/fire';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
function AdminAlbums() {
    const [allAlbums, setAllAlbums] = useState(null)
    const [allSongs, setAllSongs] = useState(null)
    const [name, setName] = useState('')
    const [thumbnail, setThumbnail] = useState('https://community.mp3tag.de/uploads/default/original/2X/a/acf3edeb055e7b77114f9e393d1edeeda37e50c9.png')
    const [profileLoading, setProfileLoading] = useState(false)
    const hiddenBrowseButton = useRef(null)


    const [selectedAlbum, setSelectedAlbum] = useState(null)
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showD, setShowD] = useState(false)
    const handleCloseD = () => setShowD(false);
    const handleShowD = () => setShowD(true);

    useEffect(() => {
        onSnapshot(collection(db, 'albums'), (snap) => {
            let temp = []
            snap.docs.forEach(doc => {
                temp.push(doc.data())
            })
            setAllAlbums(temp)
        })
        onSnapshot(collection(db, 'songs'), (snap) => {
            let temp = []
            snap.docs.forEach(doc => {
                temp.push(doc.data())
            })
            setAllSongs(temp)
        })
    }, [])

    async function uploadProfilePicture(e) {
        setProfileLoading(true)
        const imageFile = e.target.files[0];
        try {

            const imageOne = imageFile;
            const storageRef = sRef(storage, `images/${imageOne.name}`);

            const uploadTask = uploadBytesResumable(storageRef, imageOne);
            uploadTask.on('state_changed',
                (snapshot) => {
                },
                (error) => {
                    alert(error)
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setProfileLoading(false)
                        setThumbnail(downloadURL)
                    });
                }
            );

        } catch (error) {
            alert(error)
            setProfileLoading(false)
        }
    }
    function addNewAlbum() {
        const key = uuidv4()
        setDoc(doc(db, 'albums', key), {
            name,
            thumbnail,
            key
        }).then(() => {
            alert('added');
            setShow(false)
        })
    }

    function addSongToAlbum(songKey, albumKey) {
        setDoc(doc(db, 'songs', songKey), {
            partOf: albumKey
        }, { merge: true })
    }
    function removeSongFromAlbum(songKey) {
        setDoc(doc(db, 'songs', songKey), {
            partOf: ''
        }, { merge: true })
    }
    return (
        <div style={{ padding: '10px' }}>
            <Modal className='addLinkModal' show={show} onHide={handleClose}>
                <Modal.Body>
                    <h2>New album</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0px' }}>
                        <div style={{ flex: '.4' }}>
                            {
                                !profileLoading ?
                                    <img style={{ height: '100px', width: '100px', borderRadius: '50vh' }} src={thumbnail} />
                                    :
                                    <div style={{ height: '100px', width: '100px', borderRadius: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Spinner style={{ color: '#f3b007' }} />
                                    </div>
                            }
                        </div>
                        <div style={{ flex: '.6' }}>
                            <input ref={hiddenBrowseButton} onChange={(e) => uploadProfilePicture(e)} type="file" style={{ "display": "none" }} />
                            <buttn
                                onClick={() => hiddenBrowseButton.current.click()}
                                style={{ borderRadius: '50vh', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                                Pick an image
                            </buttn>
                            <buttn onClick={() => { setThumbnail('https://png.pngtree.com/png-vector/20190330/ourlarge/pngtree-vector-leader-of-group-icon-png-image_894826.jpg') }} style={{ borderRadius: '50vh', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px', width: '-webkit-fill-available' }} className='btn'>
                                Remove
                            </buttn>
                        </div>
                    </div>
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Name</p>
                    <input type={'text'} value={name} onChange={(e) => { setName(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', marginTop: '20px' }}>
                        <buttn onClick={handleClose} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancle
                        </buttn>
                        <buttn onClick={() => { addNewAlbum(selectedAlbum?.key) }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Add
                        </buttn>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal className='addLinkModal' show={showD} onHide={handleCloseD}>
                <Modal.Body>
                    <h2>Add songs in album</h2>
                    {
                        allSongs && allSongs.map(one => {
                            return (
                                <div style={{ width: '-webkit-fill-available', padding: '10px', borderRadius: '15px', display: 'flex' }}>
                                    <img src={one.thumbnail}
                                        style={{ height: '70px', width: '70px', borderRadius: '50vh', marginRight: '15px' }}
                                    />
                                    <div style={{ flex: '1' }}>
                                        <h5 style={{ color: '#fff' }}>{one.name}</h5>
                                        <h6 style={{ color: '#fff' }}>{one?.selectedCreator?.name}</h6>
                                    </div>
                                    <div style={{ flex: '0.5', display: 'flex' }}>
                                        {
                                            one?.partOf && one.partOf === selectedAlbum?.key ?
                                                <div onClick={() => { removeSongFromAlbum(one.key) }} style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', padding: '10px', color: '#f3b007' }}>
                                                    Remove
                                                </div>
                                                :
                                                <div onClick={() => { addSongToAlbum(one.key, selectedAlbum?.key) }} style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', padding: '10px', color: '#f3b007' }}>
                                                    Add
                                                </div>
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                    <div style={{ display: 'flex', marginTop: '20px' }}>
                        <buttn onClick={handleCloseD} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancle
                        </buttn>
                    </div>
                </Modal.Body>
            </Modal>
            <div onClick={() => { setShow(true) }} style={{ width: '-webkit-fill-available', height: '70px', border: '1px solid #f3b007', borderRadius: '10px', color: '#f3b007', margin: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IoAddSharp style={{ color: '#f3b007', margin: '0', fontSize: '2em', marginRight: '7px' }} />
                <h1 style={{ color: '#f3b007', margin: '0' }}>Add new</h1>
            </div>
            <h6 style={{ marginBottom: '15px' }}>All Albums</h6>
            <div style={{ padding: '10px', paddingTop: '0', width: '100%', height: 'max-content' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', width: '100%' }}>
                    {
                        allAlbums && allAlbums.map((one) => {
                            return (
                                <div onClick={() => { setSelectedAlbum(one); handleShowD() }} style={{ width: '100%', marginBottom: '20px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                    <img src={one.thumbnail}
                                        style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                    />
                                    <p>{one.name}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <br></br>
            <br></br>
            <br></br>
        </div>
    )
}

export default AdminAlbums