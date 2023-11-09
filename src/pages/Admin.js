import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AdminAlbums from './admin components/AdminAlbums';
import AdminCategories from './admin components/AdminCategories';
import AdminCreators from './admin components/AdminCreators';
import AdminSongs from './admin components/AdminSongs';
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
import Helmet from 'react-helmet';
Amplify.configure(awsconfig)
function Admin({ isAuthenticated }) {
    const [adminUser, setAdminUser] = useState(null)
    const history = useHistory()
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
            setAdminUser(res)
            if ((res?.attributes?.sub !== "91d34d2a-3001-7095-546c-6df22cb9d8a2") && (res?.attributes?.sub !== "d153bd3a-9041-70a2-b70d-470c066a714f") && (res?.attributes?.sub !== "11537dfa-20c1-70df-f960-7f647b48dc61")){
                alert('You need to log in as an admin to access this page.')
                history.push('/')
            }
        })
    }, [isAuthenticated]);
    if ((adminUser?.attributes?.sub === "91d34d2a-3001-7095-546c-6df22cb9d8a2") || (adminUser?.attributes?.sub === "d153bd3a-9041-70a2-b70d-470c066a714f") || (adminUser?.attributes?.sub === "11537dfa-20c1-70df-f960-7f647b48dc61")) return (
        <div className='page_container' style={{ marginTop: 'calc(55px)', minHeight: 'calc(100vh - 55px)', padding: '0' }}>
            <Helmet>
                <title>{`Admin Panel | Hepi Music`}</title>
                <meta name="description" content="Manage songs, categories, creators and albums" />
                <meta name="keywords" content="Hepi, Music, Songs, Stream, Play, Online music, Best, All songs" />

                {/*<!--  Essential META Tags -->*/}
                <meta property="og:title" content="Hepi Music" />
                <meta property="og:type" content="website" />
                <meta property="og:image:width" content="500" />
                <meta property="og:image:height" content="500" />
                <meta property="og:image" content="%PUBLIC_URL%/logo1.jpg" />
                <meta property="og:url" content="https://hepimusic.com" />
                <meta name="twitter:card" content="summary_large_image" />

                {/*<!--  Non-Essential, But Recommended -->*/}
                <meta property="og:description" content="Manage songs, categories, creators and albums" />
                <meta property="og:site_name" content="Hepi Music Library" />
                <meta name="twitter:image:alt" content="Hepi Music Library"></meta>
            </Helmet>
            <h6 style={{ marginBottom: '15px' }}></h6>
            <Tabs
                defaultActiveKey="Categories"
                id="uncontrolled-tab-example"
                className="mb-1"
            >
                <Tab eventKey="Categories" title="Categories">
                    <AdminCategories />
                </Tab>
                <Tab eventKey="Songs" title="Songs">
                    <AdminSongs />
                </Tab>
                <Tab eventKey="Creators" title="Creators">
                    <AdminCreators />
                </Tab>
                <Tab eventKey="Albums" title="Albums">
                    <AdminAlbums />
                </Tab>
            </Tabs>
        </div>
    )

    return (<div  className='page_container' style={{ marginTop: 'calc(55px)', minHeight: 'calc(100vh - 55px)', padding: '0' }}></div>)
}

export default Admin