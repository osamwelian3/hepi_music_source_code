import React, { useState, useRef, useEffect } from 'react'
import { IoAddOutline, IoAddSharp } from 'react-icons/io5'
import { Button, Modal, Spinner } from 'react-bootstrap';
import { auth, db, storage } from '../../config/fire';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, increment, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { BsCaretDown, BsCaretUp } from 'react-icons/bs';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { Amplify, Storage, API, graphqlOperation } from 'aws-amplify';
import { listCategories, listCreators, listSongs } from '../../graphql/queries';
import album_art from '../../components/fallbackImages/album_art.jpeg'
import music_placeholder from '../../components/fallbackImages/music_placeholder.png'
import { createSong, deleteSong as delSong, updateSong } from '../../graphql/mutations';
import awsconfig from '../../aws-exports';
import ImageWithFallback from '../../components/ImageWithFallback';
import { saveMusicFile } from '../../uploadFromUrl';
Amplify.configure(awsconfig)
function AdminSongs() {
    const [allSongs, setAllSongs] = useState(null)
    const [allCategories, setAllCategories] = useState(null)
    const [allCreators, setAllCreators] = useState(null)
    const [name, setName] = useState('')
    const [fileUrl, setFileUrl] = useState('')
    const [fileKey, setFileKey] = useState('')
    const [selectedCreator, setSelectedCreator] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [songUploading, setSongUploading] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)
    const [getFromUrl, setGetFromUrl] = useState(null)

    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showD, setShowD] = useState(false)
    const handleCloseD = () => setShowD(false);
    const handleShowD = () => setShowD(true);

    const [thumbnail, setThumbnail] = useState(music_placeholder)
    const [thumbnailKey, setThumbnailKey] = useState()
    const [profileLoading, setProfileLoading] = useState(false)
    const hiddenBrowseButton = useRef(null)

    useEffect(async () => {
        // onSnapshot(collection(db, 'categories'), (snap) => {
        //     let temp = []
        //     snap.docs.forEach(doc => {
        //         temp.push(doc.data())
        //     })
        //     setAllCategories(temp)
        // })
        await API.graphql(graphqlOperation(listCategories)).then((res) => {
            let temp = []
            res?.data?.listCategories?.items.forEach(doc => {
                temp.push(doc)
            })
            setAllCategories(temp)
        })
        // onSnapshot(collection(db, 'creators'), (snap) => {
        //     let temp = []
        //     snap.docs.forEach(doc => {
        //         temp.push(doc.data())
        //     })
        //     setAllCreators(temp)
        // })
        await API.graphql(graphqlOperation(listCreators)).then((res) => {
            let temp = []
            res?.data?.listCreators?.items.forEach(doc => {
                temp.push(doc)
            })
            setAllCreators(temp)
        })
        // onSnapshot(collection(db, 'songs'), (snap) => {
        //     let temp = []
        //     snap.docs.forEach(doc => {
        //         temp.push(doc.data())
        //         if (doc.data().key === selectedSong?.key) {
        //             setSelectedSong(doc.data())
        //         }
        //     })

        //     setAllSongs(temp)
        // })
        await API.graphql(graphqlOperation(listSongs)).then((res) => {
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
        const patternSong = /^files\/.*\.(mp3|wav|mpeg|mp4)$/i;
        if (pattern.test(thumbnailKey)){
            if (patternSong.test(fileKey)){
                addNewSong();
            }
        }
    }, [thumbnailKey, fileKey])

    useEffect(()=>{
        if (showD){
            console.log('thumbnailkey changed');
            console.log(thumbnailKey);
            const pattern = /^images\/.*\.(jpg|jpeg|png|gif)$/i;
            const patternSong = /^files\/.*\.(mp3|wav|mpeg|mp4)$/i;
            if (pattern.test(thumbnailKey)){
                editSong();
                if (patternSong.test(fileKey)){
                    editSong();
                }
            }
            if (name !== selectedSong.name) {
                editSong();
            }
        }
    }, [thumbnailKey, fileKey])

    const [imageFile, setImageFile] = useState()
    const [musicFile, setMusicFile] = useState()

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);

        // Generate preview URL
        const imageURL = URL.createObjectURL(file);
        setThumbnail(imageURL);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setMusicFile(file);
    };

    async function uploadProfilePicture(e) {
        alert('starting image upload')
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
    async function uploadFile(e) {
        alert('starting file upload')
        setFileUrl('')
        setSongUploading(true)
        if (getFromUrl !== null){
            let dfurl = await saveMusicFile(fileUrl)
            setSongUploading(false)
            setFileUrl(dfurl.downloadUrl)
            setFileKey(dfurl.key)
        } else {
            const imageFile = e;
            try {

                const imageOne = imageFile;
                const storageRef = sRef(storage, `files/${imageOne.name}`);
                const fname = imageOne.name
                const ext = fname.split('.').pop();

                const uploadPromise = new Promise((resolve, reject) => {
                    Storage.put(`files/${name}.${ext}`, imageOne).then(async (res)=>{ // ${imageOne.name}
                        resolve(res)
                        // resolve({"downloadUrl": downloadUrl, "key": res.key})
                    }).catch((err)=>{
                        console.log(err);
                        setProfileLoading(false)
                        reject(err)
                    });
                })
            
                const uploadResponse = await uploadPromise;
                const durl = await Storage.get(`files/${name}.${ext}`, { validateObjectExistence: true }); // ${imageOne.name}
                console.log(uploadResponse.key)
                setSongUploading(false)
                setFileUrl(durl)
                setFileKey(uploadResponse.key)

                // const uploadTask = uploadBytesResumable(storageRef, imageOne);
                // uploadTask.on('state_changed',
                //     (snapshot) => {
                //     },
                //     (error) => {
                //         alert(error)
                //     },
                //     () => {
                //         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                //             setFileUrl(downloadURL)
                //             setSongUploading(false)
                //         });
                //     }
                // );

            } catch (error) {
                alert(error)
                setSongUploading(false)
            }
        }
    };
 
    async function addNewSong() {
        const key = uuidv4()
        let temp = allCreators.filter(creator => creator.key === selectedCreator)
        // setDoc(doc(db, 'songs', key), {
        //     name,
        //     thumbnail,
        //     selectedCategory,
        //     selectedCreator: temp[0] ? temp[0] : null,
        //     fileUrl,
        //     listOfUidUpVotes: [],
        //     listOfUidDownVotes: [],
        //     key
        // }).then(() => {
        //     alert('added');
        //     setShow(false)
        //     setName('')
        // })
        const song = {key: key, fileUrl: fileUrl, fileKey: fileKey, listOfUidDownVotes: [], listOfUidUpVotes: [], name: name, partOf: null, selectedCategory: selectedCategory, selectedCreator: temp[0] ? JSON.stringify(temp[0]) : null, thumbnail: thumbnail, thumbnailKey: thumbnailKey};
        await API.graphql(graphqlOperation(createSong, { input: song })).then((res) => {
            alert('song added')
            setShow(false)
            setName('')
        })
    }
    async function editSong() {
        const pattern = /^images\/.*\.(jpg|jpeg|png|gif)$/i;
        const patternSong = /^files\/.*\.(mp3|wav|mpeg|mp4)$/i;
        if (imageFile){
            // await Storage.remove(selectedSong?.thumbnailKey).then(async (res)=>{
            //     await uploadProfilePicture(imageFile)
            // })
            if (musicFile){
                // addNewSong();
                // setDoc(doc(db, 'songs', selectedSong.key), {
                //     name,
                //     thumbnail,
                //     fileUrl
                // }, { merge: true }).then(() => {
                //     alert('edited');
                //     setShow(false)
                //     setName('')
                // })
                // await uploadFile(musicFile);
                const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...song } = selectedSong;
                const modifiedSong = { ...song, name: name, thumbnail: thumbnail, thumbnailKey: thumbnailKey, fileUrl: fileUrl, fileKey: fileKey }
                await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
                    alert('song edited')
                    setShow(false)
                    setName('')
                })
            } else {
                const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...song } = selectedSong;
                const modifiedSong = { ...song, name: name, thumbnail: thumbnail, thumbnailKey: thumbnailKey }
                await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
                    alert('song edited')
                    setShow(false)
                    setName('')
                })
            }
        } else if (musicFile){
            // await uploadFile(musicFile);
            const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...song } = selectedSong;
            const modifiedSong = { ...song, name: name, fileUrl: fileUrl, fileKey: fileKey }
            await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
                alert('song edited')
                setShow(false)
                setName('')
            })
        } else {
            const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...song } = selectedSong;
            const modifiedSong = { ...song, name: name }
            await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
                alert('song edited')
                setShow(false)
                setName('')
            })
        }
        
    }
    async function deleteSong() {
        const q = window.confirm('Do you really want to remove this song?')
        if (q) {
            // deleteDoc(doc(db, 'songs', selectedSong.key))
            await API.graphql(graphqlOperation(delSong, { input: { key: selectedSong?.key } })).then(async (res) => {
                await Storage.remove(selectedSong?.thumbnailKey).then((resp) => {
                    alert('song deleted')
                })
            })
            handleCloseD()
        }
    }
    function addVotes(key) {
        setDoc(doc(db, 'songs', key), {
            listOfUidUpVotes: arrayUnion(`Fake${uuidv4().slice(0, 4)}`)
        }, { merge: true })
    }
    function removeVotes(key) {
        setDoc(doc(db, 'songs', key), {
            listOfUidDownVotes: arrayUnion(`Fake${uuidv4().slice(0, 4)}`)
        }, { merge: true })
    }
    console.log(selectedSong);
    useEffect(() => {
        if (showD) {
            setName(selectedSong.name)
            setThumbnail(encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+selectedSong?.thumbnailKey))
            setFileUrl(selectedSong.fileUrl)
        } else {
            setName('')
            setThumbnail('https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png')
            setFileUrl('')
        }
    }, [showD])
    return (
        <div style={{ padding: '10px' }}>
            <Modal className='addLinkModal' show={show} onHide={handleClose}>
                <Modal.Body>
                    <h2>New song</h2>
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
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Upload mp3 file</p>
                    <center>
                        {
                            songUploading && <div style={{ height: '100px', width: '100px', borderRadius: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Spinner style={{ color: '#f3b007' }} />
                            </div>
                        }
                    </center>
                    <input onChange={(e) => { handleFileChange(e) }} type="file" style={{ borderRadius: '5px', fontSize: '1em', padding: '10px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', margin: '0px' }} />
                    <center><p style={{ margin: '0', color: '#6d6d6d' }}>OR</p></center>
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Url of the song</p>
                    <input type={'text'} value={fileUrl} onChange={(e) => { setFileUrl(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Name of the song</p>
                    <input type={'text'} value={name} onChange={(e) => { setName(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Creator of the song</p>
                    <select value={selectedCreator} onChange={(e) => { setSelectedCreator(e.target.value); }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }}>
                        <option>select creator</option>
                        {
                            allCreators && allCreators.map(data => {
                                return (
                                    <option value={data.key}>{data.name}</option>
                                )
                            })
                        }
                    </select>
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Category of the song</p>
                    <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }}>
                        <option>select category</option>
                        {
                            allCategories && allCategories.map(data => {
                                return (
                                    <option>{data.name}</option>
                                )
                            })
                        }
                    </select>
                    <div style={{ display: 'flex', marginTop: '20px' }}>
                        <buttn onClick={handleClose} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancel
                        </buttn>
                        <buttn onClick={async () => { await uploadProfilePicture(imageFile); await uploadFile(musicFile); }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Add
                        </buttn>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal className='addLinkModal' show={showD} onHide={handleCloseD}>
                <Modal.Body>
                    <h2>Edit song</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0px' }}>
                        <div style={{ flex: '.4' }}>
                            {
                                !profileLoading ?
                                    <ImageWithFallback style={{ height: '100px', width: '100px', borderRadius: '50vh' }} fallbackSrc={album_art} src={ thumbnail } />
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
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Upload mp3 file</p>
                    <center>
                        {
                            songUploading && <div style={{ height: '100px', width: '100px', borderRadius: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Spinner style={{ color: '#f3b007' }} />
                            </div>
                        }
                    </center>
                    <input onChange={(e) => { handleFileChange(e) }} type="file" style={{ borderRadius: '5px', fontSize: '1em', padding: '10px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', margin: '0px' }} />
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Name of the song</p>
                    {

                    }
                    <input type={'text'} value={name} onChange={(e) => { setName(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <p style={{ color: '#fff' }}>Name: {selectedSong?.name}</p>
                    <p style={{ color: '#fff' }}>Category: {selectedSong?.selectedCategory}</p>
                    <p style={{ color: '#fff' }}>Creator: {selectedSong?.selectedCreator ? selectedSong?.selectedCreator?.name : 'Not given'}</p>
                    <p style={{ color: '#fff' }}>Upvotes: {selectedSong?.listOfUidUpVotes?.length}</p>
                    <p style={{ color: '#fff' }}>DownVotes: {selectedSong?.listOfUidDownVotes?.length}</p>
                    <button style={{ color: '#fff', background: 'red', padding: '5px', borderRadius: '5px' }} onClick={() => { deleteSong() }}>Delete song</button>
                    <h1>Increase upvotes</h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={() => { removeVotes(selectedSong.key) }} className='btn'>Add DownVote</Button>
                        <Button onClick={() => { addVotes(selectedSong.key) }} className='btn'>Add UpVote</Button>
                    </div>
                    <div style={{ display: 'flex', marginTop: '20px' }}>
                        <buttn onClick={handleCloseD} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancel
                        </buttn>
                        <buttn onClick={async () => { imageFile ? await Storage.remove(selectedSong.thumbnailKey).then(async ()=> await uploadProfilePicture(imageFile).then(async ()=> musicFile ? await uploadFile(musicFile) : '') )  : musicFile ? await uploadFile(musicFile) : editSong(); handleCloseD() }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Save
                        </buttn>
                    </div>
                </Modal.Body>
            </Modal>
            <div onClick={() => { setShow(true); setSelectedSong(null); }} style={{ width: '-webkit-fill-available', height: '70px', border: '1px solid #f3b007', borderRadius: '10px', color: '#f3b007', margin: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IoAddSharp style={{ color: '#f3b007', margin: '0', fontSize: '2em', marginRight: '7px' }} />
                <h1 style={{ color: '#f3b007', margin: '0' }}>Add new</h1>
            </div>
            <h6 style={{ marginBottom: '15px' }}>All songs</h6>
            <div style={{ padding: '10px', paddingTop: '0', width: '100%', height: 'max-content' }}>
                {
                    allSongs && allSongs.map((one) => {
                        return (
                            <>
                                <div onClick={() => { setSelectedSong(one); setImageFile(null); setMusicFile(null); handleShowD() }} style={{ width: '-webkit-fill-available', padding: '10px', borderRadius: '15px', display: 'flex' }}>
                                    <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one.thumbnailKey)}
                                        fallbackSrc={album_art}
                                        style={{ height: '70px', width: '70px', borderRadius: '5px', marginRight: '15px' }}
                                    />
                                    <div style={{ flex: '1' }}>
                                        <h5>{one.name}</h5>
                                        <h6>{one?.selectedCreator?.name}</h6>
                                    </div>
                                    <div onClick={(e) => { e.stopPropagation() }} style={{ flex: '0.5', display: 'flex' }}>
                                        {
                                            <div onClick={() => { addVotes(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                <BsCaretUp style={{ fontSize: '1.7em' }} />
                                                {one?.listOfUidUpVotes?.length}
                                            </div>
                                        }
                                        {
                                            <div onClick={() => { removeVotes(one.key) }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                {/* <AiFillCaretDown style={{ fontSize: '1.7em' }} /> */}
                                                <BsCaretDown style={{ fontSize: '1.7em' }} />
                                                {one?.listOfUidDownVotes?.length}
                                            </div>
                                        }
                                    </div>
                                </div>
                                <hr></hr>
                            </>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default AdminSongs