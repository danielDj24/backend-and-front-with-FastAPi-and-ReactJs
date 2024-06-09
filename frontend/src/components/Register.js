import React, {useState} from "react";
import { axiosInstance } from './functions/axiosConfig';
import "../styles/Register.css";
import { ShowErrorAlter, ShowSuccesAlert } from './functions/Alerts';

const Register = () => {
    const [formData, setFormData ] = useState(
        {
            username : '',
            email : '',
            password : '',
            confirmPassword : ''
        });

        const handleChange = (e) =>{
            const {name, value} = e.target;
            setFormData({
                ...formData,
                [name]: value
            });
        };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword){
            ShowErrorAlter('Error',"las contraseñas no coinciden");
            return;
        }
        try {
            const response = await axiosInstance.post('/register', formData);
            ShowSuccesAlert('Registro exitoso',"te has registrado exitosamente");
        }catch(error){
            ShowErrorAlter('Error en el registro',`Error: ${error.response?.data?.message || error.message}`);
        }
    };
    return (
        <div className="register-container">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>usuario:</label>
                    <input 
                    type = "text"
                    name = "username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>email:</label>
                    <input
                    type = "email"
                    name = "email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>contraseña:</label>
                    <input 
                    type = "password"
                    name = "password"
                    value = {formData.password}
                    onChange={handleChange}
                    required
                    className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>confirmar contraseña:</label>
                    <input
                    type = "password"
                    name = "confirmPassword"
                    value = {formData.confirmPassword}
                    onChange={handleChange}
                    required
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

export default Register;