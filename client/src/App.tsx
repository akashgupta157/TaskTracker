import Navbar from "./components/Navbar";
import { Routes, Route } from 'react-router-dom'
import Home from "./pages/Home";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Board from "./pages/Board";
import PrivateRoute from "./components/PrivateRoute";
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<PrivateRoute><Board /></PrivateRoute>} />
      </Routes>
      <ToastContainer />
    </>
  )
}