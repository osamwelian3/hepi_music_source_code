import React from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AdminAlbums from './admin components/AdminAlbums';
import AdminCategories from './admin components/AdminCategories';
import AdminCreators from './admin components/AdminCreators';
import AdminSongs from './admin components/AdminSongs';
function Admin() {
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