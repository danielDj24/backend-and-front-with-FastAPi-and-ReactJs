import React, { useState, useEffect } from "react";
import { axiosInstance, resourcesInstance } from "../functions/axiosConfig";
import {CustomModal} from "../functions/CustomModal";
import Login from "./Login";
import Register from "./Register";
import useAuthStore from "../store/userAuthToken";

//estilos
import "./styles-network/menuStyles.css";

const MenuComponent = () => {

    //constantes que obtienen el logo y campos para agregarlos al menu
    const [logo, setLogo] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');

    //constantes para controlar el login y el registro en el modal de usuarios
    const [activeForm, setActiveForm] = useState('login');
    const [showLoginModal, setShowLoginModal] = useState(false);

    //control de rutas para el login admin
    const [userRole, setUserRole] = useState(null);
    const handleOpenLoginModal = () => setShowLoginModal(true);
    const handleCloseLoginModal = () => setShowLoginModal(false);

    useEffect(() => {
        //metodo para obtener el token almacenado
        useAuthStore.getState().checkToken();
        axiosInstance.get('/config')
        .then(response =>  {
            const data = response.data;
            setLogo(data.logo_site);
            setPrimaryColor(data.primary_color);
            setSecondaryColor(data.secondary_color);
            document.documentElement.style.setProperty('--secondary-color', data.secondary_color);

            const storedToken = useAuthStore.getState().token;
            setUserRole(storedToken ? 'admin' : null);
        })
        .catch(error => {
            console.error('Error fetching data', error);
        });
        
    }, []);
        
    const handleLoginSuccess = (role) => {
            setUserRole(role); 
            setShowLoginModal(false);            
    };
    const handleLogout = () => {
        useAuthStore.getState().clearToken();
        setUserRole(null);
    };
    return (
    <div className="Menu">
        <div className="menu-container" style={{ backgroundColor: primaryColor }}>
            <img src={`${resourcesInstance.defaults.baseURL}${logo}`} alt="Site logo" className="logo-img" />
            {/* Elementos adicionales del menú */}
            <div className="menu-items">
                <a href="/" className="menu-item">Inicio</a>
                <a href="/sobre-nosotros" className="menu-item">Sobre nosotros</a>
                <a href="/por-que-nosotros" className="menu-item">Por qué nosotros</a>
                <a href="/blog" className="menu-item">Blog</a>
        </div>
            <div className="login-container">
                    {!userRole ? (
                        <button className="btn btn-dark" onClick={handleOpenLoginModal}>
                            <i className="fa-solid fa-sign-in-alt"></i> Ingresar
                        </button>
                    ) : (
                        <button className="btn btn-dark" onClick={handleLogout}>
                            <i className="fa-solid fa-sign-out-alt"></i> Cerrar sesión
                        </button>
                    )}
            </div>
            {userRole === 'admin' && (
                    <div className="admin-container">
                        
                        <button className="btn btn-dark"  onClick={() =>  window.open('/intranet/config/home', '__blank')}>
                            <i className="fa-solid fa-user-shield"></i> Intranet
                        </button>
                        
                    </div>
                )}
        </div>
        <CustomModal show={showLoginModal} handleClose={handleCloseLoginModal} title="Iniciar sesión">
            <div className="form-toggle"> 
                    <p
                    className={`form-toggle-item ${activeForm === 'login' ? 'active': ''}`}
                    onClick={() => setActiveForm('login')}
                    >
                        Iniciar sesión
                    </p>
                    <p
                        className={`form-toggle-item ${activeForm === 'register' ? 'active':''}`}
                        onClick={() =>setActiveForm('register') }
                    >
                        Registrarse
                    </p>
            </div>
            {activeForm === 'login' ? <Login onLoginSuccess={handleLoginSuccess} /> :<Register onRegisterSuccess={handleCloseLoginModal} /> }
        </CustomModal>
    </div>
    
    );
};

export default MenuComponent;
