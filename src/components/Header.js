import React, { useEffect, useState } from 'react';
import { Link, NavLink, useHistory, useLocation } from 'react-router-dom';
import { FaChartLine } from 'react-icons/fa'
import { HiOutlineUserGroup } from 'react-icons/hi';
import '../pages/pages.css'
import { BiLibrary } from 'react-icons/bi';
import { IoAlbums, IoHeart } from 'react-icons/io5';
import { CgProfile } from 'react-icons/cg'
import { auth } from '../config/fire';
import { signOut } from 'firebase/auth';
import { Amplify, Storage, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
Amplify.configure(awsconfig)
function Header({ setIsProfileShown, isAuthenticated }) {
    const [logo, setLogo] = useState()
    const [currentUser, setCurrentUser] = useState(null)
    async function getCurrentUser(){
        const promise = new Promise(async function (resolve){
            await Auth.currentUserInfo().then((user)=>{
                resolve(user);
            });
        });

        return await promise;
    }
    useEffect(async () => {
        await getCurrentUser().then((res)=>{
            console.log(res)
            setCurrentUser(res)
        })
        if (!auth.currentUser){
            authSignOut()
            setCurrentUser(null)
        }
    }, [isAuthenticated]);
    const history = useHistory()
    const location = useLocation();
    async function authSignOut() {
        try {
          await Auth.signOut();
        } catch (error) {
          console.log('error signing out: ', error);
        }
      }
    async function logOut() {
        await authSignOut();
        setCurrentUser(null)
        return signOut(auth)
    }
    function getWindowDimensions() {
        const { innerWidth: width, innerHeight: height } = window;
        return {
            width,
            height
        };
    }
    if (location.pathname === '/admin') {
        return (
            <div className="header" >
                <img onClick={() => { history.push('/') }} src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/hepi_logo.png")} style={{ height: '50px', width: '70px' }} /><h1 style={{ margin: '0', color: '#f3b007', fontWeight: '500', fontSize: '1.3em' }}>Admin</h1>
                <div style={{ flex: '1' }}></div>
                <button onClick={async () => { await logOut(); history.push('/') }} style={{ display: 'flex', alignItems: 'center', borderRadius: '5px', fontSize: '0.9em', padding: '3px 15px', color: '#f3b007', backgroundColor: '#f3b00730', margin: '0px 20px' }} className='btn'>
                    LogOut
                </button>
            </div>
        )
    }
    if (location.pathname === '/profile') {
        return (
            <div className="header" >
                <img onClick={() => { history.push('/') }} src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/hepi_logo.png")} style={{ height: '50px', width: '70px' }} /><h1 style={{ margin: '0', color: '#f3b007', fontWeight: '500', fontSize: '1.3em' }}>Profile</h1>
                <div style={{ flex: '1' }}></div>
                <button onClick={async () => { await logOut(); history.push('/') }} style={{ display: 'flex', alignItems: 'center', borderRadius: '5px', fontSize: '0.9em', padding: '3px 15px', color: '#f3b007', backgroundColor: '#f3b00730', margin: '0px 20px' }} className='btn'>
                    LogOut
                </button>
            </div>
        )
    }
    return (
        <>
            {
                getWindowDimensions().width < 600 && location.pathname !== '/login' &&
                <div className="header" >
                    <img onClick={() => { history.push('/') }} src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/Hepi.png")} style={{ height: '32px', width: '32px', margin: '0px 30px', borderRadius: '50vh' }} /><h1 style={{ margin: '0', color: '#f3b007', fontWeight: '500', fontSize: '1.3em' }}></h1>
                    <div style={{ flex: '1' }}></div>
                    {
                        !currentUser ? // !auth.currentUser
                            <Link to={'/login'}>
                                <button style={{ display: 'flex', alignItems: 'center', borderRadius: '5px', fontSize: '0.9em', padding: '3px 15px', color: '#f3b007', backgroundColor: '#f3b00730', margin: '0px 20px' }} className='btn'>
                                    Login
                                </button>
                            </Link>
                            :
                            <>
                                { !auth.currentUser ? async () => { await authSignOut(); history.push(location.pathname); } : '' }
                                <CgProfile onClick={() => { setIsProfileShown(true) }} style={{ fontSize: '2em', color: '#f3b007', margin: '0px 20px' }} />
                            </>
                    }
                </div>
            }
            {
                location.pathname !== '/login' &&
                <div className="header" style={{ top: getWindowDimensions().width < 600 ? '50px' : '0px', }}>
                    <NavLink exact to='' className={'header_navlink'} activeClassName="active" style={{ width: getWindowDimensions().width > 600 ? '180px' : '100%', height: '100%', display: 'flex', flexDirection: getWindowDimensions().width > 600 ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'normal' }} activeStyle={{ display: 'flex', flexDirection: getWindowDimensions().width > 600 ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', color: "#f3b007" }}>< BiLibrary style={{ marginRight: getWindowDimensions().width > 600 ? '10px' : '0px', fontSize: '1em' }} /><font style={{ fontSize: '0.8em' }}>Library</font></NavLink>
                    <NavLink exact to='/charts' className={'header_navlink'} activeClassName="active" style={{ width: getWindowDimensions().width > 600 ? '180px' : '100%', height: '100%', display: 'flex', flexDirection: getWindowDimensions().width > 600 ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'normal' }} activeStyle={{ display: 'flex', flexDirection: getWindowDimensions().width > 600 ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', color: "#f3b007" }}><FaChartLine style={{ marginRight: getWindowDimensions().width > 600 ? '10px' : '0px', fontSize: '1em' }} /><font style={{ fontSize: '0.8em' }}>Charts</font></NavLink>
                    <NavLink exact to='/albums' className={'header_navlink'} activeClassName="active" style={{ width: getWindowDimensions().width > 600 ? '180px' : '100%', height: '100%', display: 'flex', flexDirection: getWindowDimensions().width > 600 ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'normal' }} activeStyle={{ display: 'flex', flexDirection: getWindowDimensions().width > 600 ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', color: "#f3b007" }}><IoAlbums style={{ marginRight: getWindowDimensions().width > 600 ? '10px' : '0px', fontSize: '1em' }} /><font style={{ fontSize: '0.8em' }}>Albums</font></NavLink>
                    <NavLink exact to='/fav' className={'header_navlink'} activeClassName="active" style={{ width: getWindowDimensions().width > 600 ? '180px' : '100%', height: '100%', display: 'flex', flexDirection: getWindowDimensions().width > 600 ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'normal' }} activeStyle={{ display: 'flex', flexDirection: getWindowDimensions().width > 600 ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', color: "#f3b007" }}><IoHeart style={{ marginRight: getWindowDimensions().width > 600 ? '10px' : '0px', fontSize: '1em' }} /><font style={{ fontSize: '0.8em' }}>Favorites</font></NavLink>
                    {
                        getWindowDimensions().width > 600 &&
                        <>
                            <div style={{ width: '100%' }}></div>
                            {
                                !currentUser ? // !auth.currentUser
                                    <Link to={'/login'}>
                                        <buttn style={{ display: 'flex', alignItems: 'center', borderRadius: '5px', fontSize: '0.9em', padding: '3px 15px', color: '#f3b007', backgroundColor: '#f3b00730', margin: '0px 20px' }} className='btn'>
                                            Login
                                        </buttn>
                                    </Link>
                                    :
                                    <button onClick={async () => { await logOut() }} style={{ display: 'flex', alignItems: 'center', borderRadius: '5px', fontSize: '0.9em', padding: '3px 15px', color: '#f3b007', backgroundColor: '#f3b00730', margin: '0px 20px' }} className='btn'>
                                    { !auth.currentUser ? async () => { await authSignOut(); history.push(location.pathname); } : '' }
                                        LogOut
                                    </button>
                            }
                        </>
                    }
                </div>
            }
        </>
    )
}

export default Header
