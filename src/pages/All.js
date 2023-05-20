import React from 'react'
import { BiArrowBack } from 'react-icons/bi'
import { useHistory } from 'react-router-dom'

function All({ selectedCategory, arr, setSelectedSong, setIsBigPlayerVisible }) {
    const history = useHistory()
    return (
        <div className='page_container'>
            <div style={{ width: '-webkit-fill-available', height: '55px', display: 'flex' }}>
                <BiArrowBack onClick={() => { history.goBack() }} style={{ fontSize: '1.5em', color: '#f3b007', marginRight: '20px' }} />
                <h4 style={{ margin: '0', color: '#f3b007' }}>{selectedCategory}</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', width: '100%' }}>
                {
                    arr && selectedCategory !== 'Top 50' && arr.filter(song => song.selectedCategory === selectedCategory).map((one) => {
                        return (
                            <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                <img src={one.thumbnail}
                                    style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                />
                                <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
                            </div>
                        )
                    })
                }
                {
                    arr && selectedCategory === 'Top 50' && arr.sort((a, b) => a?.listOfUidUpVotes?.length - b?.listOfUidUpVotes?.length).reverse().map((one) => {
                        return (
                            <div onClick={() => { setSelectedSong(one); setIsBigPlayerVisible(true) }} style={{ width: '100%', marginBottom: '30px', height: 'calc(50vw - 20px)', padding: '10px' }}>
                                <img src={one.thumbnail}
                                    style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', borderRadius: '10px' }}
                                />
                                <p style={{ marginTop: '3px', paddingLeft: '5px' }}>{one.name}</p>
                            </div>
                        )
                    })
                }
            </div>
            <br></br>
            <br></br>
            <br></br>
        </div>
    )
}

export default All