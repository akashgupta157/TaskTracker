import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
interface PrivateRouteProps {
    children: React.ReactNode;
}
export default function PrivateRoute({ children }: PrivateRouteProps) {
    const auth = useSelector((store: any) => store.authReducer.isAuthenticated);
    return auth ? children : <Navigate to="/" />;
}