import React, { useState, useEffect } from "react";
import { axiosInstance, resourcesInstance } from "./functions/axiosConfig";
import "../styles/menuStyles.css";
import {CustomModal} from "./functions/CustomModal";
import Login from "./Login";
import Register from "./Register";

const MenuComponent = () => {
    //constantes que obtienen el logo y campos para agregarlos al menu
    const [logo, setLogo] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [menuData, setMenuData] = useState([]);

    //constantes para controlar el login y el registro en el modal de usuarios
    const [activeForm, setActiveForm] = useState('login');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const handleOpenLoginModal = () => setShowLoginModal(true);
    const handleCloseLoginModal = () => setShowLoginModal(false);

    useEffect(() => {
        axiosInstance.get('/config')
        .then(response =>  {
            const data = response.data;
            setLogo(data.logo_site);
            setPrimaryColor(data.primary_color);
            setSecondaryColor(data.secondary_color);
            const menuArray = data.menu.split(",");
            setMenuData(menuArray);
        })
        .catch(error => {
            console.error('Error fetching data', error);
        });
    }, []);

    return (
    <div className="Menu">
        <div className="menu-container" style={{ backgroundColor: primaryColor }}>
            <img src={`${resourcesInstance.defaults.baseURL}${logo}`} alt="Site logo" className="logo-img" />
            <nav className="menu-nav">
                {menuData.map((menuItem, index) => (
                    <p key={index} className="menu-item" style={{ color: secondaryColor }}>{menuItem}</p>
                ))}
            </nav>
            <div className="login-container">
                <button className="btn btn-dark" onClick={handleOpenLoginModal}>
                    <i className="fa-solid fa-sign-in-alt"></i> Ingresar
                </button>
            </div>
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
            {activeForm === 'login' ? <Login/> : <Register/> }
        </CustomModal>
    </div>
    
    );
};

export default MenuComponent;
