import React, { useState, useEffect } from "react";
import './App.css';
import Header from "./components/Header";
import Login from './pages/Login';
import { auth, auth2, db, db2 } from './config/fire'
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
import { addDoc, deleteDoc, increment } from 'firebase/firestore';
import { saveImageFile, saveMusicFile } from "./uploadFromUrl";

function App() {
  const [user] = useAuthState(auth);
  const [user2] = useAuthState(auth2);
  const [isProfileShown, setIsProfileShown] = useState(false)
  const [isBigPlayerVisible, setIsBigPlayerVisible] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [isLoginVisible, setIsLoginVisible] = useState(false)
  const [allSongs, setAllSongs] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  // added code
  const [allCreators, setAllCreators] = useState(null)
  const [selectedCreator, setSelectedCreator] = useState(null)
  useEffect(() => {
    // added code albums
    onSnapshot(collection(db, 'albums'), (snap) => {
      let temp = []
      snap.docs.forEach(async docd => {
          temp.push(docd.data())
          // var durl = await saveImageFile(docd.data().thumbnail);
          // alert(durl);
          var name = docd.data().name;
          // var thumbnail = durl; // docd.data().thumbnail;
          var key = docd.data().key;
          // setDoc(doc(db2, 'albums', key), {
          //   name,
          //   thumbnail,
          //   key
          // }).then(() => {
          //     // alert('added');
          //     // setShow(false)
          // })
      })
      // setAllAlbums(temp)
    })

    //end of added code albums

    // added code categories
    onSnapshot(collection(db, 'categories'), (snap) => {
      let temp = []
      snap.docs.forEach(docd => {
          temp.push(docd.data())
          var name = docd.data().name;
          var key = docd.data().key;
          // setDoc(doc(db2, 'categories', key), {
          //   name,
          //   key
          // }).then(() => {
          //   // alert('added');
          //   // setShow(false)
          // })
      })
      // setAllCategories(temp)
    })
    // end of added code categories

    // added code creators
    onSnapshot(collection(db, 'creators'), (snap) => {
      let temp = []
      snap.docs.forEach(async docd => {
          temp.push(docd.data())
          // var durl = await saveImageFile(docd.data().thumbnail);
          // alert(durl);
          var name = docd.data().name;
          var desc = docd.data().desc;
          // var thumbnail = durl; // docd.data().thumbnail;
          var twitter = docd.data().twitter;
          var instagram = docd.data().instagram;
          var facebook = docd.data().facebook;
          var youtube = docd.data().youtube;
          var key = docd.data().key;
          // setDoc(doc(db2, 'creators', key), {
          //   name,
          //   desc,
          //   thumbnail,
          //   twitter,
          //   instagram,
          //   facebook,
          //   youtube,
          //   key
          // }).then(() => {
          //     // alert('added');
          //     // setShow(false)
          // })
      })
      // setAllCreators(temp)
    })
    // end of added code creators


    onSnapshot(collection(db, 'songs'), async (snap) => {
      let temp = []
      
      snap.docs.forEach(async docd => {
        temp.push(docd.data())
        // docd.data().selectedCreator != null ? alert(docd.data().selectedCreator) : console.log("null");
        // Added code
        // let temp1 = allCreators.filter(creator => creator.key === selectedCreator)
        // alert(allCreators[0].name)
        // alert(temp1[0] ? temp1[0] : null);
        // var durl = await saveImageFile(docd.data().thumbnail);
        // alert(durl);
        // var dfurl = await saveMusicFile(docd.data().fileUrl);
        // alert(dfurl);
        var name = docd.data().name;
        // var thumbnail = durl;
        var selectedCategory = docd.data().selectedCategory;
        var selectedCreator = docd.data().selectedCreator;
        // var fileUrl = dfurl;
        var listOfUidUpVotes = docd.data().listOfUidUpVotes;
        var listOfUidDownVotes = docd.data().listOfUidDownVotes;
        var key = docd.data().key;
        console.log(docd.data().name);
        // setDoc(doc(db2, 'songs', key), {
        //     name,
        //     thumbnail,
        //     selectedCategory,
        //     selectedCreator,
        //     fileUrl,
        //     listOfUidUpVotes,
        //     listOfUidDownVotes,
        //     key
        // }).then(() => {
        //     console.log('added');
        // })

        // end of added code
        if (selectedSong && (docd.data().key === selectedSong.key)) {
          console.log("IAN"+docd.data());
          setSelectedSong(docd.data())
        }
      })
      setAllSongs(temp)
    })
  }, [])
  return (
    <Router>
      <div className="app">
        <div className="app__header">
          <Header isProfileShown={isProfileShown} setIsProfileShown={setIsProfileShown} />
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
              <Charts isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} arr={allSongs} />
            </Route>
            <Route exact path="/albums">
              <Albums isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} arr={allSongs} />
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
              <Admin />
            </Route>
            <Route exact path="/aboutus">
              <WhatIsHepi setIsLoginVisible={setIsLoginVisible} />
            </Route>
            <Route exact path="/fav">
              <Favorite setSelectedSong={setSelectedSong} />
            </Route>
            <Route exact path="/song">
              <BigPlayer selectedSong={selectedSong} setSelectedSong={setSelectedSong} />
            </Route>
          </Switch>
          <SmallPlayer allSongs={allSongs} setSelectedSong={setSelectedSong} selectedSong={selectedSong} />
        </div>
      </div>
    </Router>
  );
}

export default App;
