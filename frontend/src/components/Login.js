import React, {useState} from "react";
import { axiosInstanceLogin } from './functions/axiosConfig';
import "../styles/Login.css";
import { ShowErrorAlter, ShowSuccesAlert } from './functions/Alerts';

const Login = () => {
    const [FormData, setFormData] = useState({
        username: '',
        password:''
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
        
    const handleChange = (e) => {
        const {name,value} = e.target;
        setFormData({
            ...FormData,
            [name] : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstanceLogin.post('/token', FormData);
            ShowSuccesAlert('Inicio de sesión exitoso', `Bienvenido: ${FormData .username}`);
            setIsLoggedIn(true);
        }catch(error){
            ShowErrorAlter('Error al iniciar sesion',`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="login-container-component">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>usuario o email:</label>
                    <input 
                    type = "text"
                    name = "username"
                    value = {FormData.username}
                    onChange={handleChange}
                    className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>contraseña:</label>
                    <input
                    type = "password"
                    name = "password"
                    value = {FormData.password}
                    onChange = {handleChange}
                    className="form-control"
                    />
                </div >
                <button className="btn btn-success mt-3" type="submit">
                    <i className="fa fa-paper-plane"></i> Enviar
                </button>
            </form>
        </div>
    );
};

export default Login;