import React, { useEffect, useState } from "react";
import { axiosInstanceAuth } from "./functions/axiosConfig";
import useAuthStore from "./store/userAuthToken";
import Cookies from "js-cookie";
import MenuComponent from "./MenuComponent";

const UserProfile = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useAuthStore((state) => state.token) || Cookies.get('auth_token'); 

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setError(new Error("No token available"));
                setLoading(false);
                return;
            }

            try {
                console.log("Fetching user profile with token:", token);
                const response = await axiosInstanceAuth(token).get('/users/profile');

                setData(response.data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    if (loading) {
        return <div>Cargando...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (!data) {
        return <div>No se ha encontrado datos del usuario</div>;
    }

    return (
        
        <div>
            <MenuComponent></MenuComponent>
            <h1>Perfil del usuario</h1>
            <p><strong>Nombre del usuario:</strong> {data.username}</p>
            <p><strong>Email:</strong> {data.email}</p>
        </div>
    );
};

export default UserProfile;
