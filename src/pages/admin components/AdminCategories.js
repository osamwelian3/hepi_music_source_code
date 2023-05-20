import React, { useState, useEffect } from 'react'
import { IoAddOutline, IoAddSharp } from 'react-icons/io5'
import { Modal } from 'react-bootstrap';
import { db } from '../../config/fire';
import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
function AdminCategories() {
    const [allCategories, setAllCategories] = useState(null)
    const [name, setName] = useState('')
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    useEffect(() => {
        onSnapshot(collection(db, 'categories'), (snap) => {
            let temp = []
            snap.docs.forEach(doc => {
                temp.push(doc.data())
            })
            setAllCategories(temp)
        })
    }, [])
    function addCategory() {
        const key = uuidv4()
        setDoc(doc(db, 'categories', key), {
            name,
            key
        }).then(() => {
            alert('added');
            setShow(false)
        })
    }
    function deleteCategory(key) {
        const q = window.confirm('Do you really want to delete this category?');
        if (q) {
            deleteDoc(doc(db, 'categories', key)).then(() => {
                alert('Deleted');
                setShow(false)
            })
        }
    }
    return (
        <div style={{ padding: '10px' }}>
            <Modal className='addLinkModal' show={show} onHide={handleClose}>
                <Modal.Body>
                    <h2>New category</h2>
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Name</p>
                    <input type={'text'} value={name} onChange={(e) => { setName(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', marginTop: '20px' }}>
                        <buttn onClick={handleClose} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancle
                        </buttn>
                        <buttn onClick={() => { addCategory() }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Add
                        </buttn>
                    </div>
                </Modal.Body>
            </Modal>
            <div onClick={() => { setShow(true) }} style={{ width: '-webkit-fill-available', height: '70px', border: '1px solid #f3b007', borderRadius: '10px', color: '#f3b007', margin: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IoAddSharp style={{ color: '#f3b007', margin: '0', fontSize: '2em', marginRight: '7px' }} />
                <h1 style={{ color: '#f3b007', margin: '0' }}>Add new</h1>
            </div>
            <h6 style={{ marginBottom: '15px' }}>All categories</h6>
            <div style={{ padding: '10px', paddingTop: '0' }}>
                {
                    allCategories && allCategories.map((category) => {
                        return (
                            <div style={{ width: '-webkit-fill-available', height: 'max-content', padding: '20px', borderRadius: '10px', marginBottom: '10px', color: '#000', backgroundColor: '#f3b007', display: 'flex', alignItems: 'center' }}>
                                <h1 style={{ color: '#000', margin: '0' }}>{category.name}</h1>
                                <div style={{ flex: '1' }} />
                                <p style={{ margin: '0' }} onClick={() => { deleteCategory(category.key) }}>Delete</p>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default AdminCategories