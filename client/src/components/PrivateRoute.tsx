import { Navigate } from "react-router-dom";
import { useSelector } from 'react-redux'
import { ReactNode } from 'react';
export default function PrivateRoute({ children }: { children: ReactNode }) {
    const state = useSelector((store: any) => store.authReducer)
    return state.isAuthenticated ? children : <Navigate to="/" />;
}