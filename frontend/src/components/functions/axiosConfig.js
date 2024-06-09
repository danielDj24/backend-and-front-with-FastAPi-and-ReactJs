import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json'
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

export  { axiosInstance, resourcesInstance, axiosInstanceLogin };

