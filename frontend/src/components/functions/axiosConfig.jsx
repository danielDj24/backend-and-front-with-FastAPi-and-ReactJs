import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

const axiosInstanceFiles = (token) => axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization':`Bearer ${token}`
    }
});

const axiosInstanceFilesRegister = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'multipart/form-data',

    }
});


const axiosInstanceAuth = (token) => axios.create({
    baseURL:process.env.REACT_APP_API_BASE_URL,
    headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${token}`
    }
});

const axiosInstanceLogin = axios.create({
    baseURL:process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

// Función para enviar el correo de restablecimiento de contraseña
const axiosResetPassword = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

const sendResetPasswordEmail = axios.create ({
    baseURL:process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});


const resourcesInstance = axios.create({
    baseURL: process.env.REACT_APP_RESOURCES_URL, 
    timeout: 10000, 
    headers: {
    'Content-Type': 'application/json',

    },
});

const activateUser = async (token, userId) => {
    const axiosAuth = axiosInstanceAuth(token);
    const response = await axiosAuth.patch(`/user/active/${userId}`);
    return response.data;
};


const deleteUser = async (token, userId) => {
    const axiosAuth = axiosInstanceAuth(token);
    const response = await axiosAuth.delete(`/users/${userId}`);
    return response.data;
};

export  { axiosInstance, resourcesInstance, axiosInstanceLogin, axiosInstanceAuth, axiosInstanceFiles, activateUser, deleteUser, axiosInstanceFilesRegister, sendResetPasswordEmail, axiosResetPassword };

