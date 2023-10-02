import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux"
import { url } from "../components/url";
import { AiOutlinePlus } from 'react-icons/ai'
import { MdSubtitles } from 'react-icons/md'
import { BsJustifyLeft } from 'react-icons/bs'
import { Box, Modal, TextField } from "@mui/material";
import ReactQuill from 'react-quill';
import EditorToolbar, { modules, formats } from "../components/QuillToolbar";
import "react-quill/dist/quill.snow.css";
import 'quill/dist/quill.snow.css';
export default function Board() {
    const state = useSelector((store: any) => store.authReducer)
    const config = {
        headers: { Authorization: `Bearer ${state.user.token}` }
    };
    const [data, setData] = useState([]);
    const fetchData = async () => {
        const { data } = await axios.get(`${url}/board`, config)
        setData(data)
    }
    useEffect(() => {
        fetchData()
    }, []);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: '#323940',
        boxShadow: 24,
        px: 3,
        py: 2,
        color: '#b6c2cf',
        borderRadius: 4,
        '@media (max-width:425px)': {
            width: '95%',
        },
    };
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        priority: '',
        description: "",
        dueDate: '',
        checklist: '',
        attachment: '',
        user: state.user._id
    });
    const [isInputVisible, setInputVisible] = useState(false);
    const inputRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        function handleClickOutside(event: React.MouseEvent) {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setInputVisible(false);
            }
        }
        if (isInputVisible) {
            document.addEventListener('mousedown', handleClickOutside as any);
        } else {
            document.removeEventListener('mousedown', handleClickOutside as any);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside as any);
        };
    }, [isInputVisible])
    function handleTextClick() {
        setInputVisible(true);
    }
    return (
        <>
            <div className="min-h-[90vh] bg-[#1e3a8a] p-5">
                <div className="bg-black text-[#b6c2cf] px-5 py-3 rounded-lg flex flex-col md:w-[25%]">
                    <h1 className="text-base font-semibold p-1">To do</h1>
                    <div className="min-h-[3vh]"></div>
                    <button className="flex items-center text-base font-semibold gap-2 cursor-pointer hover:bg-[#3f3f46] p-1 rounded-lg" onClick={() => {
                        handleOpen()
                        setFormData({ ...formData, category: "To do" })
                    }}><AiOutlinePlus />Add a card</button>
                </div>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                    <div className="md:flex md:gap-10">
                        <div className="md:w-[70%]">
                            <div className="flex items-center gap-3 ">
                                <MdSubtitles style={{ fontSize: "22px" }} />
                                {
                                    isInputVisible ?
                                        <TextField
                                            inputRef={inputRef}
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            onBlur={() => setInputVisible(false)}
                                            autoFocus
                                            fullWidth
                                            size="small"
                                            sx={{ input: { color: 'white', fontSize: "20px" } }}
                                        />
                                        :
                                        <h1 className="text-xl w-full font-semibold" onClick={handleTextClick} ref={inputRef}>{formData.title || 'Untitled'}</h1>
                                }
                            </div>
                            <p className="text-sm">in list <b>{formData.category}</b></p>
                            <h1 className="text-base font-bold flex gap-3 items-center mt-7 mb-3"><BsJustifyLeft style={{ fontSize: "18px" }} />Description</h1>
                            <div className="text-editor">
                                <EditorToolbar />
                                <ReactQuill
                                    theme="snow"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e })}
                                    modules={modules}
                                    formats={formats}
                                />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold flex gap-2 items-center">Add to card</h1>

                        </div>
                    </div>
                </Box>
            </Modal>
        </>
    )
}
