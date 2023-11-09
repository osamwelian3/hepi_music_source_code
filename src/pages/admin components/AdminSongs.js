import React, { useState, useRef, useEffect } from 'react'
import { IoAddOutline, IoAddSharp, IoCloseSharp } from 'react-icons/io5'
import { Button, Modal, Spinner } from 'react-bootstrap';
import { auth, db, storage } from '../../config/fire';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, increment, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { BsCaretDown, BsCaretUp } from 'react-icons/bs';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { Amplify, Storage, API, graphqlOperation, DataStore } from 'aws-amplify';
import { listCategories, listCreators, listSongs } from '../../graphql/queries';
import album_art from '../../components/fallbackImages/album_art.jpeg'
import music_placeholder from '../../components/fallbackImages/music_placeholder.png'
import { createSong, deleteSong as delSong, updateSong } from '../../graphql/mutations';
import awsconfig from '../../aws-exports';
import ImageWithFallback from '../../components/ImageWithFallback';
import { saveMusicFile } from '../../uploadFromUrl';
import { StyleRoot } from 'radium'
import { replaceLastAtEnd } from '../../utilities/utility';
import { FaSearch } from 'react-icons/fa';
import { Category, Creator, Song } from '../../models';
Amplify.configure(awsconfig)
function AdminSongs() {
    const [allSongs, setAllSongs] = useState(null)
    const [prevAllSongs, setPrevAllSongs] = useState(null)
    const [allCategories, setAllCategories] = useState(null)
    const [allCreators, setAllCreators] = useState(null)
    const [name, setName] = useState('')
    const [fileUrl, setFileUrl] = useState('')
    const [fileSelected, setFileSelected] = useState(false)
    const [fileKey, setFileKey] = useState('')
    const [selectedCreator, setSelectedCreator] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [songUploading, setSongUploading] = useState(false)
    const [spinner, setSpinner] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)
    const [getFromUrl, setGetFromUrl] = useState(null)
    const [q, setQ] = useState('')

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
        const sub1 = DataStore.observeQuery(Category, null, { limit: 10000 }).subscribe(snapshot => {
            const {items, isSynced} = snapshot
            let temp = []
            if (isSynced) {
              items.forEach((category) => {
                temp.push(category)
              })
              setAllCategories(temp)
            }
          })
        // await API.graphql(graphqlOperation(listCategories, {limit: 1000000})).then((res) => {
        //     let temp = []
        //     res?.data?.listCategories?.items.forEach(doc => {
        //         temp.push(doc)
        //     })
        //     setAllCategories(temp)
        // })
        const sub2 = DataStore.observeQuery(Creator, null, { limit: 10000 }).subscribe(snapshot => {
            const {items, isSynced} = snapshot
            let temp = []
            if (isSynced) {
              items.forEach((creator) => {
                temp.push(creator)
              })
              setAllCreators(temp)
            }
          })

        // await API.graphql(graphqlOperation(listCreators, {limit: 1000000})).then((res) => {
        //     let temp = []
        //     res?.data?.listCreators?.items.forEach(doc => {
        //         temp.push(doc)
        //     })
        //     setAllCreators(temp)
        // })

        const limit = 1000000;
        const sub3 = DataStore.observeQuery(Song, null, { limit: 10000 }).subscribe(snapshot => {
            const {items, isSynced} = snapshot
            let temp = []
            if (isSynced) {
              items.forEach((song) => {
                temp.push(song)
              })
              setAllSongs(temp)
            }
          })
        // await API.graphql(graphqlOperation(listSongs, {limit: 1000000})).then((res) => {
        //     console.log(res)
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
            if (sub3) {
                sub3.unsubscribe()
            }
        }
    }, [])

    useEffect(()=>{
        console.log('thumbnailkey changed');
        console.log(thumbnailKey);
        const pattern = /^images\/.*\.(jpg|jpeg|png|gif)$/i;
        const patternImageFile = /^images\/.*$/i;
        const patternSong = /^files\/.*\.(aac|aif|aiff|amr|ape|au|flac|gsm|it|m3u|m4a|mid|mka|mp3|mpa|mpc|mpga|oga|ogg|opus|ra|ram|rm|s3m|sid|wav|webm|wma|xm)$/i;
        const patternFile = /^files\/.*$/i;
        if (pattern.test(thumbnailKey) || patternImageFile.test(thumbnailKey)){
            if (patternSong.test(fileKey) || patternFile.test(fileKey)){
                addNewSong();
            }
        }
    }, [thumbnailKey, fileKey])

    useEffect(()=>{
        if (showD){
            console.log('thumbnailkey changed');
            console.log(thumbnailKey);
            const pattern = /^images\/.*\.(jpg|jpeg|png|gif)$/i;
            const patternImageFile = /^images\/.*$/i;
            const patternSong = /^files\/.*\.(aac|aif|aiff|amr|ape|au|flac|gsm|it|m3u|m4a|mid|mka|mp3|mpa|mpc|mpga|oga|ogg|opus|ra|ram|rm|s3m|sid|wav|webm|wma|xm)$/i;
            const patternFile = /^files\/.*$/i;
            if (pattern.test(thumbnailKey) || patternImageFile.test(thumbnailKey)){
                editSong();
                if (patternSong.test(fileKey) || patternFile.test(fileKey)){
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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        console.log(file.type)
        setMusicFile(file);
        setFileSelected(true)
        setFileUrl('')
    };

    // async function uploadProfilePicture(e) {
    //     alert('starting image upload')
    //     setProfileLoading(true)
    //     const imageFile = e;
    //     try {

    //         const imageOne = imageFile;
    //         const storageRef = sRef(storage, `images/${imageOne.name}`);
    //         const fname = imageOne.name
    //         const lastDotIndex = fname.lastIndexOf(".");
    //         const ext = fname.substring(lastDotIndex + 1);

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

            if (!showD){
                uploadPromise = new Promise((resolve, reject) => {
                    Storage.put(`images/${name.trim()}.${ext}`, imageOne).then(async (res)=>{ // ${imageOne.name}
                        resolve(res)
                        // resolve({"downloadUrl": downloadUrl, "key": res.key})
                    }).catch((err)=>{
                        console.log(err);
                        setProfileLoading(false)
                        setSpinner(false)
                        reject(err)
                    });
                })
                uploadResponse = await uploadPromise;
                try {
                    durl = await Storage.get(`images/${name.trim()}.${ext}`, { validateObjectExistence: true }); // ${imageOne.name}
                } catch (err) {
                    console.log(err)
                    durl = await Storage.get(`images/${name.trim()}.jpeg`, { validateObjectExistence: true }); // ${imageOne.name}
                } finally {
                    durl = encodeURIComponent(`https://dn1i8z7909ivj.cloudfront.net/public/images/${name.trim()}.jpeg`)
                }
                
            } else {
                const versionKey = uuidv4().slice(0, 5);
                uploadPromise = new Promise((resolve, reject) => {
                    Storage.put(`images/version${versionKey} ${name.trim()}.${ext}`, imageOne).then(async (res)=>{ // ${imageOne.name}
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
                    durl = await Storage.get(`images/version${versionKey} ${name.trim()}.${ext}`, { validateObjectExistence: true }); // ${imageOne.name}
                } catch (err) {
                    console.log(err)
                    try {
                        durl = await Storage.get(`images/version${versionKey} ${name.trim()}.jpeg`, { validateObjectExistence: true }); // ${imageOne.name}
                    } catch (err2) {
                        durl = encodeURIComponent(`https://dn1i8z7909ivj.cloudfront.net/public/images/version${versionKey} ${name.trim()}.jpeg`)
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
            setSpinner(false)
        }
    }
    async function uploadFile(e) {
        setSongUploading(true)
        if (getFromUrl !== null){
            alert('getting music file from provided link link')
            let dfurl = await saveMusicFile(fileUrl)
            setSongUploading(false)
            setFileUrl(dfurl.downloadUrl)
            setFileKey(dfurl.key)
        } else {
            alert('starting file upload')
            setFileUrl('')
            const imageFile = e;
            try {

                const imageOne = imageFile;
                const storageRef = sRef(storage, `files/${imageOne.name}`);
                const fname = imageOne.name
                const ext = fname.split('.')[fname.split('.').length-1];
                let fileNameExt = '';
                const patternSong = /^files\/.*\.(aac|aif|aiff|amr|ape|au|flac|gsm|it|m3u|m4a|mid|mka|mp3|mpa|mpc|mpga|oga|ogg|opus|ra|ram|rm|s3m|sid|wav|webm|wma|xm)$/i;
                if (patternSong.test('files/music.'+ext)){
                    fileNameExt = `files/${name}.${ext}`;
                } else {
                    fileNameExt = `files/${name}`
                }

                const uploadPromise = new Promise((resolve, reject) => {
                    Storage.put(fileNameExt, imageOne).then(async (res)=>{ // ${imageOne.name}
                        resolve(res)
                        // resolve({"downloadUrl": downloadUrl, "key": res.key})
                    }).catch((err)=>{
                        console.log(err);
                        setProfileLoading(false)
                        setSpinner(false)
                        reject(err)
                    });
                })
            
                const uploadResponse = await uploadPromise;
                const durl = await Storage.get(fileNameExt, { validateObjectExistence: true }); // ${imageOne.name}
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
                console.log(error)
                alert(error)
                setSongUploading(false)
                setSpinner(false)
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
        const song = {key: key, fileUrl: fileUrl, fileKey: fileKey, listens: [], trendingListens: [], listOfUidDownVotes: [], listOfUidUpVotes: [], name: name.trim(), partOf: null, selectedCategory: selectedCategory, selectedCreator: temp[0] ? JSON.stringify(temp[0]) : null, thumbnail: thumbnail, thumbnailKey: thumbnailKey};
        const addSong = await DataStore.save(new Song(song))
        if (addSong) {
            alert('song added')
            setShow(false)
            setSpinner(false)
            setName('')
            setAllSongs([song, ...allSongs]);
            setName('')
            setThumbnail('https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png')
            setFileUrl('')
            setFileKey('')
            setThumbnailKey('')
            setSelectedCreator('')
            setSelectedCategory('')
        }
        // await API.graphql(graphqlOperation(createSong, { input: song })).then((res) => {
        //     alert('song added')
        //     setShow(false)
        //     setSpinner(false)
        //     setName('')
        //     setAllSongs([song, ...allSongs]);
        //     setName('')
        //     setThumbnail('https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png')
        //     setFileUrl('')
        //     setFileKey('')
        //     setThumbnailKey('')
        //     setSelectedCreator('')
        //     setSelectedCategory('')
        // })
    }
    async function editSong() {
        let temp = allCreators.filter(creator => creator.key === selectedCreator)
        const pattern = /^images\/.*\.(jpg|jpeg|png|gif)$/i;
        const patternSong = /^files\/.*\.(mp3|wav|mpeg|mp4)$/i;
        if (imageFile){
            // await Storage.remove(selectedSong?.thumbnailKey).then(async (res)=>{
            //     await uploadProfilePicture(imageFile)
            // })
            if (musicFile){
                const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...song } = selectedSong;
                const modifiedSong = { ...song, name: name.trim(), thumbnail: thumbnail, thumbnailKey: thumbnailKey, fileUrl: fileUrl, fileKey: fileKey, selectedCategory: selectedCategory, selectedCreator: temp[0] ? JSON.stringify(temp[0]) : null }
                const original = await DataStore.query(Song, selectedSong?.key)
                if (original) {
                    console.log('DataStore fetch Song to edit Success')
                    const updatedSong = await DataStore.save(
                        Song.copyOf(original, updated => {
                            updated.name = name.trim()
                            updated.thumbnail = thumbnail
                            updated.thumbnailKey = thumbnailKey
                            updated.fileUrl = fileUrl
                            updated.fileKey = fileKey
                            updated.selectedCategory = selectedCategory
                            updated.selectedCreator = temp[0] ? JSON.stringify(temp[0]) : null
                        })
                    )
                    if (updatedSong) {
                        console.log('DataStore edit Song Success')
                            alert('song edited')
                            setShowD(false)
                            setSpinner(false)
                            setName('')
                            setFileKey('')
                            setThumbnailKey('')
                            setAllSongs(allSongs.map((songItem) => {
                                if (songItem.key === selectedSong?.key){
                                    return modifiedSong;
                                }
                                return songItem;
                            }))
                    } else {
                        console.log('DataStore edit Song Failed')
                    }
                } else {
                    console.log('DataStore fetch Song to edit Failed')
                }
                // await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
                //     alert('song edited')
                //     setShowD(false)
                //     setSpinner(false)
                //     setName('')
                //     setFileKey('')
                //     setThumbnailKey('')
                //     setAllSongs(allSongs.map((songItem) => {
                //         if (songItem.key === selectedSong?.key){
                //             return modifiedSong;
                //         }
                //         return songItem;
                //     }))
                // })
            } else {
                const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...song } = selectedSong;
                const modifiedSong = { ...song, name: name.trim(), thumbnail: thumbnail, thumbnailKey: thumbnailKey, selectedCategory: selectedCategory, selectedCreator: temp[0] ? JSON.stringify(temp[0]) : null }
                const original = await DataStore.query(Song, selectedSong?.key)
                if (original) {
                    console.log('DataStore fetch Song to edit Success')
                    const updatedSong = await DataStore.save(
                        Song.copyOf(original, updated => {
                            updated.name = name.trim()
                            updated.thumbnail = thumbnail
                            updated.thumbnailKey = thumbnailKey
                            updated.selectedCategory = selectedCategory
                            updated.selectedCreator = temp[0] ? JSON.stringify(temp[0]) : null
                        })
                    )
                    if (updatedSong) {
                        console.log('DataStore edit Song Success')
                        alert('song edited')
                        setShowD(false)
                        setSpinner(false)
                        setName('')
                        setFileKey('')
                        setThumbnailKey('')
                        setAllSongs(allSongs.map((songItem) => {
                            if (songItem.key === selectedSong?.key){
                                return modifiedSong;
                            }
                            return songItem;
                        }))
                    } else {
                        console.log('DataStore edit Song Failed')
                    }
                } else {
                    console.log('DataStore fetch Song to edit Failed')
                }

                // await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
                //     alert('song edited')
                //     setShowD(false)
                //     setSpinner(false)
                //     setName('')
                //     setFileKey('')
                //     setThumbnailKey('')
                //     setAllSongs(allSongs.map((songItem) => {
                //         if (songItem.key === selectedSong?.key){
                //             return modifiedSong;
                //         }
                //         return songItem;
                //     }))
                // })
            }
        } else if (musicFile){
            // await uploadFile(musicFile);
            const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...song } = selectedSong;
            const modifiedSong = { ...song, name: name.trim(), fileUrl: fileUrl, fileKey: fileKey, selectedCategory: selectedCategory, selectedCreator: temp[0] ? JSON.stringify(temp[0]) : null }
            const original = await DataStore.query(Song, selectedSong?.key)
            if (original) {
                console.log('DataStore fetch Song to edit Success')
                const updatedSong = await DataStore.save(
                    Song.copyOf(original, updated => {
                        updated.name = name.trim()
                        updated.fileUrl = fileUrl
                        updated.fileKey = fileKey
                        updated.selectedCategory = selectedCategory
                        updated.selectedCreator = temp[0] ? JSON.stringify(temp[0]) : null
                    })
                )
                if (updatedSong) {
                    console.log('DataStore edit Song Success')
                    alert('song edited')
                    setShowD(false)
                    setSpinner(false)
                    setName('')
                    setFileKey('')
                    setThumbnailKey('')
                    setAllSongs(allSongs.map((songItem) => {
                        if (songItem.key === selectedSong?.key){
                            return modifiedSong;
                        }
                        return songItem;
                    }))
                } else {
                    console.log('DataStore edit Song Failed')
                }
            } else {
                console.log('DataStore fetch Song to edit Failed')
            }
            // await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
            //     alert('song edited')
            //     setShowD(false)
            //     setSpinner(false)
            //     setName('')
            //     setFileKey('')
            //     setThumbnailKey('')
            //     setAllSongs(allSongs.map((songItem) => {
            //         if (songItem.key === selectedSong?.key){
            //             return modifiedSong;
            //         }
            //         return songItem;
            //     }))
            // })
        } else {
            const { createdAt, updatedAt, _deleted, _lastChangedAt, listOfUidUpVotes, listOfUidDownVotes, ...song } = selectedSong;
            const modifiedSong = { ...song, name: name.trim(), selectedCategory: selectedCategory, selectedCreator: temp[0] ? JSON.stringify(temp[0]) : null }
            const original = await DataStore.query(Song, selectedSong?.key)
            if (original) {
                console.log('DataStore fetch Song to edit Success')
                const updatedSong = await DataStore.save(
                    Song.copyOf(original, updated => {
                        updated.name = name.trim()
                        updated.selectedCategory = selectedCategory
                        updated.selectedCreator = temp[0] ? JSON.stringify(temp[0]) : null
                    })
                )
                if (updatedSong) {
                    console.log('DataStore edit Song Success')
                    alert('song edited')
                    setShowD(false)
                    setSpinner(false)
                    setName('')
                    setFileKey('')
                    setThumbnailKey('')
                    const modifiedSong2 = {
                        ...modifiedSong,
                        createdAt: selectedSong?.createdAt,
                        updatedAt: selectedSong?.updatedAt,
                        _deleted: selectedSong?._deleted,
                        _lastChangedAt: selectedSong?._lastChangedAt,
                        listOfUidUpVotes: selectedSong?.listOfUidUpVotes,
                        listOfUidDownVotes: selectedSong?.listOfUidDownVotes
                        };
                    setAllSongs(allSongs.map((songItem) => {
                        if (songItem.key === selectedSong?.key){
                            return modifiedSong2;
                        }
                        return songItem;
                    }))
                } else {
                    console.log('DataStore edit Song Failed')
                }
            } else {
                console.log('DataStore fetch Song to edit Failed')
            }
            // await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
            //     alert('song edited')
            //     setShowD(false)
            //     setSpinner(false)
            //     setName('')
            //     setFileKey('')
            //     setThumbnailKey('')
            //     const modifiedSong2 = {
            //         ...modifiedSong,
            //         createdAt: selectedSong?.createdAt,
            //         updatedAt: selectedSong?.updatedAt,
            //         _deleted: selectedSong?._deleted,
            //         _lastChangedAt: selectedSong?._lastChangedAt,
            //         listOfUidUpVotes: selectedSong?.listOfUidUpVotes,
            //         listOfUidDownVotes: selectedSong?.listOfUidDownVotes
            //       };
            //     setAllSongs(allSongs.map((songItem) => {
            //         if (songItem.key === selectedSong?.key){
            //             return modifiedSong2;
            //         }
            //         return songItem;
            //     }))
            // })
        }
        
    }
    async function deleteSong() {
        const q = window.confirm('Do you really want to remove this song?')
        if (q) {
            // deleteDoc(doc(db, 'songs', selectedSong.key))
            const songToDelete = await DataStore.query(Song, selectedSong?.key)
            DataStore.delete(songToDelete).then(async (res) => {
                await Storage.remove(selectedSong?.thumbnailKey).then(async (resp) => {
                    await Storage.remove(selectedSong?.fileKey).then((resp2)=>{
                        alert('song deleted')
                        setAllSongs([...allSongs.filter((song) => song.key !== selectedSong?.key)])
                        // setAllSongs(allSongs.map((songItem) => {
                        //     if (songItem.key === selectedSong?.key){
                        //         // return ;
                        //     }
                        //     return songItem;
                        // }))
                    })
                })
            })
            handleCloseD()
            setSpinner(false)
        }
    }
    async function addVotes(key) {
        if (showD && selectedSong){
            setSelectedSong({...selectedSong, listOfUidUpVotes: [...selectedSong.listOfUidUpVotes, `Fake${uuidv4().slice(0, 4)}`],})
        }
        setPrevAllSongs(allSongs);
        const updateArr = allSongs.map((item) => {
            if (item.key === key) {
              return {
                ...item,
                listOfUidUpVotes: [...item.listOfUidUpVotes, `Fake${uuidv4().slice(0, 4)}`],
              };
            }
            return item;
        });
        setAllSongs(updateArr);
        // const song  = allSongs.filter((song) => song.key === key)[0]
        // console.log(song);
        // console.log(song.listOfUidUpVotes);
        // let temp = [];
        // temp = temp.concat(song.listOfUidUpVotes);
        // const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = song;
        // temp.push(`Fake${uuidv4().slice(0, 4)}`)
        // modifiedSong.listOfUidUpVotes = temp;
        // console.log(modifiedSong);

        const original = await DataStore.query(Song, key)

        if (original) {
            console.log('DataStore fetch upvote Song Success')
            let temp = []
            temp = temp.concat(original.listOfUidUpVotes);
            temp.push(`Fake${uuidv4().slice(0, 4)}`)
            const updatedSong = await DataStore.save(
                Song.copyOf(original, updated => {
                    updated.listOfUidUpVotes = temp
                })
            )
            if (updatedSong) {
                console.log('DataStore Update upvote Song Success')
                setPrevAllSongs(null);
            } else {
                console.log('DataStore Update upvote Song Failed')
            }
        } else {
            console.log('DataStore fetch upvote Song Failed')
        }
        // await API.graphql(graphqlOperation(updateSong, {input: modifiedSong})).then((res)=>{
        //     console.log(res);
        //     setPrevAllSongs(null);
        // });
    }
    async function removeLastUpVote(key) {
        if (showD && selectedSong) {
          setSelectedSong((prevSelectedSong) => {
            const updatedListOfUpVotes = [...prevSelectedSong.listOfUidUpVotes];
            const lastFakeIndex = updatedListOfUpVotes.findIndex((vote) => vote.startsWith('Fake'));
            if (lastFakeIndex !== -1) {
              updatedListOfUpVotes.splice(lastFakeIndex, 1); // Remove the last fake upvote
            }
            return { ...prevSelectedSong, listOfUidUpVotes: updatedListOfUpVotes };
          });
        }
        
        setPrevAllSongs(allSongs);
        
        const updateArr = allSongs.map((item) => {
          if (item.key === key) {
            const updatedListOfUpVotes = [...item.listOfUidUpVotes];
            const lastFakeIndex = updatedListOfUpVotes.findIndex((vote) => vote.startsWith('Fake'));
            if (lastFakeIndex !== -1) {
              updatedListOfUpVotes.splice(lastFakeIndex, 1); // Remove the last fake upvote
            }
            return { ...item, listOfUidUpVotes: updatedListOfUpVotes };
          }
          return item;
        });
      
        setAllSongs(updateArr);
        
        // const getSong = allSongs.find((song) => song.key === key);
        // const { createdAt, updatedAt, _deleted, _lastChangedAt, ...song } = getSong;
        // const updatedListOfUpVotes = [...song.listOfUidUpVotes];
        // const lastFakeIndex = updatedListOfUpVotes.findIndex((vote) => vote.startsWith('Fake'));
        // if (lastFakeIndex !== -1) {
        //   updatedListOfUpVotes.splice(lastFakeIndex, 1); // Remove the last fake upvote
        // }
        
        // const modifiedSong = {
        //   ...song,
        //   listOfUidUpVotes: updatedListOfUpVotes,
        // };

        const original = await DataStore.query(Song, key)

        if (original) {
            console.log('DataStore fetch upvote Song Success')
            let temp = []
            temp = temp.concat(original.listOfUidUpVotes);
            
            const lastFakeIndex = temp.findIndex((vote) => vote.startsWith('Fake'));
            if (lastFakeIndex !== -1) {
                temp.splice(lastFakeIndex, 1); // Remove the last fake upvote
            }
            const updatedSong = await DataStore.save(
                Song.copyOf(original, updated => {
                    updated.listOfUidUpVotes = temp
                })
            )
            if (updatedSong) {
                console.log('DataStore Update upvote Song Success')
                setPrevAllSongs(null);
            } else {
                console.log('DataStore Update upvote Song Failed')
            }
        } else {
            console.log('DataStore fetch upvote Song Failed')
        }
        
        // await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
        //   console.log(res);
        //   setPrevAllSongs(null);
        // });
      }
      
    async function removeVotes(key) {
        if (showD && selectedSong){
            setSelectedSong({...selectedSong, listOfUidDownVotes: [...selectedSong.listOfUidDownVotes, `Fake${uuidv4().slice(0, 4)}`],})
        }
        setPrevAllSongs(allSongs);
        const updateArr = allSongs.map((item) => {
            if (item.key === key) {
              return {
                ...item,
                listOfUidDownVotes: [...item.listOfUidDownVotes, `Fake${uuidv4().slice(0, 4)}`],
              };
            }
            return item;
        });
        setAllSongs(updateArr);
        // const song  = allSongs.filter((song) => song.key === key)[0]
        // console.log(song);
        // console.log(song.listOfUidDownVotes);
        // let temp = [];
        // temp = temp.concat(song.listOfUidDownVotes);
        // const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = song;
        // temp.push(`Fake${uuidv4().slice(0, 4)}`)
        // modifiedSong.listOfUidDownVotes = temp;
        // console.log(modifiedSong);

        const original = await DataStore.query(Song, key)

        if (original) {
            console.log('DataStore fetch downvote Song Success')
            let temp = []
            temp = temp.concat(original.listOfUidDownVotes);
            temp.push(`Fake${uuidv4().slice(0, 4)}`)
            const updatedSong = await DataStore.save(
                Song.copyOf(original, updated => {
                    updated.listOfUidDownVotes = temp
                })
            )
            if (updatedSong) {
                console.log('DataStore Update downvote Song Success')
                setPrevAllSongs(null);
            } else {
                console.log('DataStore Update downvote Song Failed')
            }
        } else {
            console.log('DataStore fetch downvote Song Failed')
        }
        // await API.graphql(graphqlOperation(updateSong, {input: modifiedSong})).then((res)=>{
        //     console.log(res);
        //     setPrevAllSongs(null);
        // });
    }
    async function removeLastDownVote(key) {
        if (showD && selectedSong) {
          setSelectedSong((prevSelectedSong) => {
            const updatedListOfDownVotes = [...prevSelectedSong.listOfUidDownVotes];
            const lastFakeIndex = updatedListOfDownVotes.findIndex((vote) => vote.startsWith('Fake'));
            if (lastFakeIndex !== -1) {
              updatedListOfDownVotes.splice(lastFakeIndex, 1); // Remove the last fake downvote
            }
            return { ...prevSelectedSong, listOfUidDownVotes: updatedListOfDownVotes };
          });
        }
        
        setPrevAllSongs(allSongs);
        
        const updateArr = allSongs.map((item) => {
          if (item.key === key) {
            const updatedListOfDownVotes = [...item.listOfUidDownVotes];
            const lastFakeIndex = updatedListOfDownVotes.findIndex((vote) => vote.startsWith('Fake'));
            if (lastFakeIndex !== -1) {
              updatedListOfDownVotes.splice(lastFakeIndex, 1); // Remove the last fake downvote
            }
            return { ...item, listOfUidDownVotes: updatedListOfDownVotes };
          }
          return item;
        });
      
        setAllSongs(updateArr);
        
        // const getSong = allSongs.find((song) => song.key === key);
        // const { createdAt, updatedAt, _deleted, _lastChangedAt, ...song } = getSong;
        // const updatedListOfDownVotes = [...song.listOfUidDownVotes];
        // const lastFakeIndex = updatedListOfDownVotes.findIndex((vote) => vote.startsWith('Fake'));
        // if (lastFakeIndex !== -1) {
        //   updatedListOfDownVotes.splice(lastFakeIndex, 1); // Remove the last fake downvote
        // }
        
        // const modifiedSong = {
        //   ...song,
        //   listOfUidDownVotes: updatedListOfDownVotes,
        // };
        
        const original = await DataStore.query(Song, key)

        if (original) {
            console.log('DataStore fetch upvote Song Success')
            let temp = []
            temp = temp.concat(original.listOfUidDownVotes);
            
            const lastFakeIndex = temp.findIndex((vote) => vote.startsWith('Fake'));
            if (lastFakeIndex !== -1) {
                temp.splice(lastFakeIndex, 1); // Remove the last fake upvote
            }
            const updatedSong = await DataStore.save(
                Song.copyOf(original, updated => {
                    updated.listOfUidDownVotes = temp
                })
            )
            if (updatedSong) {
                console.log('DataStore Update upvote Song Success')
                setPrevAllSongs(null);
            } else {
                console.log('DataStore Update upvote Song Failed')
            }
        } else {
            console.log('DataStore fetch upvote Song Failed')
        }
        // await API.graphql(graphqlOperation(updateSong, { input: modifiedSong })).then((res) => {
        //   console.log(res);
        //   setPrevAllSongs(null);
        // });
      }

    console.log(selectedSong);
    console.log(allSongs);
    console.log(typeof allSongs === 'object')
    useEffect(() => {
        if (showD) {
            setSpinner(false)
            setName(selectedSong.name)
            setThumbnail(encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+selectedSong?.thumbnailKey))
            setFileUrl(selectedSong.fileUrl)
            setSelectedCreator(JSON.parse(selectedSong?.selectedCreator)?.name)
            setSelectedCategory(selectedSong?.selectedCategory)
        } else {
            setSpinner(false)
            setName('')
            setThumbnail('https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png')
            setFileUrl('')
            setSelectedCreator('')
            setSelectedCategory('')
        }
    }, [showD])
    return (
        <StyleRoot>
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
                    {!fileSelected && <><center><p style={{ margin: '0', color: '#6d6d6d' }}>OR</p></center>
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Url of the song</p>
                    <input type={'text'} value={fileUrl} onChange={(e) => { setFileUrl(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} /></>}
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
                        {
                            !spinner ? 
                                <buttn onClick={async () => { setSpinner(true); await uploadProfilePicture(imageFile); await uploadFile(musicFile); }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                                    <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Add
                                </buttn>
                                :
                                <Spinner style={{ color: '#f3b007' }} />
                        }
                        
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
                    <p style={{ color: '#fff' }}>Name: {selectedSong?.name}</p>
                    <p style={{ color: '#fff' }}>Category: {selectedSong?.selectedCategory}</p>
                    <p style={{ color: '#fff' }}>Creator: {selectedSong?.selectedCreator ? JSON.parse(selectedSong?.selectedCreator).name : 'Not given'}</p>
                    <p style={{ color: '#fff' }}>Upvotes: {selectedSong?.listOfUidUpVotes?.length}</p>
                    <p style={{ color: '#fff' }}>DownVotes: {selectedSong?.listOfUidDownVotes?.length}</p>
                    {
                        !spinner ? 
                            <button style={{ color: '#fff', background: 'red', padding: '5px', borderRadius: '5px' }} onClick={() => { setSpinner(true); deleteSong() }}>Delete song</button>
                            :
                            <Spinner style={{ color: '#f3b007' }} />
                    }
                    
                    <h1>Increase upvotes</h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button style={{margin: '1px'}} onClick={async () => { await removeVotes(selectedSong.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error adding downvote to ${selectedSong.name}`); console.log(error); }) }} className='btn'>Add DownVote</Button>
                        <Button style={{margin: '1px'}} onClick={async () => { await removeLastDownVote(selectedSong.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error removing downvote from ${selectedSong.name}`); console.log(error); }) }} className='btn'>Remove DownVote</Button>
                        <Button style={{margin: '1px'}} onClick={async () => { await addVotes(selectedSong.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error adding upvote to ${selectedSong.name}`); console.log(error); })  }} className='btn'>Add UpVote</Button>
                        <Button style={{margin: '1px'}} onClick={async () => { await removeLastUpVote(selectedSong.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error removing upvote from ${selectedSong.name}`); console.log(error); })  }} className='btn'>Remove UpVote</Button>
                    </div>
                    <div style={{ display: 'flex', marginTop: '20px' }}>
                        <buttn onClick={handleCloseD} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancel
                        </buttn>
                        {
                            !spinner ? 
                                <buttn onClick={async () => { setSpinner(true); imageFile ? await Storage.remove(selectedSong.thumbnailKey).then(async ()=> await uploadProfilePicture(imageFile).then(async ()=> musicFile ? await uploadFile(musicFile) : '') )  : musicFile ? await uploadFile(musicFile) : editSong(); handleCloseD() }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                                    <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Save
                                </buttn>
                                :
                                <Spinner style={{ color: '#f3b007' }} />
                        }
                        
                    </div>
                </Modal.Body>
            </Modal>
            <div onClick={() => { setShow(true); setSelectedSong(null); }} style={{ width: '-webkit-fill-available', height: '70px', border: '1px solid #f3b007', borderRadius: '10px', color: '#f3b007', margin: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IoAddSharp style={{ color: '#f3b007', margin: '0', fontSize: '2em', marginRight: '7px' }} />
                <h1 style={{ color: '#f3b007', margin: '0' }}>Add new</h1>
            </div>
            <h6 style={{ marginBottom: '15px' }}>All songs</h6>
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
            <div style={{ padding: '10px', paddingTop: '0', width: '100%', height: 'max-content' }}>
                {
                    q === '' && allSongs && allSongs.map((one) => {
                        return (
                            <>
                                <div key={one?.key} onClick={() => { setSelectedSong(one); setImageFile(null); setMusicFile(null); handleShowD() }} style={{ width: '-webkit-fill-available', padding: '10px', borderRadius: '15px', display: 'flex' }}>
                                    <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one?.thumbnailKey)}
                                        fallbackSrc={album_art}
                                        style={{ height: '70px', width: '70px', borderRadius: '5px', marginRight: '15px' }}
                                    />
                                    <div style={{ flex: '1' }}>
                                        <h5>{one.name}</h5>
                                        <h6>{JSON.parse(one?.selectedCreator)?.name}</h6>
                                    </div>
                                    <div onClick={(e) => { e.stopPropagation() }} style={{ flex: '0.5', display: 'flex' }}>
                                        {
                                            <div style={flexStyle}>
                                                <div onClick={async () => { await addVotes(one.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error adding upvote to ${one?.name}`); console.log(error); })  }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                    {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                    <BsCaretUp style={{ fontSize: '1.7em' }} />
                                                    {one?.listOfUidUpVotes?.length}
                                                </div>
                                                <div onClick={async () => { await removeLastUpVote(one.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error removing upvote from ${one?.name}`); console.log(error); })  }} style={{ display: 'flex', color: 'red', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                    <AiFillCaretUp style={{ fontSize: '1.5em' }} />
                                                    {/* <BsCaretUp style={{ fontSize: '1.7em' }} /> */}
                                                    {one?.listOfUidUpVotes?.length}
                                                </div>
                                            </div>
                                        }
                                        <>|<br/>|<br/>|</>
                                        {
                                            <div style={flexStyle}>
                                                <div onClick={async () => { await removeVotes(one.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error adding downvote to ${one?.name}`); console.log(error); })  }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                    {/* <AiFillCaretDown style={{ fontSize: '1.7em' }} /> */}
                                                    <BsCaretDown style={{ fontSize: '1.7em' }} />
                                                    {one?.listOfUidDownVotes?.length}
                                                </div>
                                                <div onClick={async () => { await removeLastDownVote(one.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error removing downvote from ${one?.name}`); console.log(error); })  }} style={{ display: 'flex', color: 'red', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                    <AiFillCaretDown style={{ fontSize: '1.7em' }} />
                                                    {/* <BsCaretDown style={{ fontSize: '1.7em' }} /> */}
                                                    {one?.listOfUidDownVotes?.length}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <hr></hr>
                            </>
                        )
                    })
                }
                {
                    q !== '' && 
                    <div>
                        {
                            allSongs && allSongs.filter(song => song.name.toLowerCase().includes(q.toLowerCase())).map((one) => {
                                return (
                                    <>
                                        <div key={one?.key} onClick={() => { setSelectedSong(one); setImageFile(null); setMusicFile(null); handleShowD() }} style={{ width: '-webkit-fill-available', padding: '10px', borderRadius: '15px', display: 'flex' }}>
                                            <ImageWithFallback src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+one?.thumbnailKey)}
                                                fallbackSrc={album_art}
                                                style={{ height: '70px', width: '70px', borderRadius: '5px', marginRight: '15px' }}
                                            />
                                            <div style={{ flex: '1' }}>
                                                <h5>{one.name}</h5>
                                                <h6>{JSON.parse(one?.selectedCreator)?.name}</h6>
                                            </div>
                                            <div onClick={(e) => { e.stopPropagation() }} style={{ flex: '0.5', display: 'flex' }}>
                                                {
                                                    <div style={flexStyle}>
                                                        <div onClick={async () => { await addVotes(one.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error adding upvote to ${one?.name}`); console.log(error); })  }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                            {/* <AiFillCaretUp style={{ fontSize: '1.5em' }} /> */}
                                                            <BsCaretUp style={{ fontSize: '1.7em' }} />
                                                            {one?.listOfUidUpVotes?.length}
                                                        </div>
                                                        <div onClick={async () => { await removeLastUpVote(one.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error removing upvote from ${one?.name}`); console.log(error); })  }} style={{ display: 'flex', color: 'red', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                            <AiFillCaretUp style={{ fontSize: '1.5em' }} />
                                                            {/* <BsCaretUp style={{ fontSize: '1.7em' }} /> */}
                                                            {one?.listOfUidUpVotes?.length}
                                                        </div>
                                                    </div>
                                                }
                                                <>|<br/>|<br/>|</>
                                                {
                                                    <div style={flexStyle}>
                                                        <div onClick={async () => { await removeVotes(one.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error adding downvote to ${one?.name}`); console.log(error); })  }} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                            {/* <AiFillCaretDown style={{ fontSize: '1.7em' }} /> */}
                                                            <BsCaretDown style={{ fontSize: '1.7em' }} />
                                                            {one?.listOfUidDownVotes?.length}
                                                        </div>
                                                        <div onClick={async () => { await removeLastDownVote(one.key).catch((error) => { setAllSongs(prevAllSongs); alert(`There was an error removing downvote from ${one?.name}`); console.log(error); })  }} style={{ display: 'flex', color: 'red', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                            <AiFillCaretDown style={{ fontSize: '1.7em' }} />
                                                            {/* <BsCaretDown style={{ fontSize: '1.7em' }} /> */}
                                                            {one?.listOfUidDownVotes?.length}
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <hr></hr>
                                    </>
                                )
                            })
                        }
                        {
                            allSongs && allSongs.filter(song => song.name.toLowerCase().includes(q.toLowerCase())).length === 0 &&
                            <center><p>No match found</p></center>
                        }
                    </div>
                }
            </div>
        </div>
        </StyleRoot>
    )
}

const flexStyle = {
    display: 'flex',
    flexDirection: 'row',
 
    // Adding media query..
    '@media (max-width: 900px)': {
      display: 'flex',
      flexDirection: 'column'
    },
};
export default AdminSongs