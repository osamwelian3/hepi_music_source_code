import { auth2, db2, storage2 } from './config/fire';
import { Amplify, Storage } from 'aws-amplify';
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import awsconfig from './aws-exports';
import { Auth } from 'aws-amplify';
Amplify.configure(awsconfig);


// let username = prompt("Enter Username: ");
// let password = prompt("Enter password: ");

// async function confirmSignUp() {
//     let code = prompt("Enter confirmation code: ");
//     try {
//       await Auth.confirmSignUp(username, code);
//     } catch (error) {
//       console.log('error confirming sign up', error);
//     }
//   }

// async function signIn() {
//     try {
//       const user = await Auth.signIn(username, password);
//     } catch (error) {
//       console.log('error signing in', error);
//       await signUp();
//     }
//   }

// async function signUp() {
//     // let username = prompt("Enter Username: ");
//     // let password = prompt("Enter password: ");
//     let email = prompt("Enter email: ");
//     let phone_number = prompt("Enter phone number: ");
//     try {
//         const { user } = await Auth.signUp({
//             username,
//             password,
//             attributes: {
//             email,          // optional
//             phone_number,   // optional - E.164 number convention
//             // other custom attributes 
//             },
//             autoSignIn: { // optional - enables auto sign in after user is confirmed
//             enabled: true,
//             }
//         });
//         console.log(user);
//         await confirmSignUp();
//         } catch (error) {
//         console.log('error signing up:', error);
//         }
    
//   }

//   export async function signOut() {
//     try {
//       await Auth.signOut({ global: true });
//     } catch (error) {
//       console.log('error signing out: ', error);
//     }
//   }

// Download a file form a url.
export async function saveImageFile(url, authState) {
    let myPromise = new Promise(async function(resolve){
        // await signOut();
        // if (!authState){
        //     alert ("Not authenticated. Sign/Register in first")
        //     await signIn();
        // } else {
        //     alert("Already Authenticated");
        //     await signIn();
        // }
        var downloadUrl = null;
        // Get file name from url.
        var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0].replace("images%2F", "").replaceAll("%20"," ");
        var xhr = new XMLHttpRequest();
        // xhr.addEventListener("load", transferComplete);
        xhr.addEventListener("error", transferFailed);
        xhr.addEventListener("abort", transferCanceled);
        
        xhr.responseType = 'blob';
        xhr.onload = function() {
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
            a.download = filename; // Set the file name.
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a)
            // delete a;
        
            if (this.status === 200) {
                // `blob` response
                console.log(this.response);
                var reader = new FileReader();
                reader.onload = async function(e) {

                    const imageFile = e.target.result;

                    var base64result = reader.result.split(',')[1];
                    var blob = b64toBlob(base64result);


                    console.log(blob);

                    const imageOne = blob; // imageFile;
                    const storageRef = sRef(storage2, `images/${filename}`); // ${imageOne.name}
                    const stored = await Storage.put(`images/${filename}`, imageOne).then(async (res)=>{
                        downloadUrl = await Storage.get(`images/${filename}`, { validateObjectExistence: true });
                        console.log(res)
                        resolve({"downloadUrl": downloadUrl, "key": res.key})
                    }).catch((err)=>{
                        console.log(err);
                    });

                    // const uploadTask = uploadBytesResumable(storageRef, imageOne);
                    // uploadTask.on('state_changed',
                    //     (snapshot) => {
                    //     },
                    //     (error) => {
                    //         alert(error)
                    //     },
                    //     () => {
                    //         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    //             // setProfileLoading(false)
                    //             // setThumbnail(downloadURL)
                    //             downloadUrl = downloadURL;
                    //             alert("downloadURL: "+downloadURL);
                    //             resolve(downloadURL);
                    //         });
                    //     }
                    // );
        
                    // var auth = firebase.auth();
                    // var storageRef = firebase.storage().ref();
            
                    // var metadata = {
                    //     'contentType': 'image/jpeg'
                    // };
            
                    // var file = e.target.result;
                    // var base64result = reader.result.split(',')[1];
                    // var blob = b64toBlob(base64result);


                    // console.log(blob);
            
                    // var uploadTask = storageRef.child('images/' + filename).put(blob, metadata);

                    // uploadTask.on('state_changed', null, function(error) {
                    //     // [START onfailure]
                    //     console.error('Upload failed:', error);
                    //     // [END onfailure]
                    // }, function() {
                    //     console.log('Uploaded',uploadTask.snapshot.totalBytes,'bytes.');
                    //     console.log(uploadTask.snapshot.metadata);
                    //     var download = uploadTask.snapshot.metadata.downloadURLs[0];
                    //     console.log('File available at', download);
                    //     // [START_EXCLUDE]
                    //     document.getElementById('linkbox').innerHTML = '<a href="' +  download + '">Click For File</a>';
                    //     // [END_EXCLUDE]
                    // });
                    // // `data-uri`
        
                };
                reader.readAsDataURL(this.response);        
            };
        };
        
        
        await Storage.get(`images/${filename}`, { validateObjectExistence: true }).then((res)=>{
            console.log(res);
            resolve({"downloadUrl": res, "key": `images/${filename}`});
        }).catch((error)=>{
            console.log("Doesnt exist");
            console.log(error);
            xhr.open('GET', url);
            xhr.send();
        });

    });

    return await myPromise;
    
}


