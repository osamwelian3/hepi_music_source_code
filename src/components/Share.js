import * as React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import { BiLogOut, BiSupport, BiQuestionMark } from 'react-icons/bi'
import {
    FacebookShareButton,
    TelegramShareButton,
    TwitterShareButton,
    WhatsappShareButton,
} from "react-share";

import {
    FacebookIcon,
    TelegramIcon,
    TwitterIcon,
    WhatsappIcon,
} from "react-share";
const ShareDrawer = ({ isOpen, setIsOpen, id, song, album }) => {
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });
    const options = [
        'Log out of my account',
        'What is Hepi',
        'Support',
    ];
    const RenderIcon = ({ i }) => {
        switch (i) {
            case 0:
                return (
                    <BiLogOut style={{ fontSize: '1.8em', color: '#f3b007' }} />
                );
            case 2:
                return (
                    <BiSupport style={{ fontSize: '1.8em', color: '#f3b007' }} />
                );
            case 1:
                return (
                    <BiQuestionMark style={{ fontSize: '1.8em', color: '#f3b007' }} />
                )
            default:
                return
        }
        return <></>
    }
    React.useEffect(() => {
        console.log(isOpen);
        if (isOpen) {
            toggleDrawer('bottom', true)
            console.log(isOpen, 'came 1');
        } else {
            toggleDrawer('bottom', false)
            console.log(isOpen, 'came 2');
        }
    }, [isOpen])

    const toggleDrawer = (anchor, open) => (event) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        if (!open) { setIsOpen(false) }
        setState({ ...state, [anchor]: open });
    };

    const isAndroid = /Android/i.test(navigator.userAgent);
    const nativeShare = async () => {
        if (isAndroid){
            if (navigator.share){
                navigator.share({
                    url: `https://hepimusic.com/song?m=${id}`,
                })
                .then(() => {
                    alert('Thank you for sharing')
                })
                .catch((error) => {
                    alert('error: '+error)
                })
            }
        }
    }
    const list = (anchor) => (
        <Box
            sx={{ width: 'auto', backgroundColor: '#151515', borderTopLeftRadius: '25px', borderTopRightRadius: '25px' }}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                <div style={{ display: 'flex', justifyContent: 'space-evenly', padding: '10px 30px' }}>
                    {/* <FacebookShareButton quote={''} url={`https://hepimusic.com/song?m=${id}`} hashtag="hepimusic" ><FacebookIcon size={50} round={true} style={{ margin: '5px' }} /></FacebookShareButton> */}
                    <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://hepimusic.com/song?m=${id}`)}&amp;src=sdkpreparse`, '_blank')}><FacebookIcon size={50} round={true} style={{ margin: '5px' }} /></button>
                    <button style={{color: 'white'}} onClick={() => window.open(`https://twitter.com/intent/tweet?hashtags=`+encodeURIComponent(['HepiMusic', song.name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '')].join(','))+`&url=`+encodeURIComponent(`https://hepimusic.com/song?m=${id}`), '_blank')}><TwitterIcon size={50} round={true} style={{ margin: '5px' }} /></button>
                    {/* {isAndroid ? 
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://hepimusic.com/song?m=${id}`)}&hashtags=${encodeURIComponent(['hepimusic'].join(','))}`}><TwitterIcon size={50} round={true} style={{ margin: '5px' }} /></a> 
                    :
                    <TwitterShareButton title={''} url={`https://hepimusic.com/song?m=${id}`} hashtags={['hepimusic']} ><TwitterIcon size={50} round={true} style={{ margin: '5px' }} /></TwitterShareButton> 
                    } */}
                    <WhatsappShareButton title={''} url={`https://hepimusic.com/song?m=${id}`}><WhatsappIcon size={50} round={true} style={{ margin: '5px' }} /></WhatsappShareButton>
                </div>
            </List>
        </Box>
    );

    const listAlbums = (anchor) => (
        <Box
            sx={{ width: 'auto', backgroundColor: '#151515', borderTopLeftRadius: '25px', borderTopRightRadius: '25px' }}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                <div style={{ display: 'flex', justifyContent: 'space-evenly', padding: '10px 30px' }}>
                    {/* <FacebookShareButton quote={''} url={`https://hepimusic.com/song?m=${id}`} hashtag="hepimusic" ><FacebookIcon size={50} round={true} style={{ margin: '5px' }} /></FacebookShareButton> */}
                    <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://hepimusic.com/albums?a=${id}`)}&amp;src=sdkpreparse`, '_blank')}><FacebookIcon size={50} round={true} style={{ margin: '5px' }} /></button>
                    <button style={{color: 'white'}} onClick={() => window.open(`https://twitter.com/intent/tweet?hashtags=`+encodeURIComponent(['HepiMusic', album.name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '')].join(','))+`&url=`+encodeURIComponent(`https://hepimusic.com/albums?a=${id}`), '_blank')}><TwitterIcon size={50} round={true} style={{ margin: '5px' }} /></button>
                    {/* {isAndroid ? 
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://hepimusic.com/song?m=${id}`)}&hashtags=${encodeURIComponent(['hepimusic'].join(','))}`}><TwitterIcon size={50} round={true} style={{ margin: '5px' }} /></a> 
                    :
                    <TwitterShareButton title={''} url={`https://hepimusic.com/song?m=${id}`} hashtags={['hepimusic']} ><TwitterIcon size={50} round={true} style={{ margin: '5px' }} /></TwitterShareButton> 
                    } */}
                    <WhatsappShareButton title={''} url={`https://hepimusic.com/albums?a=${id}`}><WhatsappIcon size={50} round={true} style={{ margin: '5px' }} /></WhatsappShareButton>
                </div>
            </List>
        </Box>
    );

    if (song) return (
        <SwipeableDrawer
            anchor={'bottom'}
            open={isOpen}
            onClose={toggleDrawer('bottom', false)}
            onOpen={toggleDrawer('bottom', true)}
            PaperProps={{ elevation: 0, style: { backgroundColor: "transparent" } }}
        >
            {list('bottom')}
        </SwipeableDrawer>
    );

    if (album) return (
        <SwipeableDrawer
            anchor={'bottom'}
            open={isOpen}
            onClose={toggleDrawer('bottom', false)}
            onOpen={toggleDrawer('bottom', true)}
            PaperProps={{ elevation: 0, style: { backgroundColor: "transparent" } }}
        >
            {listAlbums('bottom')}
        </SwipeableDrawer>
    );

    return (
        <SwipeableDrawer
            anchor={'bottom'}
            open={isOpen}
            onClose={toggleDrawer('bottom', false)}
            onOpen={toggleDrawer('bottom', true)}
            PaperProps={{ elevation: 0, style: { backgroundColor: "transparent" } }}
        >
            {list('bottom')}
        </SwipeableDrawer>
    );
}
export default ShareDrawer