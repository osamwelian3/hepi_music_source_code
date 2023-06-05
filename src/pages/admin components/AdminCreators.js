import React, { useState, useRef, useEffect } from 'react'
import { IoAddOutline, IoAddSharp } from 'react-icons/io5'
import { Modal, Spinner } from 'react-bootstrap';
import { db, storage } from '../../config/fire';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { Amplify, API, graphqlOperation, Storage } from 'aws-amplify';
import { listCreators } from '../../graphql/queries';
import { createCreator } from '../../graphql/mutations';
import awsconfig from '../../aws-exports';
import profile_default from '../../components/fallbackImages/person-gray-photo-placeholder-man.jpg'
import ImageWithFallback from '../../components/ImageWithFallback';
Amplify.configure(awsconfig);
function AdminCreators() {
    const [allCreators, setAllCreators] = useState(null)
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [twitter, setTwitter] = useState('')
    const [instagram, setInstagram] = useState('')
    const [facebook, setFacebook] = useState('')
    const [youtube, setYoutube] = useState('')

    const [thumbnail, setThumbnail] = useState(profile_default)
    const [thumbnailKey, setThumbnailKey] = useState()
    const [profileLoading, setProfileLoading] = useState(false)
    const [uploadedImage, setUploadedImage] = useState()
    const hiddenBrowseButton = useRef(null)

    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(async () => {
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
            });
            setAllCreators(temp)
        })
    }, [])
    useEffect(()=>{
        console.log('thumbnailkey changed');
        console.log(thumbnailKey);
        const pattern = /^images\/.*\.(jpg|jpeg|png|gif)$/i;
        if (pattern.test(thumbnailKey)){
            addCreator()
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
        // const imageFile = e.target.files[0];
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
            alert(error)
            setProfileLoading(false)
        }
    }
    async function addCreator() {
        const key = uuidv4()
        // setDoc(doc(db, 'creators', key), {
        //     name,
        //     desc,
        //     thumbnail,
        //     twitter,
        //     instagram,
        //     facebook,
        //     youtube,
        //     key
        // }).then(() => {
        //     alert('added');
        //     setShow(false)
        // })
        const creator = {key: key, desc: desc, facebook: facebook, instagram: instagram, name: name, thumbnail: thumbnail, thumbnailKey: thumbnailKey, twitter: twitter, youtube: youtube};
        await API.graphql(graphqlOperation(createCreator, {input: creator})).then(()=>{
            alert("creator added");
            setShow(false)
        }).catch((error)=>{
            console.log(error);
        });
    }
    return (
        <div style={{ padding: '10px' }}>
            <Modal className='addLinkModal' show={show} onHide={handleClose}>
                <Modal.Body>
                    <h2>New creator</h2>
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
                            <input ref={hiddenBrowseButton} onChange={(e) => handleImageChange(e) } type="file" style={{ "display": "none" }} />
                            <buttn
                                onClick={() => hiddenBrowseButton.current.click()}
                                style={{ borderRadius: '50vh', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                                Pick an image
                            </buttn>
                            <buttn onClick={async () => { setThumbnail('https://media.istockphoto.com/id/1202490454/vector/person-gray-photo-placeholder-man.jpg?s=612x612&w=0&k=20&c=sqW3a4BMiU1B9TJCAlBayaJ68MvfN5S4hWEsBS9-g5o='); await Storage.remove(`public/${thumbnailKey}`); }} style={{ borderRadius: '50vh', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px', width: '-webkit-fill-available' }} className='btn'>
                                Remove
                            </buttn>
                        </div>
                    </div>

                    <p style={{ margin: '0', color: '#6d6d6d' }}>Name</p>
                    <input type={'text'} value={name} onChange={(e) => { setName(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Description</p>
                    <input type={'text'} value={desc} onChange={(e) => { setDesc(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Twitter</p>
                    <input type={'text'} value={twitter} onChange={(e) => { setTwitter(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Instagram</p>
                    <input type={'text'} value={instagram} onChange={(e) => { setInstagram(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Facebook</p>
                    <input type={'text'} value={facebook} onChange={(e) => { setFacebook(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Youtube</p>
                    <input type={'text'} value={youtube} onChange={(e) => { setYoutube(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />

                    <div style={{ display: 'flex', marginTop: '20px' }}>
                        <buttn onClick={handleClose} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancel
                        </buttn>
                        <buttn onClick={async () => { await uploadProfilePicture(imageFile) } } style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Add
                        </buttn>
                    </div>
                </Modal.Body>
            </Modal>
            <div onClick={() => { setShow(true) }} style={{ width: '-webkit-fill-available', height: '70px', border: '1px solid #f3b007', borderRadius: '10px', color: '#f3b007', margin: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IoAddSharp style={{ color: '#f3b007', margin: '0', fontSize: '2em', marginRight: '7px' }} />
                <h1 style={{ color: '#f3b007', margin: '0' }}>Add new</h1>
            </div>
            <h6 style={{ marginBottom: '15px' }}>All creators</h6>
            <div style={{ padding: '10px', paddingTop: '0', width: '100%', height: 'max-content' }}>
                {
                    allCreators && allCreators.map((data, i) => {
                        return (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '20px 10px', height: 'max-content' }}>
                                <div>
                                    <ImageWithFallback style={{ height: '70px', marginRight: '20px', width: '70px', borderRadius: '50vh' }} fallbackSrc={profile_default} src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/"+data.thumbnailKey)} />
                                </div>
                                <div style={{ flex: '1' }}>
                                    <h5>{data.name}</h5>
                                    <h6 style={{ color: '#ccc' }}>{data.desc}</h6>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default AdminCreators