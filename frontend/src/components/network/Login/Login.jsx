import React, {useState} from "react";
import { axiosInstanceLogin } from '../../functions/axiosConfig';
import "./Login.css";
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import useAuthStore from "../../store/userAuthToken";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RequestPasswordReset from "../Reset-password/SendEmailResetPassword";

const Login = ({ onLoginSuccess }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [FormData, setFormData] = useState({
        username: '',
        password:''
    });

    const [showResetPassword, setShowResetPassword] = useState(false); 
        
    const handleChange = (e) => {
        const {name,value} = e.target;
        setFormData({
            ...FormData,
            [name] : value
        });
    };

    const { setToken } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstanceLogin.post('/token', FormData);
            const token = response.data.access_token;
            const role = response.data.role;
            setToken(token);
            navigate("/e-commerce");
            ShowSuccesAlert('Inicio de sesión exitoso', `Bienvenido: ${FormData .username}`);
            onLoginSuccess(role);
        }catch(error){
            ShowErrorAlter('Error al iniciar sesion', "contraseña incorrecta intentalo de nuevo");
        }
    };

    return (
        <div className="login-container-component">
            {!showResetPassword ? (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t("usernameOrEmail")}</label>
                        <input 
                            type="text"
                            name="username"
                            value={FormData.username}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>{t("password")}</label>
                        <input
                            type="password"
                            name="password"
                            value={FormData.password}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <button className="btn btn-success mt-3" type="submit">
                        {t("loginButton")}
                    </button>
                    <p className="forgot-password" onClick={() => setShowResetPassword(true)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', marginTop: '10px' }}>
                        ¿Olvidaste tu contraseña?
                    </p>
                </form>
            ) : (
                <>
                    <RequestPasswordReset />
                    <p className="back-to-login" onClick={() => setShowResetPassword(false)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', marginTop: '10px' }}>
                        Volver a iniciar sesión
                    </p>
                </>
            )}
        </div>
    );
};

export default Login;