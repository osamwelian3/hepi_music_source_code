import React, { useState, useEffect } from "react";
import './App.css';
import Header from "./components/Header";
import Login from './pages/Login';
import { auth, auth2, db, db2 } from './config/fire'
import { API, graphqlOperation, Amplify, Storage, DataStore } from 'aws-amplify';
import { createSong, createAlbum, createCategory, createCreator, createUser, updateSong } from './graphql/mutations';
import { listSongs, getSong, listAlbums } from "./graphql/queries";
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
import BigPlayer from "./pages/BigPlayer";
import SmallPlayer from "./pages/SmallPlayer";
import Favorite from "./pages/Favorite";
import All from "./pages/All";
import { StyleRoot } from 'radium'

// new imports
import { v4 as uuidv4 } from "uuid";
import PrivacyPolicy from './pages/PrivacyPolicy'
import { addDoc, deleteDoc, increment } from 'firebase/firestore';
import { saveImageFile, saveMusicFile, signOut } from "./uploadFromUrl";
import useAuthenticatedStatus from './auth-status';
import awsconfig from './aws-exports';
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import Trending from "./pages/Trending";
// import { Song } from "./models";
import { Song } from './models'
Amplify.configure(awsconfig);
console.log(Song)

function App() {
  const [user] = useAuthState(auth);
  const [user2] = useAuthState(auth2);
  const [isProfileShown, setIsProfileShown] = useState(false)
  const [isBigPlayerVisible, setIsBigPlayerVisible] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [isLoginVisible, setIsLoginVisible] = useState(false)
  const [allSongs, setAllSongs] = useState(null)
  const [globalCategories, setGlobalCategories] = useState([]);
  const [globalAlbums, setGlobalAlbums] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [playlist, setPlaylist] = useState(null);
  // // added code
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(async () => {
    // console.log("isMounted: "+isMounted+" shouldFetch: "+shouldFetch);
    let sub
    if (isMounted && shouldFetch) {
      sub = DataStore.observeQuery(Song).subscribe(snapshot => {
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
      //   let temp = [];
      //   res.data?.listSongs.items.forEach(doc => {
      //     temp.push(doc);
      //   });
      //   setAllSongs(temp);
      // }).catch((error)=>{
      //   console.log(error);
      // })
      setShouldFetch(false);
    }
    
    return () => {
      if (sub) {
          sub.unsubscribe()
      }
  }
  }, [shouldFetch, isMounted])
  // const [allCreators, setAllCreators] = useState(null)
  // const [selectedCreator, setSelectedCreator] = useState(null)
  useAuthenticatedStatus().then((res)=>{
    setIsAuthenticated(res)
  });
  useEffect(async () => {

    const sub = DataStore.observeQuery(Song, null, { limit: 10000 }).subscribe(snapshot => {
      const {items, isSynced} = snapshot
      let temp = []
      if (isSynced) {
        items.forEach((song) => {
          temp.push(song)
        })
        setAllSongs(temp)
      }
    })

    // if (songList) {
    //   let temp = []
    //   songList.forEach((song) => {
    //     console.log("Fetched: "+song.name)
    //     temp.push(song)
    //   })
    //   setAllSongs(temp)
    // } else {
    //   console.log("could not fetch songs")
    // }
    
    return () => {
      sub.unsubscribe()
    }

  }, [])
  return (
    <StyleRoot>
    <Router>
      <div className="app">
        <div className="app__header">
          <Header isProfileShown={isProfileShown} setIsProfileShown={setIsProfileShown} isAuthenticated={isAuthenticated} setUserInfo={setUserInfo} />
        </div>
        <div className="app__body">
          <div style={{ position: 'fixed', top: '0' }}>
            <WhatsAppWidget phoneNumber="+254705240942" companyName='Heppi music support' />
          </div>
          <ProfileDrawer isOpen={isProfileShown} setIsOpen={setIsProfileShown} userInfo={userInfo} />
          <Switch>
            <Route exact path="/">
              <Library setSelectedCategory={setSelectedCategory} isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} arr={allSongs} setGlobalCategories={setGlobalCategories} setGlobalAlbums={setGlobalAlbums} setPlaylist={setPlaylist} />
            </Route>
            <Route exact path="/charts">
              <Charts isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} triggerShouldFetch={() => setShouldFetch(true)} arr={allSongs} setPlaylist={setPlaylist} />
            </Route>
            <Route exact path="/albums">
              <Albums isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} arr={allSongs} setGlobalAlbums={setGlobalAlbums} setGlobalCategories={setGlobalCategories} setPlaylist={setPlaylist} triggerShouldFetch={() => setShouldFetch(true)} />
            </Route>
            <Route exact path="/all">
              <All isBigPlayerVisible={isBigPlayerVisible} setIsBigPlayerVisible={setIsBigPlayerVisible} selectedSong={selectedSong} setSelectedSong={setSelectedSong} arr={allSongs} setPlaylist={setPlaylist} selectedCategory={selectedCategory} />
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
            <Route exact path="/privacy">
              <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'centers' }}>
                <PrivacyPolicy />
              </div>
            </Route>
            <Route exact path="/fav">
              <Favorite setSelectedSong={setSelectedSong} arr={allSongs} setPlaylist={setPlaylist} setIsBigPlayerVisible={setIsBigPlayerVisible} />
            </Route>
            <Route exact path="/trending">
              <Trending arr={allSongs} setSelectedSong={setSelectedSong} selectedSong={selectedSong} setPlaylist={setPlaylist} setIsBigPlayerVisible={setIsBigPlayerVisible} triggerShouldFetch={() => setShouldFetch(true)} />
            </Route>
            <Route exact path="/song">
              <BigPlayer selectedSong={selectedSong} setSelectedSong={setSelectedSong} triggerShouldFetch={() => setShouldFetch(true)} />
            </Route>
          </Switch>
          <SmallPlayer allSongs={playlist} globalSongs={allSongs} setPlaylist={setPlaylist} setAllSongs={setAllSongs} setSelectedSong={setSelectedSong} selectedSong={selectedSong} userInfo={userInfo} globalAlbums={globalAlbums} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} globalCategories={globalCategories} />
        </div>
      </div>
    </Router>
    </StyleRoot>
  );
}

export default App;
