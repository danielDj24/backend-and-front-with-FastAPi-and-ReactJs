import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

const axiosInstanceFiles = (token) => axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization':`Bearer ${token}`
    }
});
const axiosInstanceAuth = (token) => axios.create({
    baseURL:"http://127.0.0.1:8000/api",
    headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${token}`
    }
});

const axiosInstanceLogin = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

const resourcesInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/', 
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

export  { axiosInstance, resourcesInstance, axiosInstanceLogin, axiosInstanceAuth, axiosInstanceFiles, activateUser, deleteUser };

