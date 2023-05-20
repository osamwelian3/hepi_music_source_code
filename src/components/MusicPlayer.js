import React from 'react'
import AudioPlayer from 'react-h5-audio-player';
import { useLocation } from 'react-router-dom';
import './mp.css';
function MusicPlayer() {
    const location = useLocation();
    if (location.pathname === '/login' || location.pathname === '/admin' || location.pathname === '/profile' || location.pathname === '/aboutus') {
        return (<></>)
    }
    return (
        <div className='music_player_container'>
            <AudioPlayer
                autoPlay
                src="https://www.hepimusic.com/storage/uploads/w31sPqctNrtYZ2UJnmlZGx9BMWBgCd4U3yVlQwW4.mp3"
                onPlay={e => console.log("on Play")}
            />
        </div>
    )
}

export default MusicPlayer