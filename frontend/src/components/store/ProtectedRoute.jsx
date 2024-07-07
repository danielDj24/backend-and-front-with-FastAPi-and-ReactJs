import React, {useEffect} from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "./userAuthToken";
import getRoleFromToken  from "../functions/DecodeToken";

const ProtectedRoute = ({element: Component, roles, ...rest}) => {
    const {token, checkToken } = useAuthStore();

    useEffect(() => {
        checkToken();

    },[checkToken]);

    if (!token){
        return <Navigate to= "/"/>
    }

    const userRole = getRoleFromToken(token);
    if (!roles.includes(userRole)){
        return <Navigate to="/"/>
    }

    return <Component {...rest} />;
};

export default ProtectedRoute;