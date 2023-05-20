import React from 'react'
import AudioPlayer from 'react-h5-audio-player';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FaExpandArrowsAlt } from 'react-icons/fa';
import { TbArrowsMinimize } from 'react-icons/tb';
function SmallPlayer({ selectedSong, setSelectedSong, allSongs }) {
    const location = useLocation()
    const history = useHistory()
    function next() {
        allSongs.filter((song, i) => {
            if (song.key === selectedSong.key) {
                console.log(i);
                setSelectedSong(allSongs[i + 1])
            }
        });
    }
    function prev() {
        allSongs.filter((song, i) => {
            if (song.key === selectedSong.key) {
                console.log(i);
                setSelectedSong(allSongs[i - 1])
            }
        });
    }
    if (location.pathname === '/login' || location.pathname === '/admin' || location.pathname === '/profile' || location.pathname === '/aboutus') {
        return (<></>)
    }
    return (
        <div className='detail_modal' style={{ height: 'min-content', maxHeight: 'max-content', width: '100vw', position: 'fixed', display: location.pathname === '/login' ? 'none' : 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bottom: '0px', left: '0', zIndex: '99', background: '#000' }}>
            <AudioPlayer
                autoPlay
                src={selectedSong?.fileUrl}
                onPlay={e => console.log("on Play")}
                style={{ maxWidth: '450px' }}
                showSkipControls={true}
                showJumpControls={false}
                onClickNext={() => { next() }}
                onClickPrevious={() => { prev() }}
                onEnded={() => { next() }}
                customVolumeControls={
                    [
                        <FaExpandArrowsAlt style={{ color: '#fff', margin: '0px 5px', color: '#000' }} />
                    ]
                }
                customAdditionalControls={
                    location.pathname !== '/song' ?
                        [

                            <Link to={'/song'}>
                                <FaExpandArrowsAlt style={{ color: '#aaa', margin: '0px 5px', fontSize: '1.2em' }} />
                            </Link>
                        ]
                        :
                        [
                            <TbArrowsMinimize onClick={() => { history.goBack() }} style={{ color: '#aaa', margin: '0px 5px', fontSize: '1.2em' }} />

                        ]
                }
            />
        </div>
    )
}

export default SmallPlayer