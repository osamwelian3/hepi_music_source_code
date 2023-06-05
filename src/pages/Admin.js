import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AdminAlbums from './admin components/AdminAlbums';
import AdminCategories from './admin components/AdminCategories';
import AdminCreators from './admin components/AdminCreators';
import AdminSongs from './admin components/AdminSongs';
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
Amplify.configure(awsconfig)
function Admin({ isAuthenticated }) {
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
            if (res?.attributes?.sub !== ("91d34d2a-3001-7095-546c-6df22cb9d8a2" || "7rbDXS9eipV7OXSTYCWsnWu8wxx1")){
                alert('You need to log in as an admin to access this page.')
                history.push('/')
            }
        })
    }, [isAuthenticated]);
    return (
        <div className='page_container' style={{ marginTop: 'calc(55px)', minHeight: 'calc(100vh - 55px)', padding: '0' }}>
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
}

export default Admin