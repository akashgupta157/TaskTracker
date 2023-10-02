import axios from "axios";
import { useEffect, useState } from "react";
import { url } from "./url";
import { FiMenu } from 'react-icons/fi'
import { Menu, MenuItem, Modal, Box, TextField, Avatar } from "@mui/material";
import GoogleButton from 'react-google-button'
import { useSelector, useDispatch } from 'react-redux'
import { login } from "../redux/auth/action";
import { toast } from 'react-toastify';
import { BsChevronDown } from 'react-icons/bs'
import { useNavigate } from "react-router-dom";
export default function Navbar() {
    const nav = useNavigate()
    const state = useSelector((store: any) => store.authReducer)
    const dispatch = useDispatch()
    const googleAuth = () => {
        window.open(
            `${url}/auth/google/callback`,
            "_self"
        );
    };
    const getUser = async () => {
        try {
            const { data } = await axios.get(`${url}/auth/login/success`, { withCredentials: true });
            dispatch(login({ ...data.user, token: data.token }))
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        getUser();
    }, []);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const [openLogin, setOpenLogin] = useState(false);
    const handleOpenLogin = () => setOpenLogin(true);
    const handleCloseLogin = () => setOpenLogin(false);
    const [openSignup, setOpenSignup] = useState(false);
    const handleOpenSignup = () => setOpenSignup(true);
    const handleCloseSignup = () => setOpenSignup(false);
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 350,
        bgcolor: 'black',
        border: '2px solid white',
        boxShadow: 1,
        py: 2,
        px: 3,
        borderRadius: 2
    };
    const [formData, setFormData] = useState({
        name: "", email: "", password: "",
    });
    const handleLogin = async (e: any) => {
        e.preventDefault()
        const { data } = await axios.post(`${url}/auth/login`, { email: formData.email, password: formData.password })
        if (data.auth) {
            toast.success(`${data.message}`, {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            dispatch(login({ ...data.user, token: data.token }))
            handleCloseLogin()
            setFormData({
                name: "", email: "", password: "",
            })
        } else {
            toast.error(`${data.message}`, {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    }
    const handleSignup = async (e: any) => {
        e.preventDefault()
        const { data } = await axios.post(`${url}/auth/register`, formData)
        if (data.auth) {
            toast.success(`${data.message}`, {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            handleCloseSignup()
            handleOpenLogin()
            setFormData({
                name: "", email: "", password: "",
            })
        } else {
            toast.error(`${data.message}`, {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    }
    return (
        <>
            <div className="h-[10vh] bg-[#1c2025] px-5 flex items-center justify-between md:px-14">
                <h1 onClick={() => nav('/')} className="flex font-extrabold text-2xl text-white md:text-3xl cursor-pointer">Task<p className="text-yellow-400">Tracker</p></h1>
                {state.isAuthenticated ?
                    <div
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        className="flex items-center gap-2 cursor-pointer">{state.user.profilePicture !== null ?
                            <Avatar src={state.user.profilePicture} sx={{ width: 30, height: 30 }} /> : <Avatar sx={{ width: 30, height: 30, bgcolor: "red" }}>{state.user.name[0]}</Avatar>}
                        <p className="hidden md:block text-white">{state.user.name}</p>
                        <button onClick={handleClick} className="text-white"><BsChevronDown /></button>
                    </div> :
                    <div className="hidden md:flex">
                        <button className="text-yellow-400 px-5 py-1.5 font-bold" onClick={() => {
                            handleOpenLogin()
                            setFormData({
                                name: "", email: "", password: "",
                            })
                        }}>Log In</button>
                        <button className="bg-yellow-400 px-5 py-1.5 rounded font-bold" onClick={() => {
                            handleOpenSignup()
                            setFormData({
                                name: "", email: "", password: "",
                            })
                        }}>Sign up</button>
                    </div>}
                {
                    state.isAuthenticated ||
                    <FiMenu className="font-extrabold text-2xl text-white md:hidden" aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick} />
                }
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {
                        state.isAuthenticated ?
                            <>
                                <MenuItem onClick={() => {
                                    handleClose()
                                }}>Profile</MenuItem>
                                <MenuItem onClick={() => {
                                    handleClose()
                                }}>Logout</MenuItem>
                            </>
                            :
                            <>
                                <MenuItem onClick={() => {
                                    handleClose()
                                    handleOpenLogin()
                                }}>Log In</MenuItem>
                                <MenuItem onClick={() => {
                                    handleClose()
                                    handleOpenSignup()
                                }}>Sign up</MenuItem>
                            </>
                    }
                </Menu>
            </div>
            <Modal
                open={openLogin}
                onClose={handleCloseLogin}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <h1 className="text-yellow-400 text-center text-3xl font-extrabold mb-3">Log In Form</h1>
                    <form action="" className="flex flex-col gap-4" onSubmit={handleLogin}>
                        <TextField id="outlined-basic" label="Email" type="email" variant="outlined" fullWidth required
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            InputLabelProps={{
                                style: { color: '#fff' },
                            }} sx={{ input: { color: 'white' } }} />
                        <TextField id="outlined-basic" label="Password" type="password" variant="outlined" fullWidth required
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            InputLabelProps={{
                                style: { color: '#fff' },
                            }} sx={{ input: { color: 'white' } }} />
                        <button className="bg-yellow-400 px-5 py-1.5 rounded font-bold" type="submit">Log In</button>
                    </form>
                    <div className="flex text-white justify-center items-center gap-2 mt-2 mb-2">
                        <hr className="border-1 w-32 border-white" />or<hr className="border-1 w-32 border-white" />
                    </div>
                    <GoogleButton
                        className="m-auto"
                        label='Login with Google'
                        onClick={googleAuth}
                    />
                </Box>
            </Modal>
            <Modal
                open={openSignup}
                onClose={handleCloseSignup}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <h1 className="text-yellow-400 text-center text-3xl font-extrabold mb-3">Sign up Form</h1>
                    <form action="" className="flex flex-col gap-4" onSubmit={handleSignup}>
                        <TextField id="outlined-basic" label="Name" type="text" variant="outlined" fullWidth required
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            InputLabelProps={{
                                style: { color: '#fff' },
                            }} sx={{ input: { color: 'white' } }} />
                        <TextField id="outlined-basic" label="Email" type="email" variant="outlined" fullWidth required
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            InputLabelProps={{
                                style: { color: '#fff' },
                            }} sx={{ input: { color: 'white' } }} />
                        <TextField id="outlined-basic" label="Password" type="password" variant="outlined" fullWidth required
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            InputLabelProps={{
                                style: { color: '#fff' },
                            }} sx={{ input: { color: 'white' } }} />
                        <button className="bg-yellow-400 px-5 py-1.5 rounded font-bold" type="submit">Sign up</button>
                    </form>
                    <div className="flex text-white justify-center items-center gap-2 mt-2 mb-2">
                        <hr className="border-1 w-32 border-white" />or<hr className="border-1 w-32 border-white" />
                    </div>
                    <GoogleButton
                        className="m-auto"
                        label='Signup with Google'
                        onClick={googleAuth}
                    />
                </Box>
            </Modal>
        </>
    )
}
