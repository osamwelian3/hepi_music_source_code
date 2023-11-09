import { createUserWithEmailAndPassword, FacebookAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Amplify, Auth, Storage, API, graphqlOperation } from 'aws-amplify';
import { createUser } from '../graphql/mutations';
import { collection, collectionGroup, doc, onSnapshot, setDoc } from 'firebase/firestore';
import React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { auth, db2 } from '../config/fire'
import { db } from '../config/fire'
import awsconfig from '../aws-exports';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
Amplify.configure(awsconfig);


function Login({ setIsLoginVisible }) {
    const [register, setRegister] = useState(false)
    const [userName, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [emailVerificationMessage, setEmailVerificationMessage] = useState("")
    const [phone_number, setPhone_Number] = useState("")
    const [password, setPassword] = useState("")
    const [isAuthenticating, setIsAuthenticating] = useState(false)
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
    }, [isAuthenticating]);
    const history = useHistory()
    async function signIn() {
        try {
          await Auth.signIn(userName, password).then((user)=>{
            
          }).catch((err)=>{
            console.log(err);
          });
        } catch (error) {
          console.log('error signing in', error);
        }
      }
    async function login() {
        setIsAuthenticating(true)
        if (email !== "" && password !== "") {
            await signInWithEmailAndPassword(
                auth, email, password
            ).then(() => {
                onSnapshot(collectionGroup(db, 'user_details'), (snap)=>{
                    console.log(snap);
                    snap.docs.forEach(async user=>{
                        if (auth.currentUser.uid === user.data().uid){
                            console.log(user.data());
                            setUserName(user.data().name);
                            await Auth.signIn(user.data().name, password).then((res)=>{
                                console.log(res);
                                setIsAuthenticating(false)
                                console.log(res?.attributes?.sub);
                                if (res?.attributes?.sub === "91d34d2a-3001-7095-546c-6df22cb9d8a2" || res?.attributes?.sub === "d153bd3a-9041-70a2-b70d-470c066a714f" || res?.attributes?.sub === "11537dfa-20c1-70df-f960-7f647b48dc61") {
                                    history.push('/admin')
                                } else {
                                    console.log(currentUser?.attributes?.sub);
                                    history.push('/')
                                }
                            }).catch(async (err)=>{
                                const code = err.code;
                                console.log(err);
                                switch (code) {
                                    case 'UserNotFoundException':
                                        await Auth.signUp({
                                            username: user.data().name,
                                            password,
                                            attributes: {
                                                email,          // optional
                                                phone_number,   // optional - E.164 number convention
                                                // other custom attributes 
                                            },
                                            autoSignIn: { // optional - enables auto sign in after user is confirmed
                                                enabled: true,
                                            }
                                            }).then(async (user)=>{
                                                console.log(user);
                                                setIsAuthenticating(false)
                                                if (user?.attributes?.sub === "91d34d2a-3001-7095-546c-6df22cb9d8a2" || user?.attributes?.sub === "d153bd3a-9041-70a2-b70d-470c066a714f" || user?.attributes?.sub === "11537dfa-20c1-70df-f960-7f647b48dc61") {
                                                    history.push('/admin')
                                                } else {
                                                    history.push('/')
                                                }
                                                // await API.graphql(graphqlOperation(createUser, {input: {}}))
                                            });
                                        return false;
                                    case 'NotAuthorizedException':
                                        setIsAuthenticating(false)
                                        return true;
                                    case 'PasswordResetRequiredException':
                                        setIsAuthenticating(false)
                                        return false;
                                    case 'UserNotConfirmedException':
                                        alert("Please check your email and click on the verification link to finish your account creation.");
                                        setIsAuthenticating(false)
                                        if (auth.currentUser.uid === "91d34d2a-3001-7095-546c-6df22cb9d8a2" || auth.currentUser.uid === "d153bd3a-9041-70a2-b70d-470c066a714f" || auth.currentUser.uid === "11537dfa-20c1-70df-f960-7f647b48dc61") {
                                            history.push('/admin')
                                        } else {
                                            history.push('/')
                                        }
                                        return false;
                                    default:
                                        setIsAuthenticating(false)
                                        return false;
                                }
                            });
                        }
                    });
                });
                // if (auth.currentUser.uid === "7rbDXS9eipV7OXSTYCWsnWu8wxx1") {
                //     history.push('/admin')
                // } else {
                //     history.push('/')
                // }
            }).catch(error => {
                setIsAuthenticating(false)
                console.log(error);
                switch (error.message) {
                    case 'Firebase: Error (auth/invalid-email).':
                        alert('You entered invalid email-id')
                        break;
                    case 'Firebase: Error (auth/wrong-password).':
                        alert('You entered wrong password')
                        break;
                    default:
                        alert('Something went wrong try again later', error)
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
                console.log(result);
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
    // async function signup() {
    //     if (email !== "" && password !== "" && password.length > 6 && userName !== "") {
    //         await createUserWithEmailAndPassword(
    //             auth, email, password
    //         ).then(() => {
    //             setDoc(doc(db, 'users', auth.currentUser.uid, 'user_details', 'info'), {
    //                 name: userName,
    //                 uid: auth.currentUser.uid
    //             }).then(() => {
    //                 history.push('/')
    //             })
    //         }).catch(error => {
    //             console.log(error);
    //             alert(error.message, 'error while register')
    //         })
    //     } else if (userName === "") {
    //         alert("User name not entered")
    //     } else if (email === "") {
    //         alert("Email not entered")
    //     } else if (password.length < 6) {
    //         alert("password must be at least 6 characters")
    //     } else {
    //         alert('Oops, an error occurred try again later')
    //     }
    // }
    async function signup() {
        setIsAuthenticating(true)
        if (email !== "" && password !== "" && password.length > 6 && userName !== "") {
            try {
                await Auth.signUp({
                username: userName,
                password,
                attributes: {
                    email,          // optional
                    phone_number,   // optional - E.164 number convention
                    // other custom attributes 
                },
                autoSignIn: { // optional - enables auto sign in after user is confirmed
                    enabled: true,
                }
                }).then(async (user)=>{
                    console.log(user);
                    await createUserWithEmailAndPassword(auth, email, password).then(()=>{
                        setDoc(doc(db, 'users', auth.currentUser.uid, 'user_details', 'info'), {
                            name: userName,
                            uid: auth.currentUser.uid
                        }).then(() => {
                            setIsAuthenticating(false)
                            setEmailVerificationMessage('You are almost there. Go to your email and click on the verification link.')
                            // history.push('/')
                        })
                    }).catch((error)=>{
                        setIsAuthenticating(false)
                        alert(error.message);
                    });
                    
                    // await API.graphql(graphqlOperation(createUser, {input: {}}))
                });
                // console.log(user);
            } catch (error) {
                setIsAuthenticating(false)
                alert(error.message);
                console.log('error signing up:', error);
            }
        } else if (userName === "") {
            setIsAuthenticating(false)
            alert("User name not entered")
        } else if (email === "") {
            setIsAuthenticating(false)
            alert("Email not entered")
        } else if (password.length < 6) {
            setIsAuthenticating(false)
            alert("password must be at least 6 characters")
        } else {
            setIsAuthenticating(false)
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
    if (emailVerificationMessage !== ""){
        return (
            <div className='login_bg' style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className='login_form_bg' style={{ textAlign: 'center', width: "90vw", maxWidth: '400px', height: 'max-content', padding: '10px', borderRadius: '10px' }} >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '-10vh', marginBottom: '20px', padding: '0px 10px' }}>
                        <img src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/hepi_logo2.jpg")} style={{ marginLeft: '-35px', height: '100px', width: '150px' }} />

                    </div>
                    <div>
                        <p style={{ color: '#f3b007', cursor: 'pointer', margin: '10px 5px' }}>{emailVerificationMessage}</p>
                        <p style={{ color: '#f3b007', cursor: 'pointer', margin: '10px 5px' }} onClick={() => { setEmailVerificationMessage(""); setRegister(false) }}>Already verified? Login here.</p>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className='login_bg' style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {isAuthenticating ? 
            <div className='login_fg' style={{ width: '100vw', height: '100vh', backgroundColor: `rgba(0,0,0,0.5)`, background: `url("https://mir-s3-cdn-cf.behance.net/project_modules/disp/04de2e31234507.564a1d23645bf.gif")`, backgroundBlendMode: 'multiply', backgroundRepeat: 'no-repeat', position: 'absolute', backgroundPosition: 'center'}}></div>
            :
            <></>}

            {
                (
                    register === false ?
                        <div className='login_form_bg' style={{ textAlign: 'center', width: "90vw", maxWidth: '400px', height: 'max-content', padding: '10px', borderRadius: '10px' }} >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '-10vh', marginBottom: '20px', padding: '0px 10px' }}>
                                <img src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/hepi_logo2.jpg")} style={{ marginLeft: '-35px', height: '100px', width: '150px' }} />

                            </div>
                            {/* <div>
                                <p style={{ color: '#f3b007', cursor: 'pointer', margin: '10px 5px' }}>We are currently migrating to a new server to serve you better with high quality streaming. Due to this we will require all users to verify their accounts. Once you login to your previous account. An email will be sent to your email address to verify your new account. Thank you for your continued loyalty to Hepi Music.</p>
                            </div> */}
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
                                <img onClick={async () => { const { url } = await Auth.federatedSignIn({provider: 'Google'}); window.open(url, '_blank', 'width=500,height=600'); /*googleAuth()*/ }} class="google-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" style={{ height: '50px', width: '50px', marginRight: '40px' }} />
                                <img onClick={async () => { const { url } = await Auth.federatedSignIn({provider: CognitoHostedUIIdentityProvider.Facebook}); window.open(url, '_blank', 'width=500,height=600'); /*facebookAuth()*/ }} class="google-icon" src="https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Facebook_f_logo_%282021%29.svg/1200px-Facebook_f_logo_%282021%29.svg.png" style={{ height: '50px', width: '50px' }} />
                            </div>
                        </div>
                        :
                        <div className='login_form_bg' style={{ textAlign: 'center', width: "90vw", maxWidth: '400px', height: 'max-content', padding: '10px', borderRadius: '10px' }} >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '-10vh', marginBottom: '20px', padding: '0px 10px' }}>
                                <img src={encodeURI("https://dn1i8z7909ivj.cloudfront.net/public/hepi_logo2.jpg")} style={{ marginLeft: '-35px', height: '100px', width: '150px' }} />
                            </div>
                            {/* <div>
                                <p style={{ color: '#f3b007', cursor: 'pointer', margin: '10px 5px' }}>We are currently migrating to a new server to serve you better with high quality streaming. Due to this we will require all users to verify their accounts. Once you login to your previous account. An email will be sent to your email address to verify your new account. Thank you for your continued loyalty to Hepi Music.</p>
                            </div> */}
                            <div>
                                <input type="text" placeholder='User name' onChange={(e) => { setUserName(e.target.value) }} style={{ width: '95%', height: '45px', marginBottom: '10px', background: 'none', padding: '10px', border: '1px solid #ffffff2e', borderRadius: '10px', color: '#f3b007' }} />
                            </div>
                            <div>
                                <input type="Email" placeholder='Email' onChange={(e) => { setEmail(e.target.value) }} style={{ width: '95%', height: '45px', marginBottom: '10px', background: 'none', padding: '10px', border: '1px solid #ffffff2e', borderRadius: '10px', color: '#f3b007' }} />
                            </div>
                            <div>
                                <input type="Tel" placeholder='Phone (+254 7xx xxx xxx)' onChange={(e) => { setPhone_Number(e.target.value) }} style={{ width: '95%', height: '45px', marginBottom: '10px', background: 'none', padding: '10px', border: '1px solid #ffffff2e', borderRadius: '10px', color: '#f3b007' }} />
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
