import React, { useState, useRef, useEffect } from 'react'
import { IoAddOutline, IoAddSharp } from 'react-icons/io5'
import { Modal, Spinner } from 'react-bootstrap';
import { db, storage } from '../../config/fire';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import admin_album from '../../components/fallbackImages/admin_album.png'
import album_art from '../../components/fallbackImages/album_art.jpeg'
import { Amplify, Storage, API, graphqlOperation, APIClass } from 'aws-amplify';
import { listAlbums, listSongs } from '../../graphql/queries';
import { createAlbum, updateSong } from '../../graphql/mutations';
import awsconfig from '../../aws-exports';
import ImageWithFallback from '../../components/ImageWithFallback';
Amplify.configure(awsconfig)
function AdminAlbums() {
    const [allAlbums, setAllAlbums] = useState(null)
    const [allSongs, setAllSongs] = useState(null)
    const [name, setName] = useState('')
    const [thumbnail, setThumbnail] = useState(admin_album)
    const [thumbnailKey, setThumbnailKey] = useState()
    const [profileLoading, setProfileLoading] = useState(false)
    const hiddenBrowseButton = useRef(null)


    const [selectedAlbum, setSelectedAlbum] = useState(null)
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showD, setShowD] = useState(false)
    const handleCloseD = () => setShowD(false);
    const handleShowD = () => setShowD(true);

    useEffect(async () => {
        // onSnapshot(collection(db, 'albums'), (snap) => {
        //     let temp = []
        //     snap.docs.forEach(doc => {
        //         temp.push(doc.data())
        //     })
        //     setAllAlbums(temp)
        // })
        await API.graphql(graphqlOperation(listAlbums)).then((res)=>{
            let temp = []
            res?.data?.listAlbums?.items.forEach(doc => {
                temp.push(doc)
            })
            setAllAlbums(temp)
        })
        // onSnapshot(collection(db, 'songs'), (snap) => {
        //     let temp = []
        //     snap.docs.forEach(doc => {
        //         temp.push(doc.data())
        //     })
        //     setAllSongs(temp)
        // })
        await API.graphql(graphqlOperation(listSongs)).then((res)=>{
            let temp = []
            res?.data?.listSongs?.items.forEach(doc => {
                temp.push(doc)
            })
            setAllSongs(temp)
        })
    }, [])

    useEffect(()=>{
        console.log('thumbnailkey changed');
        console.log(thumbnailKey);
        const pattern = /^images\/.*\.(jpg|jpeg|png|gif)$/i;
        if (pattern.test(thumbnailKey)){
            addNewAlbum(selectedAlbum?.key)
        }
    }, [thumbnailKey])

    const [imageFile, setImageFile] = useState()

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);

        // Generate preview URL
        const imageURL = URL.createObjectURL(file);
        setThumbnail(imageURL);
    };

    async function uploadProfilePicture(e) {
        setProfileLoading(true)
        const imageFile = e;
        try {

            const imageOne = imageFile;
            const storageRef = sRef(storage, `images/${imageOne.name}`);
            const fname = imageOne.name
            const ext = fname.split('.').pop();

            const uploadPromise = new Promise((resolve, reject) => {
                Storage.put(`images/${name}.${ext}`, imageOne).then(async (res)=>{ // ${imageOne.name}
                    resolve(res)
                    // resolve({"downloadUrl": downloadUrl, "key": res.key})
                }).catch((err)=>{
                    console.log(err);
                    setProfileLoading(false)
                    reject(err)
                });
            })
        
            const uploadResponse = await uploadPromise;
            const durl = await Storage.get(`images/${name}.${ext}`, { validateObjectExistence: true }); // ${imageOne.name}
            console.log(uploadResponse.key)
            setProfileLoading(false)
            setThumbnail(durl)
            setThumbnailKey(uploadResponse.key)

            // const uploadTask = uploadBytesResumable(storageRef, imageOne);
            // uploadTask.on('state_changed',
            //     (snapshot) => {
            //     },
            //     (error) => {
            //         alert(error)
            //     },
            //     () => {
            //         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            //             setProfileLoading(false)
            //             setThumbnail(downloadURL)
            //         });
            //     }
            // );

        } catch (error) {
            alert(error)
            setProfileLoading(false)
        }
    }
    async function addNewAlbum() {
        const key = uuidv4()
        // setDoc(doc(db, 'albums', key), {
        //     name,
        //     thumbnail,
        //     key
        // }).then(() => {
        //     alert('added');
        //     setShow(false)
        // })
        const album = {key: key, name: name, thumbnail: thumbnail, thumbnailKey: thumbnailKey};
        await API.graphql(graphqlOperation(createAlbum, {input: album})).then(()=>{
            console.log("album added");
            setShow(false)
        }).catch((error)=>{
            console.log(error);
        });
    }

    async function addSongToAlbum(song, albumKey) {
        // setDoc(doc(db, 'songs', songKey), {
        //     partOf: albumKey
        // }, { merge: true })
        const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...modifiedSong } = song;
        const modifiedSongWithPartOf = { ...modifiedSong, partOf: albumKey };
        await API.graphql(graphqlOperation(updateSong, { input: modifiedSongWithPartOf }))
    }
    async function removeSongFromAlbum(song) {
        // setDoc(doc(db, 'songs', songKey), {
        //     partOf: ''
        // }, { merge: true })
        const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...modifiedSong } = song;
        const modifiedSongWithPartOf = { ...modifiedSong, partOf: '' };
        await API.graphql(graphqlOperation(updateSong, { input: modifiedSongWithPartOf }))
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
                            <input ref={hiddenBrowseButton} onChange={(e) => handleImageChange(e)} type="file" style={{ "display": "none" }} />
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
                            Cancel
                        </buttn>
                        <buttn onClick={async () => { await uploadProfilePicture(imageFile) }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
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
                                    <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                        fallbackSrc={album_art}
                                        style={{ height: '70px', width: '70px', borderRadius: '50vh', marginRight: '15px' }}
                                    />
                                    <div style={{ flex: '1' }}>
                                        <h5 style={{ color: '#fff' }}>{one.name}</h5>
                                        <h6 style={{ color: '#fff' }}>{one?.selectedCreator?.name}</h6>
                                    </div>
                                    <div style={{ flex: '0.5', display: 'flex' }}>
                                        {
                                            one?.partOf && one.partOf === selectedAlbum?.key ?
                                                <div onClick={() => { removeSongFromAlbum(one) }} style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', padding: '10px', color: '#f3b007' }}>
                                                    Remove
                                                </div>
                                                :
                                                <div onClick={() => { addSongToAlbum(one, selectedAlbum?.key) }} style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', padding: '10px', color: '#f3b007' }}>
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
                            Cancel
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
                                    <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                        fallbackSrc={admin_album}
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