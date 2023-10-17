import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { url } from "../components/url";
import { AiOutlinePlus, AiOutlineCalendar, AiOutlineCheckSquare, AiOutlineLoading } from "react-icons/ai";
import { MdSubtitles, MdOutlineDeleteOutline } from "react-icons/md";
import { BsJustifyLeft, BsArrowDownUp, BsArrowRight, BsCheckSquareFill } from "react-icons/bs";
import { BiPencil } from "react-icons/bi";
import { IoAttach } from "react-icons/io5";
import { Box, Checkbox, Menu, MenuItem, Modal, TextField } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { pink } from "@mui/material/colors";
import { toast } from "react-toastify";
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd'
interface FormData {
    updatedAt: string | number | Date;
    _id: string;
    title: string;
    category: string;
    priority: string;
    description: string;
    dueDate: string;
    checklist: { details: string; checked: boolean }[];
    attachment: string;
    user: string;
}
export default function Board() {
    const [loading, setLoading] = useState(false);
    const state = useSelector((store: any) => store.authReducer);
    const config = {
        headers: { Authorization: `Bearer ${state.user.token}` },
    };
    const [list, setList] = useState<Array<any>>([]);
    const fetchData = async () => {
        setLoading(true)
        const { data } = await axios.get(`${url}/board`, config);
        setList(data.boards);
        setLoading(false)
    };
    const [task, setTask] = useState<{
        todoTasks: Array<any>;
        doingTasks: Array<any>;
        doneTasks: Array<any>;
    }>({
        todoTasks: [],
        doingTasks: [],
        doneTasks: [],
    });
    useEffect(() => {
        setTask({
            ...task,
            todoTasks: list.filter((board) => board.category == "To do"),
            doingTasks: list.filter((board) => board.category == "Doing"),
            doneTasks: list.filter((board) => board.category == "Done"),
        });
    }, [list]);
    useEffect(() => {
        fetchData();
    }, []);
    // useEffect(() => {
    //     fetchData();
    // }, [task]);
    const [openAdd, setOpenAdd] = useState(false);
    const handleOpenAdd = () => setOpenAdd(true);
    const handleCloseAdd = () => setOpenAdd(false);
    const [openEdit, setOpenEdit] = useState(false);
    const handleOpenEdit = () => setOpenEdit(true);
    const handleCloseEdit = () => setOpenEdit(false);
    const style = {
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700,
        bgcolor: "#323940",
        boxShadow: 24,
        px: 3,
        py: 2,
        color: "#b6c2cf",
        overflowX: 'hidden',
        overflowY: 'scroll',
        maxHeight: '95%',
        "@media (max-width:425px)": {
            width: "95%",
        },
        "@media (max-width:768px)": {
            width: "95%",
        },
    };
    const [formData, setFormData] = useState<FormData>({
        _id: "",
        title: "",
        category: "",
        priority: "",
        description: "",
        dueDate: "",
        checklist: [],
        attachment: "",
        user: state.user._id,
        updatedAt: ''
    });
    const [isInputVisible, setInputVisible] = useState(false);
    const inputRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        function handleClickOutside(event: React.MouseEvent) {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setInputVisible(false);
            }
        }
        if (isInputVisible) {
            document.addEventListener("mousedown", handleClickOutside as any);
        } else {
            document.removeEventListener("mousedown", handleClickOutside as any);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside as any);
        };
    }, [isInputVisible]);
    function handleTextClick() {
        setInputVisible(true);
    }
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
        ],
    };
    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "code-block",
        "list",
        "bullet",
        "link",
        "image",
    ];
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title) {
            const { data } = await axios.post(`${url}/board`, formData, config);
            setList([...list, data.board]);
            setFormData({
                _id: "",
                title: "",
                category: "",
                priority: "",
                description: "",
                dueDate: "",
                checklist: [],
                attachment: "",
                user: state.user._id, updatedAt: ''
            });
            handleCloseAdd();
            setIsChecklistOpen(false)
        } else {
            toast.error(`Please Enter title`, {
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
    };
    const handleSubmitUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title) {
            const { data } = await axios.patch(`${url}/board/${formData._id}`, formData, config);
            const updatedTask = {
                todoTasks: task.todoTasks.map((item) =>
                    item._id === formData._id ? formData : item
                ),
                doingTasks: task.doingTasks.map((item) =>
                    item._id === formData._id ? formData : item
                ),
                doneTasks: task.doneTasks.map((item) =>
                    item._id === formData._id ? formData : item
                ),
            };
            console.log(data.board)
            let t1 = updatedTask.todoTasks.filter((board) => board.category == "To do")
            let t2 = updatedTask.doingTasks.filter((board) => board.category == "Doing")
            let t3 = updatedTask.doneTasks.filter((board) => board.category == "Done")
            setTask({ todoTasks: t1, doingTasks: t2, doneTasks: t3 })
            setFormData({
                _id: "",
                title: "",
                category: "",
                priority: "",
                description: "",
                dueDate: "",
                checklist: [],
                attachment: "",
                user: state.user._id, updatedAt: ''
            });
            handleCloseEdit();
        } else {
            toast.error(`Please Enter title`, {
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
    const handleSubmitDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        await axios.delete(`${url}/board/${formData._id}`, config);
        const updatedTask = {
            todoTasks: task.todoTasks.filter((board) => board._id !== formData._id),
            doingTasks: task.doingTasks.filter((board) => board._id !== formData._id),
            doneTasks: task.doneTasks.filter((board) => board._id !== formData._id),
        };
        setTask(updatedTask);
        setFormData({
            _id: "",
            title: "",
            category: "",
            priority: "",
            description: "",
            dueDate: "",
            checklist: [],
            attachment: "",
            user: state.user._id, updatedAt: ''
        });
        handleCloseEdit();
    }
    const [anchorElPriority, setAnchorElPriority] = useState<null | HTMLElement>(null);
    const handleClickPriority = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorElPriority(event.currentTarget);
    };
    const handleClosePriority = () => {
        setAnchorElPriority(null);
    };
    const [anchorElCalender, setAnchorElCalender] = useState<null | HTMLElement>(null);
    const handleClickCalender = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorElCalender(event.currentTarget);
    };
    const handleCloseCalender = () => {
        setAnchorElCalender(null);
    };
    const [anchorElMove, setAnchorElMove] = useState<null | HTMLElement>(null);
    const handleClickMove = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorElMove(event.currentTarget);
    };
    const handleCloseMove = () => {
        setAnchorElMove(null);
    };
    const handleDueDateChange = (value: Date) => {
        setFormData({
            ...formData,
            dueDate: value instanceof Date ? value.toString() : value
        });
    };
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const toggleChecklist = () => {
        setIsChecklistOpen(!isChecklistOpen);
    };
    const addChecklistItem = () => {
        setFormData({
            ...formData,
            checklist: [...formData.checklist, { details: "", checked: false }],
        });
    };
    const updateChecklistItem = (index: number, value: string) => {
        const updatedChecklist = [...formData.checklist];
        updatedChecklist[index].details = value;
        setFormData({ ...formData, checklist: updatedChecklist });
    };
    const toggleChecklistItem = (index: number) => {
        const updatedChecklist = [...formData.checklist];
        updatedChecklist[index].checked = !updatedChecklist[index].checked;
        setFormData({ ...formData, checklist: updatedChecklist });
    };
    const onDragEnd = async (result: DropResult) => {
        const { draggableId, destination, source } = result
        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return
        let t
        let add, todo = task.todoTasks, doing = task.doingTasks, done = task.doneTasks
        if (source.droppableId === 'To do') {
            add = todo[source.index]
            add = { ...add, category: destination.droppableId }
            todo.splice(source.index, 1)
            t = todo.filter((board) => board.category == "To do")
            setTask({ ...task, todoTasks: t })
            axios.patch(`${url}/board/${draggableId}`, add, config);
        } else if (source.droppableId === 'Doing') {
            add = doing[source.index]
            add = { ...add, category: destination.droppableId }
            doing.splice(source.index, 1)
            t = doing.filter((board) => board.category == "Doing")
            setTask({ ...task, doingTasks: t })
            axios.patch(`${url}/board/${draggableId}`, add, config);
        } else {
            add = done[source.index]
            add = { ...add, category: destination.droppableId }
            done.splice(source.index, 1)
            t = done.filter((board) => board.category == "Done")
            setTask({ ...task, doneTasks: t })
            axios.patch(`${url}/board/${draggableId}`, add, config);
        }
        if (destination.droppableId === "To do") {
            todo.splice(destination.index, 0, add);
            setTask({ ...task, todoTasks: todo })
        } else if (destination.droppableId === 'Doing') {
            doing.splice(destination.index, 0, add);
            setTask({ ...task, doingTasks: doing })
        } else {
            done.splice(destination.index, 0, add);
            setTask({ ...task, doneTasks: done })
        }
    }
    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="min-h-[90vh] bg-[#1e3a8a] p-5 flex flex-col gap-5 md:flex-row">
                    <div className="bg-black text-[#b6c2cf] px-5 py-3 rounded-lg flex flex-col md:w-[25%] h-max">
                        <h1 className="text-base font-semibold p-1">To do</h1>
                        {
                            loading ?
                                <div className="px-5 py-1.5 flex justify-center transform transition-transform duration-1000 ease-in-out hover:rotate-360">
                                    <AiOutlineLoading className='text-2xl animate-spin' />
                                </div> :
                                <Droppable droppableId="To do">
                                    {
                                        (provided) => (
                                            <div className="min-h-[2vh] flex flex-col gap-2" ref={provided.innerRef} {...provided.droppableProps}>
                                                {task.todoTasks.map((e, i) => (
                                                    <Draggable draggableId={e._id.toString()} index={i}>
                                                        {
                                                            (provided) => (
                                                                <div
                                                                    key={e._id}
                                                                    className="task hover:bg-[#363b3f] p-2 rounded bg-[#25282a] cursor-pointer"
                                                                    onClick={() => {
                                                                        setFormData(e);
                                                                        handleOpenEdit()
                                                                    }}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    ref={provided.innerRef}
                                                                >
                                                                    <div className="flex gap-2 items-center">
                                                                        {e.priority && (
                                                                            <p
                                                                                className={`w-8 my-1 h-2 rounded-br-3xl ${e.priority == "High"
                                                                                    ? "bg-red-700"
                                                                                    : e.priority == "Mid"
                                                                                        ? "bg-yellow-600"
                                                                                        : e.priority == "Low"
                                                                                            ? "bg-green-600"
                                                                                            : null
                                                                                    }`}
                                                                            ></p>
                                                                        )}
                                                                        {e.description && <BsJustifyLeft />}
                                                                        {e.dueDate && <AiOutlineCalendar />}
                                                                        {e.checklist.length > 0 && <BsCheckSquareFill className="text-sm" />}
                                                                        {e.attachment && <IoAttach />}
                                                                    </div>
                                                                    <h1 className="flex items-center justify-between mt-1">
                                                                        {e.title} <BiPencil className="pencil-icon" />
                                                                    </h1>
                                                                </div>
                                                            )
                                                        }

                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )
                                    }

                                </Droppable>
                        }
                        <button
                            className="flex items-center text-base font-semibold gap-2 cursor-pointer hover:bg-[#3f3f46] p-1 rounded-lg mt-2"
                            onClick={() => {
                                handleOpenAdd();
                                setFormData({
                                    _id: "",
                                    title: "",
                                    category: "To do",
                                    priority: "",
                                    description: "",
                                    dueDate: "",
                                    checklist: [],
                                    attachment: "",
                                    user: state.user._id, updatedAt: ''
                                });
                            }}
                        >
                            <AiOutlinePlus />
                            Add a card
                        </button>
                    </div>
                    <div className="bg-black text-[#b6c2cf] px-5 py-3 rounded-lg flex flex-col md:w-[25%] h-max">
                        <h1 className="text-base font-semibold p-1">Doing</h1>
                        {
                            loading ?
                                <div className="px-5 py-1.5 flex justify-center transform transition-transform duration-1000 ease-in-out hover:rotate-360">
                                    <AiOutlineLoading className='text-2xl animate-spin' />
                                </div> :
                                <Droppable droppableId="Doing">
                                    {
                                        (provided) => (
                                            <div className="min-h-[2vh] flex flex-col gap-2" ref={provided.innerRef} {...provided.droppableProps}>
                                                {task.doingTasks.map((e, i) => (
                                                    <Draggable draggableId={e._id.toString()} index={i}>
                                                        {
                                                            (provided) => (
                                                                <div
                                                                    key={e._id}
                                                                    className="task hover:bg-[#363b3f] p-2 rounded bg-[#25282a] cursor-pointer"
                                                                    onClick={() => {
                                                                        setFormData(e);
                                                                        handleOpenEdit()
                                                                    }}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    ref={provided.innerRef}
                                                                >
                                                                    <div className="flex gap-2 items-center">
                                                                        {e.priority && (
                                                                            <p
                                                                                className={`w-8 my-1 h-2 rounded-br-3xl ${e.priority == "High"
                                                                                    ? "bg-red-700"
                                                                                    : e.priority == "Mid"
                                                                                        ? "bg-yellow-600"
                                                                                        : e.priority == "Low"
                                                                                            ? "bg-green-600"
                                                                                            : null
                                                                                    }`}
                                                                            ></p>
                                                                        )}
                                                                        {e.description && <BsJustifyLeft />}
                                                                        {e.dueDate && <AiOutlineCalendar />}
                                                                        {e.checklist.length > 0 && <BsCheckSquareFill className="text-sm" />}
                                                                        {e.attachment && <IoAttach />}
                                                                    </div>
                                                                    <h1 className="flex items-center justify-between mt-1">
                                                                        {e.title} <BiPencil className="pencil-icon" />
                                                                    </h1>
                                                                </div>
                                                            )
                                                        }

                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )
                                    }

                                </Droppable>
                        }
                        <button
                            className="flex items-center text-base font-semibold gap-2 cursor-pointer hover:bg-[#3f3f46] p-1 rounded-lg mt-2"
                            onClick={() => {
                                handleOpenAdd();
                                setFormData({
                                    _id: "",
                                    title: "",
                                    category: "Doing",
                                    priority: "",
                                    description: "",
                                    dueDate: "",
                                    checklist: [],
                                    attachment: "",
                                    user: state.user._id, updatedAt: ''
                                });
                            }}
                        >
                            <AiOutlinePlus />
                            Add a card
                        </button>
                    </div>
                    <div className="bg-black text-[#b6c2cf] px-5 py-3 rounded-lg flex flex-col md:w-[25%] h-max">
                        <h1 className="text-base font-semibold p-1">Done</h1>
                        {
                            loading ?
                                <div className="px-5 py-1.5 flex justify-center transform transition-transform duration-1000 ease-in-out hover:rotate-360">
                                    <AiOutlineLoading className='text-2xl animate-spin' />
                                </div> :
                                <Droppable droppableId="Done">
                                    {(provided) => (
                                        <div className="min-h-[2vh] flex flex-col gap-2" ref={provided.innerRef} {...provided.droppableProps}>
                                            {task.doneTasks.map((e, i) => (
                                                <Draggable draggableId={e._id.toString()} index={i}>
                                                    {
                                                        (provided) => (
                                                            <div
                                                                key={e._id}
                                                                className="task hover:bg-[#363b3f] p-2 rounded bg-[#25282a] cursor-pointer"
                                                                onClick={() => {
                                                                    setFormData(e);
                                                                    handleOpenEdit()
                                                                }}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                ref={provided.innerRef}
                                                            >
                                                                <div className="flex gap-2 items-center">
                                                                    {e.priority && (
                                                                        <p
                                                                            className={`w-8 my-1 h-2 rounded-br-3xl ${e.priority == "High"
                                                                                ? "bg-red-700"
                                                                                : e.priority == "Mid"
                                                                                    ? "bg-yellow-600"
                                                                                    : e.priority == "Low"
                                                                                        ? "bg-green-600"
                                                                                        : null
                                                                                }`}
                                                                        ></p>
                                                                    )}
                                                                    {e.description && <BsJustifyLeft />}
                                                                    {e.dueDate && <AiOutlineCalendar />}
                                                                    {e.checklist.length > 0 && <BsCheckSquareFill className="text-sm" />}
                                                                    {e.attachment && <IoAttach />}
                                                                </div>
                                                                <h1 className="flex items-center justify-between mt-1">
                                                                    {e.title} <BiPencil className="pencil-icon" />
                                                                </h1>
                                                            </div>
                                                        )
                                                    }
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                        }
                        <button
                            className="flex items-center text-base font-semibold gap-2 cursor-pointer hover:bg-[#3f3f46] p-1 rounded-lg mt-2"
                            onClick={() => {
                                handleOpenAdd();
                                setFormData({
                                    _id: "",
                                    title: "",
                                    category: "Done",
                                    priority: "",
                                    description: "",
                                    dueDate: "",
                                    checklist: [],
                                    attachment: "",
                                    user: state.user._id, updatedAt: ''
                                });
                            }}
                        >
                            <AiOutlinePlus />
                            Add a card
                        </button>
                    </div>
                </div>
            </DragDropContext>
            <Modal open={openAdd} onClose={() => {
                handleCloseAdd()
                setIsChecklistOpen(false)
            }}>
                <Box sx={style}>

                    <div className="md:flex md:gap-10">
                        <div className="md:w-[70%]">
                            <div className="flex items-center gap-3 ">
                                <MdSubtitles style={{ fontSize: "22px" }} />
                                {isInputVisible ? (
                                    <TextField
                                        inputRef={inputRef}
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        onBlur={() => setInputVisible(false)}
                                        autoFocus
                                        fullWidth
                                        size="small"
                                        autoComplete="off"
                                        sx={{ input: { color: "white", fontSize: "20px" } }}
                                    />
                                ) : (
                                    <h1
                                        className="text-xl w-full font-semibold"
                                        onClick={handleTextClick}
                                        ref={inputRef}
                                    >
                                        {formData.title || "Untitled"}
                                    </h1>
                                )}
                            </div>
                            <p className="text-sm">
                                in list <b>{formData.category}</b>
                            </p>
                            <h1 className="text-base font-bold flex gap-3 items-center mt-7 mb-3">
                                <BsJustifyLeft style={{ fontSize: "18px" }} />
                                Description
                            </h1>
                            <ReactQuill
                                className="my-4 dark:border-secondary-40 border-gray-500 rounded-md text-gray-800 dark:text-white"
                                placeholder="Write something here..."
                                modules={modules}
                                formats={formats}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e })}
                            />
                            {
                                formData.priority && <div className="flex items-center gap-2 mt-5 mb-3">
                                    <h1 className="text-base font-bold flex gap-3 items-center"><BsArrowDownUp />Priority :-</h1>
                                    <p
                                        className={`w-8 my-1 h-2 rounded-br-3xl ${formData.priority == "High"
                                            ? "bg-red-700"
                                            : formData.priority == "Mid"
                                                ? "bg-yellow-600"
                                                : formData.priority == "Low"
                                                    ? "bg-green-600"
                                                    : null
                                            }`}
                                    ></p>
                                    {formData.priority}
                                </div>
                            }
                            {
                                formData.dueDate && <div className="flex items-center gap-2 mt-5 mb-3">
                                    <h1 className="text-base font-bold flex gap-3 items-center"><AiOutlineCalendar />Due Date :-</h1>
                                    {formData.dueDate.split('00:00:00')[0]}
                                </div>
                            }
                            {isChecklistOpen && (
                                <div>
                                    {formData.checklist.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Checkbox checked={item.checked}
                                                onChange={() => toggleChecklistItem(index)}
                                                sx={{
                                                    color: pink[50],
                                                    '&.Mui-checked': {
                                                        color: pink[50],
                                                    },
                                                }}
                                            />
                                            <TextField id="standard-basic" variant="standard" type="text"
                                                value={item.details}
                                                autoComplete="off"
                                                placeholder="Add a checklist item"
                                                sx={{ input: { color: "white" } }}
                                                onChange={(e) => updateChecklistItem(index, e.target.value)} />
                                        </div>
                                    ))}
                                    <button onClick={addChecklistItem} className="mb-3 bg-[#b8bbbe] rounded text-gray-900 font-semibold px-2.5 py-1">Add Checklist Item</button>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-base font-bold flex gap-2 items-center">
                                Add to card
                            </h1>
                            <p onClick={handleClickPriority} className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><BsArrowDownUp /> Priority</p>
                            <p onClick={handleClickCalender} className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><AiOutlineCalendar />Due Date</p>
                            <p onClick={toggleChecklist} className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><AiOutlineCheckSquare />Checklist</p>
                            {/* <p className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><IoAttach />Attachment</p> */}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="bg-[#579DFF] rounded text-gray-900 font-semibold px-2.5 py-1 mt-3"
                            onClick={handleSubmit}
                        >
                            Save
                        </button>
                        <button
                            className="bg-[#ffffff] rounded text-gray-900 font-semibold px-2.5 py-1 mt-3"
                            onClick={handleCloseAdd}
                        >
                            Close
                        </button>
                    </div>
                </Box>
            </Modal>
            <Modal open={openEdit} onClose={() => {
                handleCloseEdit()
                setIsChecklistOpen(false)
            }}>
                <Box sx={style}>
                    <div className="md:flex md:gap-10">
                        <div className="md:w-[70%]">
                            <div className="flex items-center gap-3 ">
                                <MdSubtitles style={{ fontSize: "22px" }} />
                                {isInputVisible ? (
                                    <TextField
                                        inputRef={inputRef}
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        onBlur={() => setInputVisible(false)}
                                        autoFocus
                                        fullWidth
                                        size="small"
                                        autoComplete="off"
                                        sx={{ input: { color: "white", fontSize: "20px" } }}
                                    />
                                ) : (
                                    <h1
                                        className="text-xl w-full font-semibold"
                                        onClick={handleTextClick}
                                        ref={inputRef}
                                    >
                                        {formData.title || "Untitled"}
                                    </h1>
                                )}
                            </div>
                            <p className="text-sm">
                                in list <b>{formData.category}</b>
                            </p>
                            <h1 className="text-base font-bold flex gap-3 items-center mt-7 mb-3">
                                <BsJustifyLeft style={{ fontSize: "18px" }} />
                                Description
                            </h1>
                            <ReactQuill
                                className="my-4 dark:border-secondary-40 border-gray-500 rounded-md text-gray-800 dark:text-white"
                                placeholder="Write something here..."
                                modules={modules}
                                formats={formats}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e })}
                            />
                            {
                                formData.priority && <div className="flex items-center gap-2 mt-5 mb-3">
                                    <h1 className="text-base font-bold flex gap-3 items-center"><BsArrowDownUp />Priority :-</h1>
                                    <p
                                        className={`w-8 my-1 h-2 rounded-br-3xl ${formData.priority == "High"
                                            ? "bg-red-700"
                                            : formData.priority == "Mid"
                                                ? "bg-yellow-600"
                                                : formData.priority == "Low"
                                                    ? "bg-green-600"
                                                    : null
                                            }`}
                                    ></p>
                                    {formData.priority}
                                </div>
                            }
                            {
                                formData.dueDate && <div className="flex items-center gap-2 mt-5 mb-3">
                                    <h1 className="text-base font-bold flex gap-3 items-center"><AiOutlineCalendar />Due Date :-</h1>
                                    {formData.dueDate.split('00:00:00')[0]}
                                </div>
                            }
                            <div className="flex flex-col gap-2 mt-5 mb-3">
                                {formData.checklist.length != 0 && <h1 className="text-base font-bold flex gap-3 items-center"><AiOutlineCheckSquare />Checklist :-</h1>}
                                {formData.checklist?.map((e, index) => (
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={e.checked}
                                            onChange={() => toggleChecklistItem(index)}
                                            sx={{
                                                color: pink[50],
                                                '&.Mui-checked': {
                                                    color: pink[50],
                                                },
                                            }}
                                        />
                                        <TextField id="standard-basic" variant="standard" type="text"
                                            value={e.details}
                                            autoComplete="off"
                                            placeholder="Add a checklist item"
                                            sx={{ input: { color: "white" } }}
                                            onChange={(e) => updateChecklistItem(index, e.target.value)}
                                        />
                                    </div>
                                ))}
                                {/* <button onClick={addChecklistItem} className="mb-3 bg-[#b8bbbe] rounded text-gray-900 font-semibold px-2.5 py-1">Add Checklist Item</button> */}
                            </div>

                        </div>
                        <div>
                            <h1 className="text-base font-bold flex gap-2 items-center">
                                Add to card
                            </h1>
                            <p onClick={handleClickMove} className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><BsArrowRight /> Move</p>
                            <p onClick={handleClickPriority} className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><BsArrowDownUp /> Priority</p>
                            <p onClick={handleClickCalender} className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><AiOutlineCalendar />Due Date</p>
                            <p onClick={addChecklistItem} className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><AiOutlineCheckSquare />Checklist</p>
                            {/* <p className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><IoAttach />Attachment</p> */}
                            <p onClick={handleSubmitDelete} className="flex items-center gap-2 text-sm font-semibold mt-1 bg-gray-700 p-1 rounded-md hover:bg-gray-500 cursor-pointer w-[150px]"><MdOutlineDeleteOutline />Delete</p>
                        </div>
                    </div>
                    <div className="flex md:items-end flex-col md:flex-row md:justify-between">
                        <div className="flex gap-2">
                            <button
                                className="bg-[#579DFF] rounded text-gray-900 font-semibold px-2.5 py-1 mt-3"
                                onClick={handleSubmitUpdate}
                            >
                                Update
                            </button>
                            <button
                                className="bg-[#ffffff] rounded text-gray-900 font-semibold px-2.5 py-1 mt-3"
                                onClick={handleCloseEdit}
                            >
                                Close
                            </button>
                        </div>
                        <p>Last Updated at: {new Date(formData?.updatedAt).toLocaleString()}</p></div>
                </Box>
            </Modal>
            <Menu
                anchorEl={anchorElPriority}
                open={Boolean(anchorElPriority)}
                onClose={handleClosePriority}
                sx={
                    {
                        mt: "1px", "& .MuiMenu-paper":
                            { backgroundColor: "darkgray", },
                    }
                }
            >
                <MenuItem onClick={() => {
                    handleClosePriority()
                    setFormData({ ...formData, priority: "High" })
                }}><p className="w-8 my-1 h-2 rounded-br-3xl bg-red-700 mr-2"></p> High</MenuItem>
                <MenuItem onClick={() => {
                    handleClosePriority()
                    setFormData({ ...formData, priority: "Mid" })
                }}><p className="w-8 my-1 h-2 rounded-br-3xl bg-yellow-600 mr-2"></p> Mid</MenuItem>
                <MenuItem onClick={() => {
                    handleClosePriority()
                    setFormData({ ...formData, priority: "Low" })
                }}><p className="w-8 my-1 h-2 rounded-br-3xl bg-green-600 mr-2"></p> Low</MenuItem>
            </Menu>
            <Menu
                anchorEl={anchorElCalender}
                open={Boolean(anchorElCalender)}
                onClose={handleCloseCalender}
                sx={
                    {
                        mt: "1px", "& .MuiMenu-paper":
                            { backgroundColor: "darkgray", },
                    }
                }
            >
                <Calendar onClickDay={handleCloseCalender} minDate={new Date()} value={formData.dueDate} onChange={handleDueDateChange as any} />
            </Menu>
            <Menu
                anchorEl={anchorElMove}
                open={Boolean(anchorElMove)}
                onClose={handleCloseMove}
                sx={
                    {
                        mt: "1px", "& .MuiMenu-paper":
                            { backgroundColor: "darkgray", },
                    }
                }
            >
                {
                    formData.category == "To do" ?
                        [
                            <MenuItem key='doing' onClick={() => {
                                handleCloseMove()
                                setFormData({ ...formData, category: "Doing" })
                            }}>Doing</MenuItem>,
                            <MenuItem key='done' onClick={() => {
                                handleCloseMove()
                                setFormData({ ...formData, category: "Done" })
                            }}>Done</MenuItem>
                        ] :
                        formData.category == 'Doing' ?
                            [
                                <MenuItem key="todo" onClick={() => {
                                    handleCloseMove()
                                    setFormData({ ...formData, category: "To do" })
                                }}>To do</MenuItem>,
                                <MenuItem key='done' onClick={() => {
                                    handleCloseMove()
                                    setFormData({ ...formData, category: "Done" })
                                }}>Done</MenuItem>
                            ] :
                            [
                                <MenuItem key="todo" onClick={() => {
                                    handleCloseMove()
                                    setFormData({ ...formData, category: "To do" })
                                }}>To do</MenuItem>,
                                <MenuItem key='doing' onClick={() => {
                                    handleCloseMove()
                                    setFormData({ ...formData, category: "Doing" })
                                }}>Doing</MenuItem>
                            ]
                }
            </Menu>
        </>
    );
}
