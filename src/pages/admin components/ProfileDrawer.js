import * as React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import { BsChevronRight } from 'react-icons/bs';
import { BiLogOut, BiWorld, BiSupport, BiQuestionMark, BiUserX, BiUser } from 'react-icons/bi'
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/fire';
import { Link } from 'react-router-dom';
import { Amplify, Storage, Auth } from 'aws-amplify';
import awsconfig from '../../aws-exports';
Amplify.configure(awsconfig)



const ProfileDrawer = ({ isOpen, setIsOpen, userInfo }) => {
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
        userInfo?.attributes?.sub === "91d34d2a-3001-7095-546c-6df22cb9d8a2" || userInfo?.attributes?.sub === "d153bd3a-9041-70a2-b70d-470c066a714f" || userInfo?.attributes?.sub === "11537dfa-20c1-70df-f960-7f647b48dc61" ? 'Admin Panel' : '',
    ];
    async function authSignOut() {
        try {
          await Auth.signOut();
        } catch (error) {
          console.log('error signing out: ', error);
        }
      }
    async function logOut() {
        await authSignOut();
        return signOut(auth)
    }
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
                );
            case 3:
                return (
                    <BiUser style={{ fontSize: '1.8em', color: '#f3b007' }} />
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

    const list = (anchor) => (
        <Box
            sx={{ width: 'auto', backgroundColor: '#151515', borderTopLeftRadius: '25px', borderTopRightRadius: '25px' }}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                {options.map((text, index) => (
                    <ListItem key={text} onClick={async () => {
                        index === 0 && await logOut()
                    }}>
                        {
                            index === 1 &&
                            <Link to={'/aboutus'} style={{ width: '-webkit-fill-available', textDecoration: 'none'  }}>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <RenderIcon i={index} />
                                    </ListItemIcon>
                                    <ListItemText primary={text} sx={{ color: '#fff' }} />
                                    <BsChevronRight style={{ color: '#ccc' }} />
                                </ListItemButton>
                            </Link>
                        }
                        {
                            index !== 1 && index !== 3 &&
                            <ListItemButton>
                                <ListItemIcon>
                                    <RenderIcon i={index} />
                                </ListItemIcon>
                                <ListItemText primary={text} sx={{ color: '#fff' }} />
                                <BsChevronRight style={{ color: '#ccc' }} />
                            </ListItemButton>
                        }
                        {
                            index === 3 && text === 'Admin Panel' &&
                            <Link to={'/admin'} style={{ width: '-webkit-fill-available', textDecoration: 'none' }}>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <RenderIcon i={index} />
                                    </ListItemIcon>
                                    <ListItemText primary={text} sx={{ color: '#fff' }} />
                                    <BsChevronRight style={{ color: '#ccc' }} />
                                </ListItemButton>
                            </Link>
                        }
                    </ListItem>
                ))}
            </List>
        </Box>
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
export default ProfileDrawer