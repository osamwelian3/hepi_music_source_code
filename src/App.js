import React, { useState, useEffect } from "react";
import './App.css';
import Header from "./components/Header";
import Login from './pages/Login';
import { auth, auth2, db, db2 } from './config/fire'
import { API, graphqlOperation, Amplify, Storage } from 'aws-amplify';
import { createSong, createAlbum, createCategory, createCreator, createUser } from './graphql/mutations';
import { listSongs } from "./graphql/queries";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Library from "./pages/Library";
import Albums from "./pages/Albums";
import Charts from "./pages/Charts";
import Admin from "./pages/Admin";
import ProfileDrawer from "./pages/admin components/ProfileDrawer";
import ShareDrawer from "./components/Share";
import WhatIsHepi from "./pages/WhatIsHepi";
import { WhatsAppWidget } from 'react-whatsapp-widget';
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import BigPlayer from "./pages/BigPlayer";
import SmallPlayer from "./pages/SmallPlayer";
import Favorite from "./pages/Favorite";
import All from "./pages/All";

// new imports
import { v4 as uuidv4 } from "uuid";
import { addDoc, deleteDoc, increment } from 'firebase/firestore';
import { saveImageFile, saveMusicFile, signOut } from "./uploadFromUrl";
import useAuthenticatedStatus from './auth-status';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

