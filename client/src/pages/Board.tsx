import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux"
import { url } from "../components/url";
import { AiOutlinePlus } from 'react-icons/ai'
import { MdSubtitles } from 'react-icons/md'
import { BsJustifyLeft } from 'react-icons/bs'
import { BiPencil } from 'react-icons/bi'
import { GiAlarmClock } from 'react-icons/gi'
import { IoAttach } from 'react-icons/io5'
import { Box, Modal, TextField } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
export default function Board() {
    const state = useSelector((store: any) => store.authReducer)
    const config = {
        headers: { Authorization: `Bearer ${state.user.token}` }
    };
    const [list, setList] = useState<Array<any>>([]);
    const fetchData = async () => {
        const { data } = await axios.get(`${url}/board`, config)
        setList(data.boards)
    }
    const toDoTasks = list.filter(board => board.category == "To do")
    const doingTasks = list.filter(board => board.category == "Doing")
    const doneTasks = list.filter(board => board.category == "Done")
    useEffect(() => {
        fetchData()
    }, [state]);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700,
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
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike", "blockquote", 'code-block'],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
        ],
    };
    const formats = ["header", "bold", "italic", "underline", "strike", "blockquote", 'code-block', "list", "bullet", "link", "image"];
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const { data } = await axios.post(`${url}/board`, formData, config)
        setList([...list, data.board]);
        setFormData({
            title: '',
            category: '',
            priority: '',
            description: "",
            dueDate: '',
            checklist: '',
            attachment: '',
            user: state.user._id
        })
        handleClose()
    }
    return (
        <>
            <div className="min-h-[90vh] bg-[#1e3a8a] p-5 flex flex-col gap-5 md:flex-row">
                <div className="bg-black text-[#b6c2cf] px-5 py-3 rounded-lg flex flex-col md:w-[25%] h-max">
                    <h1 className="text-base font-semibold p-1">To do</h1>
                    <div className="min-h-[2vh] flex flex-col gap-2">
                        {
                            toDoTasks.map((e) => (
                                <div key={e._id} className="task hover:bg-[#363b3f] p-2 rounded bg-[#25282a] cursor-pointer" onClick={() => {
                                    setFormData(e)
                                    handleOpen()
                                }}>
                                    {e.priority && <p className={`w-8 my-1 h-2 rounded-br-3xl ${e.priority == "High" ? 'bg-red-700' : e.priority == "Mid" ? 'bg-yellow-600' : e.priority == "Low" ? 'bg-green-600' : null}`}></p>}
                                    <h1 className="flex items-center justify-between">{e.title} <BiPencil className="pencil-icon" /></h1>
                                    <div className="flex gap-1">
                                        {e.description && <BsJustifyLeft className='my-1' />}
                                        {e.dueDate && <GiAlarmClock className='my-1' />}
                                        {e.attachment && <IoAttach className='my-1' />}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <button className="flex items-center text-base font-semibold gap-2 cursor-pointer hover:bg-[#3f3f46] p-1 rounded-lg mt-2" onClick={() => {
                        handleOpen()
                        setFormData({
                            title: '',
                            category: 'To do',
                            priority: '',
                            description: "",
                            dueDate: '',
                            checklist: '',
                            attachment: '',
                            user: state.user._id
                        })
                    }}><AiOutlinePlus />Add a card</button>
                </div>
                <div className="bg-black text-[#b6c2cf] px-5 py-3 rounded-lg flex flex-col md:w-[25%] h-max">
                    <h1 className="text-base font-semibold p-1">Doing</h1>
                    <div className="min-h-[2vh] flex flex-col gap-2">
                        {
                            doingTasks.map((e) => (
                                <div key={e._id} className="task hover:bg-[#363b3f] p-2 rounded bg-[#25282a] cursor-pointer" onClick={() => {
                                    setFormData(e)
                                    handleOpen()
                                }}>
                                    {e.priority && <p className={`w-8 my-1 h-2 rounded-br-3xl ${e.priority == "High" ? 'bg-red-700' : e.priority == "Mid" ? 'bg-yellow-600' : e.priority == "Low" ? 'bg-green-600' : null}`}></p>}
                                    <h1 className="flex items-center justify-between">{e.title} <BiPencil className="pencil-icon" /></h1>
                                    <div className="flex gap-1">
                                        {e.description && <BsJustifyLeft className='my-1' />}
                                        {e.dueDate && <GiAlarmClock className='my-1' />}
                                        {e.attachment && <IoAttach className='my-1' />}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <button className="flex items-center text-base font-semibold gap-2 cursor-pointer hover:bg-[#3f3f46] p-1 rounded-lg mt-2" onClick={() => {
                        handleOpen()
                        setFormData({
                            title: '',
                            category: 'Doing',
                            priority: '',
                            description: "",
                            dueDate: '',
                            checklist: '',
                            attachment: '',
                            user: state.user._id
                        })
                    }}><AiOutlinePlus />Add a card</button>
                </div>
                <div className="bg-black text-[#b6c2cf] px-5 py-3 rounded-lg flex flex-col md:w-[25%] h-max">
                    <h1 className="text-base font-semibold p-1">Done</h1>
                    <div className="min-h-[2vh] flex flex-col gap-2">
                        {
                            doneTasks.map((e) => (
                                <div key={e._id} className="task hover:bg-[#363b3f] p-2 rounded bg-[#25282a] cursor-pointer" onClick={() => {
                                    setFormData(e)
                                    handleOpen()
                                }}>
                                    {e.priority && <p className={`w-8 my-1 h-2 rounded-br-3xl ${e.priority == "High" ? 'bg-red-700' : e.priority == "Mid" ? 'bg-yellow-600' : e.priority == "Low" ? 'bg-green-600' : null}`}></p>}
                                    <h1 className="flex items-center justify-between">{e.title} <BiPencil className="pencil-icon" /></h1>
                                    <div className="flex gap-1">
                                        {e.description && <BsJustifyLeft className='my-1' />}
                                        {e.dueDate && <GiAlarmClock className='my-1' />}
                                        {e.attachment && <IoAttach className='my-1' />}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <button className="flex items-center text-base font-semibold gap-2 cursor-pointer hover:bg-[#3f3f46] p-1 rounded-lg mt-2" onClick={() => {
                        handleOpen()
                        setFormData({
                            title: '',
                            category: 'Done',
                            priority: '',
                            description: "",
                            dueDate: '',
                            checklist: '',
                            attachment: '',
                            user: state.user._id
                        })
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
                                            autoComplete="off"
                                            sx={{ input: { color: 'white', fontSize: "20px" } }}
                                        />
                                        :
                                        <h1 className="text-xl w-full font-semibold" onClick={handleTextClick} ref={inputRef}>{formData.title || 'Untitled'}</h1>
                                }
                            </div>
                            <p className="text-sm">in list <b>{formData.category}</b></p>
                            <h1 className="text-base font-bold flex gap-3 items-center mt-7 mb-3"><BsJustifyLeft style={{ fontSize: "18px" }} />Description</h1>
                            <ReactQuill
                                className="my-4 dark:border-secondary-40 border-gray-500 rounded-md text-gray-800 dark:text-white"
                                placeholder="Write something here..."
                                modules={modules}
                                formats={formats}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e })}
                            />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold flex gap-2 items-center">Add to card</h1>
                        </div>
                    </div>
                    <button className="bg-[#579DFF] rounded text-gray-900 font-semibold px-2.5 py-1" onClick={handleSubmit}>Save</button>
                </Box>
            </Modal>
        </>
    )
}