// Download a file form a url.
export async function saveMusicFile(url, authState) {
    let myPromise = new Promise(async function(resolve){
        // if (!authState){
        //     alert ("Not authenticated. Sign/Register in first")
        //     await signIn();
        // } else {
        //     alert("Already Authenticated");
        //     // await signIn();
        // }

        var downloadUrl = null;
        // Get file name from url.
        var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0].replace("files%2F", "").replaceAll("%20"," ");
        var xhr = new XMLHttpRequest();
        // xhr.addEventListener("load", transferComplete);
        xhr.addEventListener("error", transferFailed);
        xhr.addEventListener("abort", transferCanceled);
        
        xhr.responseType = 'blob';
        xhr.onload = function() {
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
            a.download = filename; // Set the file name.
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a)
            // delete a;
        
            if (this.status === 200) {
                // `blob` response
                console.log(this.response);
                var reader = new FileReader();
                reader.onload = async function(e) {

                    const imageFile = e.target.result;

                    var base64result = reader.result.split(',')[1];
                    var blob = b64toBlob(base64result);


                    console.log(blob);

                    const imageOne = blob; // imageFile;
                    const storageRef = sRef(storage2, `files/${filename}`); // ${imageOne.name}
                    
                    const stored = await Storage.put(`files/${filename}`, imageOne).then(async (res)=>{
                        // To check for existence of a file
                        downloadUrl = await Storage.get(`files/${filename}`, { validateObjectExistence: true });
                        console.log(res);
                        resolve({"downloadUrl": downloadUrl, "key": res.key});
                    }).catch((err)=>{
                        console.log(err);
                    })
                    

                    // const uploadTask = uploadBytesResumable(storageRef, imageOne);
                    // uploadTask.on('state_changed',
                    //     (snapshot) => {
                    //     },
                    //     (error) => {
                    //         alert(error)
                    //     },
                    //     () => {
                    //         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    //             // setProfileLoading(false)
                    //             // setThumbnail(downloadURL)
                    //             downloadUrl = downloadURL;
                    //             alert("downloadURL: "+downloadURL);
                    //             resolve(downloadURL);
                    //         });
                    //     }
                    // );
        
                };
                reader.readAsDataURL(this.response);        
            };
        };
        
        await Storage.get(`files/${filename}`, { validateObjectExistence: true }).then((res)=>{
            console.log(res);
            resolve({"downloadUrl": res, "key": `files/${filename}`});
        }).catch((error)=>{
            console.log("Doesnt exist");
            console.log(error);
            xhr.open('GET', url);
            xhr.send();
        });

    });

    return await myPromise;
    
}


    
function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}
    
    
    
// function transferComplete(evt) {        

//     window.onload = function() {
//         // Sign the user in anonymously since accessing Storage requires the user to be authorized.
//         auth.signInAnonymously().then(function(user) {
//             console.log('Anonymous Sign In Success', user);
//             document.getElementById('file').disabled = false;
//         }).catch(function(error) {
//             console.error('Anonymous Sign In Error', error);
//         });
//     } 
// }
    
    
    
function transferFailed(evt) {
    console.log("An error occurred while transferring the file.");
}

function transferCanceled(evt) {
    console.log("The transfer has been canceled by the user.");
}

// Keeping this here
// temporary job
// useEffect(async ()=>{
//     onSnapshot(collection(db, 'songs'), (snap) => {
//         snap.docs.forEach(async doc => {
//             arr.forEach(async item => {
//                 if (doc.data().key === item.key){
//                     const { createdAt, updatedAt, _deleted, _lastChangedAt, ...modifiedSong } = item;
//                     const modifiedSongWithPartOf = { ...modifiedSong, partOf: doc.data().partOf };
//                     if (doc.data().partOf){
//                         alert(doc.data().partOf)
//                     }
//                     console.log(doc.data());
//                     await API.graphql(graphqlOperation(updateSong, { input: modifiedSongWithPartOf })).then((res) => {
//                         console.log(res)
//                     })
//                 }
//             })
//         })
//     })
// }, [])
// end of temporary job