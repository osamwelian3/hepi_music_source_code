import React, { useState, useRef, useEffect } from 'react'
import { IoAddOutline, IoAddSharp, IoClose, IoPencil, IoPencilSharp, IoRemove, IoTrash } from 'react-icons/io5'
import { Modal, Spinner } from 'react-bootstrap';
import { db, storage } from '../../config/fire';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import admin_album from '../../components/fallbackImages/admin_album.png'
import album_art from '../../components/fallbackImages/album_art.jpeg'
import { Amplify, Storage, API, graphqlOperation, APIClass, DataStore } from 'aws-amplify';
import { listAlbums, listSongs } from '../../graphql/queries';
import { createAlbum, updateSong, deleteAlbum as delAlbum, updateAlbum } from '../../graphql/mutations';
import awsconfig from '../../aws-exports';
import ImageWithFallback from '../../components/ImageWithFallback';
import { replaceLastAtEnd } from '../../utilities/utility';
import { Album, Song } from '../../models';
Amplify.configure(awsconfig)
function AdminAlbums() {
    const [allAlbums, setAllAlbums] = useState(null)
    const [prevAllAlbums, setPrevAllAlbums] = useState(null)
    const [allSongs, setAllSongs] = useState(null)
    const [name, setName] = useState('')
    const [thumbnail, setThumbnail] = useState(admin_album)
    const [thumbnailKey, setThumbnailKey] = useState()
    const [profileLoading, setProfileLoading] = useState(false)
    const [spinner, setSpinner] = useState(false)
    const [songToAlbumSpinner, setSongToAlbumSpinner] = useState([])
    const [deleteSpinner, setDeleteSpinner] = useState([])
    const hiddenBrowseButton = useRef(null)
    const [imageFile, setImageFile] = useState()

    const [selectedAlbum, setSelectedAlbum] = useState(null)
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showD, setShowD] = useState(false)
    const handleCloseD = () => setShowD(false);
    const handleShowD = () => setShowD(true);

    const [showE, setShowE] = useState(false)
    const handleCloseE = () => setShowE(false);
    const handleShowE = () => setShowE(true);

    useEffect(async () => {
        const sub1 = DataStore.observeQuery(Album, null, { limit: 10000 }).subscribe(snapshot => {
            const {items, isSynced} = snapshot
            let temp = []
            if (isSynced) {
              items.forEach((album) => {
                temp.push(album)
              })
              setAllAlbums(temp)
            }
          })
        // await API.graphql(graphqlOperation(listAlbums, {limit: 1000000})).then((res)=>{
        //     let temp = []
        //     res?.data?.listAlbums?.items.forEach(doc => {
        //         temp.push(doc)
        //     })
        //     setAllAlbums(temp)
        // })

        const sub2 = DataStore.observeQuery(Song, null, { limit: 10000 }).subscribe(snapshot => {
            const {items, isSynced} = snapshot
            let temp = []
            if (isSynced) {
              items.forEach((song) => {
                temp.push(song)
              })
              setAllSongs(temp)
            }
          })
        // await API.graphql(graphqlOperation(listSongs, {limit: 1000000})).then((res)=>{
        //     let temp = []
        //     res?.data?.listSongs?.items.forEach(doc => {
        //         temp.push(doc)
        //     })
        //     setAllSongs(temp)
        // })
        return () => {
            if (sub1) {
                sub1.unsubscribe()
            }
            if (sub2) {
                sub2.unsubscribe()
            }
        }
    }, [])

    useEffect(()=>{
        console.log('thumbnailkey changed');
        console.log(thumbnailKey);
        const pattern = /^images\/.*\.(jpg|jpeg|png|gif)$/i;
        if (pattern.test(thumbnailKey) && show && !showE){
            addNewAlbum()
        }
        if (pattern.test(thumbnailKey) && !show && showE){
            editAlbum()
        }
    }, [thumbnailKey])

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);

        // Generate preview URL
        const imageURL = URL.createObjectURL(file);
        setThumbnail(imageURL);
    };

    // async function uploadProfilePicture(e) {
    //     setProfileLoading(true)
    //     const imageFile = e;
    //     try {

    //         const imageOne = imageFile;
    //         const storageRef = sRef(storage, `images/${imageOne.name}`);
    //         const fname = imageOne.name
    //         const ext = fname.split('.').pop();

    //         const uploadPromise = new Promise((resolve, reject) => {
    //             Storage.put(`images/${name}.${ext}`, imageOne).then(async (res)=>{ // ${imageOne.name}
    //                 resolve(res)
    //                 // resolve({"downloadUrl": downloadUrl, "key": res.key})
    //             }).catch((err)=>{
    //                 console.log(err);
    //                 setProfileLoading(false)
    //                 reject(err)
    //             });
    //         })
        
    //         const uploadResponse = await uploadPromise;
    //         const durl = await Storage.get(`images/${name}.${ext}`, { validateObjectExistence: true }); // ${imageOne.name}
    //         console.log(uploadResponse.key)
    //         setProfileLoading(false)
    //         setThumbnail(durl)
    //         setThumbnailKey(uploadResponse.key)

    //         // const uploadTask = uploadBytesResumable(storageRef, imageOne);
    //         // uploadTask.on('state_changed',
    //         //     (snapshot) => {
    //         //     },
    //         //     (error) => {
    //         //         alert(error)
    //         //     },
    //         //     () => {
    //         //         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
    //         //             setProfileLoading(false)
    //         //             setThumbnail(downloadURL)
    //         //         });
    //         //     }
    //         // );

    //     } catch (error) {
    //         alert(error)
    //         setProfileLoading(false)
    //     }
    // }

    async function uploadProfilePicture(e) {
        setProfileLoading(true)
        // const imageFile = e.target.files[0];
        const imageFile = e;
        try {

            const imageOne = imageFile;
            const storageRef = sRef(storage, `images/${imageOne.name}`);
            const fname = imageOne.name
            const ext = fname.split('.').pop();
            let uploadPromise;
            let durl;
            let uploadResponse;

            if (!showE){
                uploadPromise = new Promise((resolve, reject) => {
                    Storage.put(`images/${name}.${ext}`, imageOne).then(async (res)=>{ // ${imageOne.name}
                        resolve(res)
                        // resolve({"downloadUrl": downloadUrl, "key": res.key})
                    }).catch((err)=>{
                        console.log(err);
                        setProfileLoading(false)
                        reject(err)
                    });
                })
                uploadResponse = await uploadPromise;
                try {
                    durl = await Storage.get(`images/${name}.${ext}`, { validateObjectExistence: true }); // ${imageOne.name}
                } catch (err) {
                    console.log(err)
                    durl = await Storage.get(`images/${name}.jpeg`, { validateObjectExistence: true }); // ${imageOne.name}
                } finally {
                    durl = encodeURIComponent(`https://dn1i8z7909ivj.cloudfront.net/public/images/${name}.jpeg`)
                }
                
            } else {
                const versionKey = uuidv4().slice(0, 5);
                uploadPromise = new Promise((resolve, reject) => {
                    Storage.put(`images/version${versionKey} ${name}.${ext}`, imageOne).then(async (res)=>{ // ${imageOne.name}
                        resolve(res)
                        // resolve({"downloadUrl": downloadUrl, "key": res.key})
                    }).catch((err)=>{
                        console.log(err);
                        setProfileLoading(false)
                        reject(err)
                    });
                })
                uploadResponse = await uploadPromise;
                try{
                    durl = await Storage.get(`images/version${versionKey} ${name}.${ext}`, { validateObjectExistence: true }); // ${imageOne.name}
                } catch (err) {
                    console.log(err)
                    try {
                        durl = await Storage.get(`images/version${versionKey} ${name}.jpeg`, { validateObjectExistence: true }); // ${imageOne.name}
                    } catch (err2) {
                        durl = encodeURIComponent(`https://dn1i8z7909ivj.cloudfront.net/public/images/version${versionKey} ${name}.jpeg`)
                    }
                }
                
            }
        
            
            console.log(uploadResponse.key)
            setProfileLoading(false)
            setThumbnail(durl)
            const pattern = /^images\/.*\.(png)$/i;
            let newKey = uploadResponse.key
            if (pattern.test(uploadResponse.key)){
                newKey = replaceLastAtEnd(uploadResponse.key, '.png', '.jpeg')
            }

            setThumbnailKey(newKey)
            // addCreator()

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
            console.log(error)
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
        const addAlbum = await DataStore.save(Album, new Album(album))

        if (addAlbum) {
            alert('Album added successfuly')
            console.log("album added");
            setAllAlbums([...allAlbums, album])
            setName('')
            setThumbnail(admin_album)
            setThumbnailKey(null)
            setShow(false) 
        }

        // await API.graphql(graphqlOperation(createAlbum, {input: album})).then(()=>{
        //     alert('Album added successfuly')
        //     console.log("album added");
        //     setAllAlbums([...allAlbums, album])
        //     setName('')
        //     setThumbnail(admin_album)
        //     setThumbnailKey(null)
        //     setShow(false)
        // }).catch((error)=>{
        //     console.log(error);
        // });
    }

    async function editAlbum() {
        const key = selectedAlbum?.key
        const original = await DataStore.query(Song, key)
        if (imageFile){
            const album = {key: key, name: name, thumbnail: thumbnail, thumbnailKey: thumbnailKey};
            const editAlbum = await DataStore.save(Album.copyOf(original, updated => {
                updated.name = name
                updated.thumbnail = thumbnail
                updated.thumbnailKey = thumbnailKey
            }))

            if (editAlbum) {
                setAllAlbums([...allAlbums.map((albm)=>{ return albm.key === selectedAlbum.key ? album : albm})])
                alert("album edited");
                setShowE(false)
                setSpinner(false)
                setImageFile(null)
            } else {
                setSpinner(false)
            }
            // await API.graphql(graphqlOperation(updateAlbum, {input: album})).then(()=>{
            //     setAllAlbums([...allAlbums.map((albm)=>{ return albm.key === selectedAlbum.key ? album : albm})])
            //     alert("album edited");
            //     setShowE(false)
            //     setSpinner(false)
            //     setImageFile(null)
            // }).catch((error)=>{
            //     console.log(error);
            //     setSpinner(false)
            // });
        } else {
            const album = {key: key, name: name, thumbnail: selectedAlbum?.thumbnail, thumbnailKey: selectedAlbum?.thumbnailKey};
            const editAlbum = await DataStore.save(Album.copyOf(original, updated => {
                updated.name = name
            }))

            if (editAlbum) {
                setAllAlbums([...allAlbums.mapaddAlbum((albm)=>{ return albm.key === selectedAlbum.key ? album : albm})])
                alert("album edited");
                setShowE(false)
                setSpinner(false)
                setImageFile(null)
            } else {
                setSpinner(false)
            }
            // await API.graphql(graphqlOperation(updateAlbum, {input: album})).then(()=>{
            //     setAllAlbums([...allAlbums.map((albm)=>{return albm.key === selectedAlbum.key ? album : albm})])
            //     alert("album edited");
            //     setShowE(false)
            //     setSpinner(false)
            //     setImageFile(null)
            // }).catch((error)=>{
            //     console.log(error);
            //     setSpinner(false)
            // });
        }
    }

    async function deleteAlbum(key, thumbnailKey, albumName){
        if(window.confirm(`Are you sure you want to delete ${albumName}`)){
            const albumToDelete = await DataStore.query(Album, key)
            await DataStore.delete(albumToDelete).then(async (res)=>{
                console.log(res)
                await Storage.remove(thumbnailKey).then((resp)=>{
                    console.log(resp);
                    const updatedDeleteSpinner = [...deleteSpinner]
                    updatedDeleteSpinner[key] = false
                    setDeleteSpinner(updatedDeleteSpinner)
                    setAllAlbums([...allAlbums.filter((album)=> album.key !== key)])
                    alert('Album deleted succesfuly')
                })
            })
        }
    }

    async function addSongToAlbum(song, albumKey) {
        const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...modifiedSong } = song;
        const modifiedSongWithPartOf = { ...modifiedSong, partOf: albumKey };

        const original = await DataStore.query(Song, song?.key)
        const updateSong = await DataStore.save(Song.copyOf(original, updated => {
            updated.partOf = albumKey
        }))

        if (updateSong) {
            setAllSongs([...allSongs.map((sng) => { return sng.key === modifiedSongWithPartOf.key ? modifiedSongWithPartOf : sng} )])
            const updatedSongToAlbumSpinner = [...songToAlbumSpinner]
            updatedSongToAlbumSpinner[modifiedSongWithPartOf.key] = false
            setSongToAlbumSpinner(updatedSongToAlbumSpinner)
            alert(`${modifiedSongWithPartOf.name} added to ${selectedAlbum.name} album.`)
        }
        // await API.graphql(graphqlOperation(updateSong, { input: modifiedSongWithPartOf })).then((res)=>{
        //     setAllSongs([...allSongs.map((sng) => { return sng.key === modifiedSongWithPartOf.key ? modifiedSongWithPartOf : sng} )])
        //     const updatedSongToAlbumSpinner = [...songToAlbumSpinner]
        //     updatedSongToAlbumSpinner[modifiedSongWithPartOf.key] = false
        //     setSongToAlbumSpinner(updatedSongToAlbumSpinner)
        //     alert(`${modifiedSongWithPartOf.name} added to ${selectedAlbum.name} album.`)
        // })
    }
    async function removeSongFromAlbum(song) {
        const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...modifiedSong } = song;
        const modifiedSongWithPartOf = { ...modifiedSong, partOf: '' };
        const original = await DataStore.query(Song, song?.key)
        const updateSong = await DataStore.save(Song.copyOf(original, updated => {
            updated.partOf = ''
        }))

        if (updateSong) {
            setAllSongs([...allSongs.map((sng) => {return sng.key === modifiedSongWithPartOf.key ? modifiedSongWithPartOf : sng} )])
            const updatedSongToAlbumSpinner = [...songToAlbumSpinner]
            updatedSongToAlbumSpinner[modifiedSongWithPartOf.key] = false
            setSongToAlbumSpinner(updatedSongToAlbumSpinner)
            alert(`${modifiedSongWithPartOf.name} removed from ${selectedAlbum.name} album.`)
        }
        // await API.graphql(graphqlOperation(updateSong, { input: modifiedSongWithPartOf })).then((res)=>{
        //     setAllSongs([...allSongs.map((sng) => {return sng.key === modifiedSongWithPartOf.key ? modifiedSongWithPartOf : sng} )])
        //     const updatedSongToAlbumSpinner = [...songToAlbumSpinner]
        //     updatedSongToAlbumSpinner[modifiedSongWithPartOf.key] = false
        //     setSongToAlbumSpinner(updatedSongToAlbumSpinner)
        //     alert(`${modifiedSongWithPartOf.name} removed from ${selectedAlbum.name} album.`)
        // })
    }
    useEffect(()=>{
        if (showE){
            setThumbnail(encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+selectedAlbum?.thumbnailKey))
            setName(selectedAlbum?.name)
            setSongToAlbumSpinner([])
            setDeleteSpinner([])
        } else {
            setThumbnail(admin_album)
            setName('')
        }
    }, [showE])
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
                        {
                            !spinner ? 
                                <buttn onClick={async () => { setSpinner(true); await uploadProfilePicture(imageFile) }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                                    <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Add
                                </buttn>
                                :
                                <Spinner style={{ color: '#f3b007' }} />
                        }
                        
                    </div>
                </Modal.Body>
            </Modal>

            {/* edit album */}
            <Modal className='addLinkModal' show={showE} onHide={handleCloseE}>
                <Modal.Body>
                    <h2>Edit album</h2>
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
                        <buttn onClick={handleCloseE} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancel
                        </buttn>
                        {
                            !spinner ? 
                                <buttn onClick={async () => { setSpinner(true); imageFile ? await Storage.remove(selectedAlbum?.thumbnailKey).then(async () => await uploadProfilePicture(imageFile).then(async (upRes) => {alert('New album art uploaded. Please wait...'); })) : await editAlbum().then((res)=>{ console.log(res); alert('Album edited') }) } } style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                                    <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Save
                                </buttn>
                                :
                                <Spinner style={{ color: '#f3b007' }} />
                        }
                        
                    </div>
                </Modal.Body>
            </Modal>
            {/* edit album */}

            <Modal className='addLinkModal' show={showD} onHide={handleCloseD}>
                <Modal.Body>
                    <h2>Add songs in album</h2>
                    {
                        allSongs && allSongs.map((one) => {
                            return (
                                <div key={one?.key} style={{ width: '-webkit-fill-available', padding: '10px', borderRadius: '15px', display: 'flex' }}>
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
                                                
                                                !songToAlbumSpinner[one?.key] ? 
                                                    <div onClick={() => { const updatedSongToAlbumSpinner = [...songToAlbumSpinner]; updatedSongToAlbumSpinner[one?.key] = true; setSongToAlbumSpinner(updatedSongToAlbumSpinner); removeSongFromAlbum(one) }} style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', padding: '10px', color: '#f3b007' }}>
                                                        Remove
                                                    </div>
                                                    :
                                                    <Spinner style={{ color: '#f3b007' }} />
                                                
                                                
                                                :

                                                !songToAlbumSpinner[one?.key] ?
                                                    <div onClick={() => { const updatedSongToAlbumSpinner = [...songToAlbumSpinner]; updatedSongToAlbumSpinner[one?.key] = true; setSongToAlbumSpinner(updatedSongToAlbumSpinner); addSongToAlbum(one, selectedAlbum?.key) }} style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', padding: '10px', color: '#f3b007' }}>
                                                        Add
                                                    </div>
                                                    :
                                                    <Spinner style={{ color: '#f3b007' }} />
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
                                <div key={one?.key} style={{ width: '100%', marginBottom: '20px', height: 'calc(50vw - 20px)', padding: '10px', position: 'relative' }}>
                                    {
                                        !deleteSpinner[one?.key] ? 
                                            <span onClick={(e)=>{e.preventDefault(); const updatedDeleteSpinner = [...deleteSpinner]; updatedDeleteSpinner[one?.key] = true; setDeleteSpinner(updatedDeleteSpinner); deleteAlbum(one?.key, one?.thumbnailKey, one?.name)}} style={{position: 'absolute', right: '20px', top: '15px', cursor: 'pointer'}}><IoClose style={{background: 'white', color: 'red', fontSize: '1.7em'}}/></span>
                                            :
                                            <Spinner style={{ color: '#f3b007', position: 'absolute', right: '20px', top: '15px' }} />
                                    }
                                    <span onClick={(e)=>{e.preventDefault(); setSelectedAlbum(one); handleShowE()}} style={{position: 'absolute', right: '55px', top: '15px', cursor: 'pointer'}}><IoPencilSharp style={{background: 'white', color: 'red', fontSize: '1.7em'}}/></span>
                                    <span onClick={() => { setSelectedAlbum(one); handleShowD() }}>
                                        <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                            fallbackSrc={admin_album}
                                            style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                        />
                                        <p>{one.name}</p>
                                    </span>
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