function App() {
  const [user] = useAuthState(auth);
  const [user2] = useAuthState(auth2);
  const [isProfileShown, setIsProfileShown] = useState(false)
  const [isBigPlayerVisible, setIsBigPlayerVisible] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [isLoginVisible, setIsLoginVisible] = useState(false)
  const [allSongs, setAllSongs] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  // // added code
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(async () => {
    console.log("isMounted: "+isMounted+" shouldFetch: "+shouldFetch);
    if (isMounted && shouldFetch) {
      await API.graphql(graphqlOperation(listSongs)).then((res)=>{
        let temp = [];
        console.log(res.data?.listSongs.items);
        res.data?.listSongs.items.forEach(doc => {
          console.log(doc);
          temp.push(doc);
        });
        setAllSongs(temp);
      }).catch((error)=>{
        console.log(error);
      })
      setShouldFetch(false);
    }
  }, [shouldFetch, isMounted])
  // const [allCreators, setAllCreators] = useState(null)
  // const [selectedCreator, setSelectedCreator] = useState(null)
  useAuthenticatedStatus().then((res)=>{
    setIsAuthenticated(res)
  });
  useEffect(async () => {
  //   // added code albums
  //   // await signOut();
  //   // alert(await Storage.get("images/Album cover art.jpg"));
  //   // const data = await saveImageFile("https://png.pngtree.com/png-vector/20221018/ourmid/pngtree-whatsapp-mobile-software-icon-png-image_6315991.png", isAuthenticated);
  //   // alert("key: "+data.key+", url: "+data.downloadUrl)
  //   // saveMusicFile("https://firebasestorage.googleapis.com/v0/b/storage-urli.appspot.com/o/files%2FVocci%2C%206ly%20-%20%20Facts.mp3?alt=media&token=63a8f62d-cc2e-4c89-a83e-e228d13cf551", isAuthenticated)
  //   onSnapshot(collection(db, 'albums'), (snap) => {
  //     let temp = []
  //     snap.docs.forEach(async docd => {
  //         temp.push(docd.data())
  //         var durl = await saveImageFile(docd.data().thumbnail);
  //         // alert(durl);
  //         var name = docd.data().name;
  //         var thumbnail = durl.downloadUrl; // docd.data().thumbnail;
  //         var thumbnailKey = durl.key;
  //         var key = docd.data().key;
  //         const album = {key: key, name: name, thumbnail: thumbnail, thumbnailKey: thumbnailKey};
  //         await API.graphql(graphqlOperation(createAlbum, {input: album})).then(()=>{
  //           console.log("album added");
  //         }).catch((error)=>{
  //           console.log(error);
  //         });
  //         // setDoc(doc(db2, 'albums', key), {
  //         //   name,
  //         //   thumbnail,
  //         //   key
  //         // }).then(() => {
  //         //     // alert('added');
  //         //     // setShow(false)
  //         // })
  //     })
  //     // setAllAlbums(temp)
  //   })

  //   //end of added code albums

  //   // added code categories
  //   onSnapshot(collection(db, 'categories'), (snap) => {
  //     let temp = []
  //     snap.docs.forEach(async docd => {
  //         temp.push(docd.data())
  //         var name = docd.data().name;
  //         var key = docd.data().key;
  //         const category = {name: name, key: key};
  //         await API.graphql(graphqlOperation(createCategory, {input: category})).then(()=>{
  //           console.log("category added");
  //         }).catch((error)=>{
  //           console.log(error);
  //         });
  //         // setDoc(doc(db2, 'categories', key), {
  //         //   name,
  //         //   key
  //         // }).then(() => {
  //         //   // alert('added');
  //         //   // setShow(false)
  //         // })
  //     })
  //     // setAllCategories(temp)
  //   })
  //   // end of added code categories

  //   // added code creators
  //   onSnapshot(collection(db, 'creators'), (snap) => {
  //     let temp = []
  //     snap.docs.forEach(async docd => {
  //         temp.push(docd.data())
  //         var durl = await saveImageFile(docd.data().thumbnail);
  //         // alert(durl);
  //         var name = docd.data().name;
  //         var desc = docd.data().desc;
  //         var thumbnail = durl.downloadUrl; // docd.data().thumbnail;
  //         var thumbnailKey = durl.key;
  //         var twitter = docd.data().twitter;
  //         var instagram = docd.data().instagram;
  //         var facebook = docd.data().facebook;
  //         var youtube = docd.data().youtube;
  //         var key = docd.data().key;
  //         const creator = {key: key, desc: desc, facebook: facebook, instagram: instagram, name: name, thumbnail: thumbnail, thumbnailKey: thumbnailKey, twitter: twitter, youtube: youtube};
  //         await API.graphql(graphqlOperation(createCreator, {input: creator})).then(()=>{
  //           console.log("creator added");
  //         }).catch((error)=>{
  //           console.log(error);
  //         });
  //         // setDoc(doc(db2, 'creators', key), {
  //         //   name,
  //         //   desc,
  //         //   thumbnail,
  //         //   twitter,
  //         //   instagram,
  //         //   facebook,
  //         //   youtube,
  //         //   key
  //         // }).then(() => {
  //         //     // alert('added');
  //         //     // setShow(false)
  //         // })
  //     })
  //     // setAllCreators(temp)
  //   })
  //   // end of added code creators


    // onSnapshot(collection(db, 'songs'), async (snap) => {
    //   let temp = []
      
    //   snap.docs.forEach(async docd => {
    //     temp.push(docd.data())
    //     // docd.data().selectedCreator != null ? alert(docd.data().selectedCreator) : console.log("null");
    //     // Added code
    //     // let temp1 = allCreators.filter(creator => creator.key === selectedCreator)
    //     // alert(allCreators[0].name)
    //     // alert(temp1[0] ? temp1[0] : null);
    //     var durl = await saveImageFile(docd.data().thumbnail);
    //     // alert(durl);
    //     var dfurl = await saveMusicFile(docd.data().fileUrl);
    //     // alert(dfurl);
    //     var name = docd.data().name;
    //     var thumbnail = durl.downloadUrl;
    //     var thumbnailKey = durl.key
    //     var selectedCategory = docd.data().selectedCategory;
    //     var selectedCreator = docd.data().selectedCreator;
    //     var partOf = docd.data().partOf ? docd.data().partOf : null;
    //     var fileUrl = dfurl.downloadUrl;
    //     var fileKey = dfurl.key;
    //     var listOfUidUpVotes = docd.data().listOfUidUpVotes;
    //     var listOfUidDownVotes = docd.data().listOfUidDownVotes;
    //     var key = docd.data().key;
    //     const song = {key: key, fileUrl: fileUrl, fileKey: fileKey, listOfUidDownVotes: listOfUidDownVotes, listOfUidUpVotes: listOfUidUpVotes, name: name, partOf: partOf, selectedCategory: selectedCategory, selectedCreator: selectedCreator, thumbnail: thumbnail, thumbnailKey: thumbnailKey};
    //     await API.graphql(graphqlOperation(createSong, {input: song})).then(()=>{
    //       console.log("song added");
    //     }).catch((error)=>{
    //       console.log(error);
    //     });
    //     console.log(docd.data().name);
    //     // setDoc(doc(db2, 'songs', key), {
    //     //     name,
    //     //     thumbnail,
    //     //     selectedCategory,
    //     //     selectedCreator,
    //     //     fileUrl,
    //     //     listOfUidUpVotes,
    //     //     listOfUidDownVotes,
    //     //     key
    //     // }).then(() => {
    //     //     console.log('added');
    //     // })

    //     // end of added code
    //     if (selectedSong && (docd.data().key === selectedSong.key)) {
    //       console.log("IAN"+docd.data());
    //       setSelectedSong(docd.data())
    //     }
    //   })
    //   setAllSongs(temp)
    // })

    await API.graphql(graphqlOperation(listSongs)).then((res)=>{
      let temp = [];
      console.log(res.data?.listSongs.items);
      res.data?.listSongs.items.forEach(doc => {
        console.log(doc);
        temp.push(doc);
      });
      setAllSongs(temp);
    }).catch((error)=>{
      console.log(error);
    })

  }, [])
  return (
    <Router>
      <div className="app">
        <div className="app__header">
          <Header isProfileShown={isProfileShown} setIsProfileShown={setIsProfileShown} isAuthenticated={isAuthenticated} />
        </div>
        <div className="app__body">
          <div style={{ position: 'fixed', top: '0' }}>
            <WhatsAppWidget phoneNumber="+254705240942" companyName='Heppi music support' />
          </div>
          <ProfileDrawer isOpen={isProfileShown} setIsOpen={setIsProfileShown} />
          <Switch>
            <Route exact path="/">
              <Library setSelectedCategory={setSelectedCategory} isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} arr={allSongs} />
            </Route>
            <Route exact path="/charts">
              <Charts isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} triggerShouldFetch={() => setShouldFetch(true)} arr={allSongs} />
            </Route>
            <Route exact path="/albums">
              <Albums isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} arr={allSongs} triggerShouldFetch={() => setShouldFetch(true)} />
            </Route>
            <Route exact path="/all">
              <All isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} arr={allSongs} selectedCategory={selectedCategory} />
            </Route>
            <Route exact path="/login">
              <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'centers' }}>
                <Login setIsLoginVisible={setIsLoginVisible} />
              </div>
            </Route>
            <Route exact path="/admin">
              <Admin isAuthenticated={isAuthenticated} />
            </Route>
            <Route exact path="/aboutus">
              <WhatIsHepi setIsLoginVisible={setIsLoginVisible} />
            </Route>
            <Route exact path="/fav">
              <Favorite setSelectedSong={setSelectedSong} arr={allSongs} setIsBigPlayerVisible={setIsBigPlayerVisible} />
            </Route>
            <Route exact path="/song">
              <BigPlayer selectedSong={selectedSong} setSelectedSong={setSelectedSong} triggerShouldFetch={() => setShouldFetch(true)} />
            </Route>
          </Switch>
          <SmallPlayer allSongs={allSongs} setSelectedSong={setSelectedSong} selectedSong={selectedSong} />
        </div>
      </div>
    </Router>
  );
}

export default App;
