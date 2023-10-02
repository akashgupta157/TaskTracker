import Navbar from "./components/Navbar";
import { Routes, Route } from 'react-router-dom'
import Home from "./pages/Home";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Board from "./pages/Board";
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<Board />} />
      </Routes>
      <ToastContainer />
    </>
  )
}