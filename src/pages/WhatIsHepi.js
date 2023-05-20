import React, { useEffect } from 'react'

function WhatIsHepi({ setIsLoginVisible }) {
    useEffect(() => {
        setIsLoginVisible(true)

        return () => {
            setIsLoginVisible(false)
        }
    }, [])
    return (
        <div className='page_container' style={{ padding: '10px 20px' }}>
            Hepi Music is an audio streaming platform that can be described as:
            1. Open platform that allows access of audio files by anybody on the internet
            <br></br>
            <br></br>
            2. The platform gives listeners opportunity to give genuine feedback on any audio file compared to when artists share audio files among their close circle of friends who rarely give genuine feedback.
            <br></br>
            <br></br>
            3. The platform gives artists an opportunity to measure themselves against other comparable artists in terms of popularity and prowess in their delivery of songs.
            <br></br>
            <br></br>
            4. HEPIMUSIC platform exposes artists to each other and gives rise to an opportunity for them to do collaborations either due to matching styles of delivery or compatibility of their sound.
            <br></br>
            <br></br>
            5. We at HEPIMUSIC plan to promote Kenyan music especially the audio segment; we plan to do this by promoting the platform to create awareness whereby end users will simply log into the platform and stream content. This takes away the Hussle of artists either shooting videos to effectively market their songs.
            <br></br>
            <br></br>
            6. We have a plan in place on promoting album launches for artists which would go a long way in aiding artists in their craft as none exists currently in the market.
            <br></br>
            <br></br>
        </div>
    )
}

export default WhatIsHepi