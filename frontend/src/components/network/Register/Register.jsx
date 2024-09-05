import React, {useState} from "react";
import { axiosInstance, axiosInstanceFilesRegister } from '../../functions/axiosConfig';
import "./Register.css";
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';

const Register = ({ onRegisterSuccess }) => {
    const [formData, setFormData ] = useState(
        {
            username : '',
            email : '',
            password : '',
            confirmPassword : ''
        });
    //estado para controlar las vistas de los formularios
    const [showSecondForm, setShowSecondForm] = useState(false);
    const [showFirstForm, setShowFirstForm] = useState(true);
    const [userId, setUserId] = useState(null);
    //constante para controlar los campos en el formulario extra
    const [additionalFormData, setAdditionalFormData] = useState({
            phone:'',
            address:'',
            name_company:'',
            nit_company:'',
        });
    const [selectedFile, setSelectedFile] = useState(null);

        const handleChange = (e) =>{
            const {name, value} = e.target;
            setFormData({
                ...formData,
                [name]: value
            });
        };
        
        const HandleAdittionalChange = (e) => {
            const {name, value} = e.target;
            setAdditionalFormData({
                ...additionalFormData,
                [name] : value
            });
        };
        const handleFileChange = (e) => {
            setSelectedFile(e.target.files[0]);
        };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            ShowErrorAlter('Error', "Las contraseñas no coinciden");
            return;
        }
        try {
            const response = await axiosInstance.post('/register', formData);
            if (response.data.phone === null || response.data.address === null || response.data.name_company === null || response.data.nit_company === null) {
                setUserId(response.data.id);
                setShowFirstForm(false);
                setShowSecondForm(true);
            } else {
                ShowSuccesAlert('Registro exitoso', 'Te has registrado exitosamente');
                onRegisterSuccess();
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    const errorMessage = error.response.data.detail;
                    ShowErrorAlter('Error en el registro', errorMessage);
                } else {
                    ShowErrorAlter('Error en el registro', `Error: ${error.response.data.detail || error.response.statusText}`);
                }
            } else {
                ShowErrorAlter('Error en el registro', `Error: ${error.message}`);
            }
        }
    };
    
    const adittionalHandleSubmit = async (e) => {
        e.preventDefault();
            try {
                const combinedData = {
                    ...formData,
                    ...additionalFormData,
                    
                };    
            await axiosInstance.post('/register/verify/data', combinedData);

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                await axiosInstanceFilesRegister.post(`/register/upload/rut_company/${userId}`, formData);
            }
            ShowSuccesAlert('Registro exitoso',"te has registrado exitosamente");
            onRegisterSuccess();
        } catch (error){
            ShowErrorAlter('Error en los datos ingresados', `Error : ${error.response?.data?.message || error.message}`);
        }
    };


    return (
        <div className="register-container">
            {showFirstForm && (
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
                <button className="btn btn-secondary mt-3" type="submit">
                        Siguiente 
                </button>
            </form>
            )}
            {showSecondForm && (
                <form onSubmit={adittionalHandleSubmit}>
                    <div className="form-group">
                        <label>Numero de contacto:</label>
                        <input
                            type="text"
                            name="phone"
                            value={additionalFormData.phone}
                            onChange={HandleAdittionalChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Dirección</label>
                        <input
                            type="text"
                            name="address"
                            value={additionalFormData.address}
                            onChange={HandleAdittionalChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Compañía</label>
                        <input
                            type="text"
                            name="name_company"
                            value={additionalFormData.name_company}
                            onChange={HandleAdittionalChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Nit de la Compañía</label>
                        <input 
                            type="text"
                            name="nit_company"
                            value={additionalFormData.nit_company}
                            onChange={HandleAdittionalChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Subir PDF:</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="application/pdf"
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="button-group">
                    <button className="btn btn-secondary mt-3" onClick={() => { setShowFirstForm(true); setShowSecondForm(false); }}>
                            Volver
                        </button>
                        <button className="btn btn-success mt-3" type="submit">
                            Enviar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Register;