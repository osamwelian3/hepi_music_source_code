import { createUserWithEmailAndPassword, FacebookAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { auth } from '../config/fire'
import { db } from '../config/fire'


function Login({ setIsLoginVisible }) {
    const [register, setRegister] = useState(false)
    const [userName, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const history = useHistory()
    async function login() {
        if (email !== "" && password !== "") {
            await signInWithEmailAndPassword(
                auth, email, password
            ).then(() => {
                if (auth.currentUser.uid === "7rbDXS9eipV7OXSTYCWsnWu8wxx1") {
                    history.push('/admin')
                } else {
                    history.push('/')
                }
            }).catch(error => {
                switch (error.message) {
                    case 'Firebase: Error (auth/invalid-email).':
                        alert('You entered invalid email-id')
                        break;
                    case 'Firebase: Error (auth/wrong-password).':
                        alert('You entered wrong password')
                        break;
                    default:
                        alert('Something went wrong try again later', error.message)
                        break;
                }
            })
        } else {
            alert("Email or Password not provided")
        }
    }
    async function googleAuth() {
        const provider = new GoogleAuthProvider();

        // Sign in with Google popup
        signInWithPopup(auth, provider)
            .then((result) => {
                setDoc(doc(db, 'users', auth.currentUser.uid, 'user_details', 'info'), {
                    name: userName,
                    uid: auth.currentUser.uid
                }).then(() => {
                    history.push('/')
                })
            })
            .catch((error) => {
                console.log(error);
                alert(error.message, 'error while register')
            });
    }
    async function facebookAuth() {
        console.log('came');
        const provider = new FacebookAuthProvider();

        // Sign in with Google popup
        signInWithPopup(auth, provider)
            .then((result) => {
                setDoc(doc(db, 'users', auth.currentUser.uid, 'user_details', 'info'), {
                    name: userName,
                    uid: auth.currentUser.uid
                }).then(() => {
                    history.push('/')
                })
            })
            .catch((error) => {
                console.log(error);
                alert(error.message, 'error while register')
            });
    }
    async function signup() {
        if (email !== "" && password !== "" && password.length > 6 && userName !== "") {
            await createUserWithEmailAndPassword(
                auth, email, password
            ).then(() => {
                setDoc(doc(db, 'users', auth.currentUser.uid, 'user_details', 'info'), {
                    name: userName,
                    uid: auth.currentUser.uid
                }).then(() => {
                    history.push('/')
                })
            }).catch(error => {
                console.log(error);
                alert(error.message, 'error while register')
            })
        } else if (userName === "") {
            alert("User name not entered")
        } else if (email === "") {
            alert("Email not entered")
        } else if (password.length < 6) {
            alert("password must be at least 6 characters")
        } else {
            alert('Oops, an error occurred try again later')
        }
    }
    useEffect(() => {
        setUserName('')
        setEmail('')
        setPassword('')
    }, [register])
    useEffect(() => {
        setIsLoginVisible(true)

        return () => {
            setIsLoginVisible(false)
        }
    }, [])

    return (
        <div className='login_bg' style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

            {
                (
                    register === false ?
                        <div className='login_form_bg' style={{ textAlign: 'center', width: "90vw", maxWidth: '400px', height: 'max-content', padding: '10px', borderRadius: '10px' }} >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '-10vh', marginBottom: '20px', padding: '0px 10px' }}>
                                <img src='https://firebasestorage.googleapis.com/v0/b/storage-urli.appspot.com/o/logo-1.jpg?alt=media&token=86a08736-bd2c-4ce3-a957-11d3cad933a6' style={{ marginLeft: '-35px', height: '100px', width: '150px' }} />

                            </div>
                            <div>
                                <input type="email" placeholder='Email' onChange={(e) => { setEmail(e.target.value) }} style={{ width: '95%', height: '45px', marginBottom: '10px', background: 'none', padding: '10px', border: '1px solid #ffffff2e', borderRadius: '10px', color: '#f3b007' }} />
                            </div>
                            <div>
                                <input placeholder='password' type="password" onChange={(e) => { setPassword(e.target.value) }} style={{ width: '95%', height: '45px', background: 'none', padding: '10px', border: '1px solid #ffffff2e', borderRadius: '10px', color: '#f3b007' }} />
                            </div>
                            <button style={{ margin: '15px 10px', padding: '8px 10px', borderRadius: '10px', width: '-webkit-fill-available', fontWeight: 'bold', border: 'none', backgroundColor: '#f3b007', color: 'black' }} onClick={() => { login() }}>Login</button>
                            <p style={{ color: '#f3b007', cursor: 'pointer', margin: '10px 5px' }} onClick={() => { setRegister(true) }}>New user? Register here.</p>
                            <p style={{ color: '#f3b007', cursor: 'pointer', margin: '10px 5px' }} >Or login with</p>

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <img onClick={() => { googleAuth() }} class="google-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" style={{ height: '50px', width: '50px', marginRight: '40px' }} />
                                <img onClick={() => { facebookAuth() }} class="google-icon" src="https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Facebook_f_logo_%282021%29.svg/1200px-Facebook_f_logo_%282021%29.svg.png" style={{ height: '50px', width: '50px' }} />
                            </div>
                        </div>
                        :
                        <div className='login_form_bg' style={{ textAlign: 'center', width: "90vw", maxWidth: '400px', height: 'max-content', padding: '10px', borderRadius: '10px' }} >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '-10vh', marginBottom: '20px', padding: '0px 10px' }}>
                                <img src='https://www.hepimusic.com/backend/images/logo-1.JPEG' style={{ marginLeft: '-35px', height: '100px', width: '150px' }} />
                            </div>
                            <div>
                                <input type="text" placeholder='User name' onChange={(e) => { setUserName(e.target.value) }} style={{ width: '95%', height: '45px', marginBottom: '10px', background: 'none', padding: '10px', border: '1px solid #ffffff2e', borderRadius: '10px', color: '#f3b007' }} />
                            </div>
                            <div>
                                <input type="Email" placeholder='Email' onChange={(e) => { setEmail(e.target.value) }} style={{ width: '95%', height: '45px', marginBottom: '10px', background: 'none', padding: '10px', border: '1px solid #ffffff2e', borderRadius: '10px', color: '#f3b007' }} />
                            </div>
                            <div>
                                <input placeholder='Password' type="password" onChange={(e) => { setPassword(e.target.value) }} style={{ width: '95%', height: '45px', marginBottom: '10px', background: 'none', padding: '10px', border: '1px solid #ffffff2e', borderRadius: '10px', color: '#f3b007' }} />
                            </div>
                            <button style={{ margin: '15px 10px', padding: '8px 10px', borderRadius: '10px', width: '-webkit-fill-available', fontWeight: 'bold', border: '1px solid #f3b007', background: 'none', color: '#f3b007' }} onClick={() => { signup() }}>Register</button>
                            <p style={{ color: '#f3b007', cursor: 'pointer', margin: '10px 5px' }} onClick={() => { setRegister(false) }}>Already registered? Login here.</p>
                        </div>
                )
            }
        </div>
    )
}

export default Login
