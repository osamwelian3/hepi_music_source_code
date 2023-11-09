import React, { useState, useEffect } from 'react'
import { IoAddOutline, IoAddSharp } from 'react-icons/io5'
import { Modal, Spinner } from 'react-bootstrap';
import { db } from '../../config/fire';
import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { Amplify, API, DataStore, graphqlOperation } from 'aws-amplify';
import { listCategories } from '../../graphql/queries';
import { createCategory, deleteCategory as delCategory, updateCategory } from '../../graphql/mutations';
import awsconfig from '../../aws-exports';
import { Category } from '../../models';
Amplify.configure(awsconfig)
function AdminCategories() {
    const [allCategories, setAllCategories] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [spinner, setSpinner] = useState(false)
    const [deleteSpinner, setDeleteSpinner] = useState([])
    const [name, setName] = useState('')
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [showD, setShowD] = useState(false)
    const handleCloseD = () => setShowD(false);
    const handleShowD = () => setShowD(true);
    useEffect(async () => {
        const sub = DataStore.observeQuery(Category, null, { limit: 10000 }).subscribe(snapshot => {
            const {items, isSynced} = snapshot
            let temp = []
            if (isSynced) {
              items.forEach((category) => {
                temp.push(category)
              })
              setAllCategories(temp)
            }
          })
        // await API.graphql(graphqlOperation(listCategories, {limit: 1000000})).then((res) => {
        //     let temp = [];
        //     res.data?.listCategories?.items.forEach(doc => {
        //         console.log(doc);
        //         temp.push(doc);
        //     });
        //     setAllCategories(temp);
        // })
        return () => { if (sub) { sub.unsubscribe() } }
    }, [])
    async function addCategory() {
        const key = uuidv4()
        // setDoc(doc(db, 'categories', key), {
        //     name,
        //     key
        // }).then(() => {
        //     alert('added');
        //     setShow(false)
        // })
        const category = {
            name: name.trim(),
            key: key
        }
        const addcategory = await DataStore.save(new Category(category))
        
        if (addCategory) {
            setAllCategories([...allCategories, category])
            alert('category added')
            setShow(false)
            setSpinner(false)
        }

        // await API.graphql(graphqlOperation(createCategory, { input: category })).then((res) => {
        //     console.log(res);
        //     setAllCategories([...allCategories, res?.data?.createCategory])
        //     alert('category added')
        //     setShow(false)
        //     setSpinner(false)
        // }).then((error) => {
        //     console.log(error);
        // })
    }
    async function editCategory(categoryKey) {
        const key = categoryKey;
        const original = await DataStore.query(Category, key)
        if (!original) return

        const category = {
            name: name.trim(),
            key: key
        }
        const editCategory = await DataStore.save(Category.copyOf(original, updated => {
            updated.name = name.trim()
        }))

        if (editCategory) {
            setAllCategories([...allCategories.map((categ)=>{return categ.key === key ? category : categ})])
            alert('category edited')
            setShowD(false)
            setSpinner(false)
        }
        // await API.graphql(graphqlOperation(updateCategory, { input: category })).then((res) => {
        //     console.log(res);
        //     setAllCategories([...allCategories.map((categ)=>{return categ.key === key ? category : categ})])
        //     alert('category edited')
        //     setShowD(false)
        //     setSpinner(false)
        // }).then((error) => {
        //     console.log(error);
        // })
    }
    async function deleteCategory(key, version, name) {
        const q = window.confirm(`Do you really want to delete ${name} category?`);
        if (q) {
            const categoryToDelete = await DataStore.query(Category, key)
            await DataStore.delete(categoryToDelete).then((res) => {
                console.log(res);
                setAllCategories([...allCategories.filter(category => category.key !== key)])
                alert('Category Deleted')
                setShow(false)
                const updatedDeleteSpinner = [...deleteSpinner]
                updatedDeleteSpinner[key] = false
                setDeleteSpinner(updatedDeleteSpinner)
            })
        }
    }
    useEffect(()=>{
        if (showD){
            setName(selectedCategory?.name)
            setSpinner(false)
        } else {
            setName('')
            setSpinner(false)
        }
    }, [showD])
    return (
        <div style={{ padding: '10px' }}>
            <Modal className='addLinkModal' show={show} onHide={handleClose}>
                <Modal.Body>
                    <h2>New category</h2>
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Name</p>
                    <input type={'text'} value={name} onChange={(e) => { setName(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', marginTop: '20px' }}>
                        <buttn onClick={handleClose} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancel
                        </buttn>
                        {
                            !spinner ? 
                                <buttn onClick={() => { setSpinner(true); addCategory() }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                                    <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Add
                                </buttn>
                                :
                                <Spinner style={{ color: '#f3b007' }} />
                        }
                        
                    </div>
                </Modal.Body>
            </Modal>

            {/* edit category */}
            <Modal className='addLinkModal' show={showD} onHide={handleCloseD}>
                <Modal.Body>
                    <h2>Edit category</h2>
                    <p style={{ margin: '0', color: '#6d6d6d' }}>Name</p>
                    <input type={'text'} value={name} onChange={(e) => { setName(e.target.value) }} style={{ borderRadius: '5px', fontSize: '1em', padding: '8px 15px', color: '#fff', textTransform: 'capitalize', background: '#151515', width: '-webkit-fill-available', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', marginTop: '20px' }}>
                        <buttn onClick={handleCloseD} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#f3b007', border: '1px solid #f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                            Cancel
                        </buttn>
                        {
                            !spinner ? 
                                <buttn onClick={() => { setSpinner(true); editCategory(selectedCategory?.key) }} style={{ borderRadius: '50vh', display: 'flex', justifyContent: 'center', fontSize: '1em', padding: '8px 15px', color: '#000', background: '#f3b007', margin: '10px 5px', width: '-webkit-fill-available', marginBottom: '0' }} className='btn'>
                                    <IoAddOutline style={{ fontSize: '1.5em', marginRight: '7px' }} />Save
                                </buttn>
                                :
                                <Spinner style={{ color: '#f3b007' }} />
                        }
                        
                    </div>
                </Modal.Body>
            </Modal>
            {/* edit category */}

            <div onClick={() => { setShow(true) }} style={{ width: '-webkit-fill-available', height: '70px', border: '1px solid #f3b007', borderRadius: '10px', color: '#f3b007', margin: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IoAddSharp style={{ color: '#f3b007', margin: '0', fontSize: '2em', marginRight: '7px' }} />
                <h1 style={{ color: '#f3b007', margin: '0' }}>Add new</h1>
            </div>
            <h6 style={{ marginBottom: '15px' }}>All categories</h6>
            <div style={{ padding: '10px', paddingTop: '0' }}>
                {
                    allCategories && allCategories.map((category) => {
                        return (
                            <div key={category?.key} style={{ width: '-webkit-fill-available', height: 'max-content', padding: '20px', borderRadius: '10px', marginBottom: '10px', color: '#000', backgroundColor: '#f3b007', display: 'flex', alignItems: 'center' }}>
                                <h1 style={{ color: '#000', margin: '0' }} onClick={() => {setSelectedCategory(category); handleShowD()}}>{category.name}</h1>
                                <div style={{ flex: '1' }} onClick={() => {setSelectedCategory(category); handleShowD()}} />
                                {
                                    !deleteSpinner[category?.key] ? 
                                        <p style={{ margin: '0', cursor: 'pointer' }} onClick={() => { const updatedDeleteSpinner = [...deleteSpinner]; updatedDeleteSpinner[category?.key] = true; setDeleteSpinner(updatedDeleteSpinner); deleteCategory(category.key, category._version, category.name) }}>Delete</p>
                                        :
                                        <Spinner style={{ color: '#000000' }} />
                                }
                                
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default AdminCategories