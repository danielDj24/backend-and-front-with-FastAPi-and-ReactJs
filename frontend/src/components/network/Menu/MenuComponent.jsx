import React, { useState, useEffect } from "react";
import { axiosInstance, resourcesInstance } from "../../functions/axiosConfig";


//estilos
import "./menuStyles.css";

const MenuComponent = ({ handleOpenLoginModal, userRole, handleLogout }) => {
    const [logo, setLogo] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');

    useEffect(() => {
        axiosInstance.get('/config')
            .then(response => {
                const data = response.data;
                setLogo(data.logo_site);
                setPrimaryColor(data.primary_color);
                setSecondaryColor(data.secondary_color);
                document.documentElement.style.setProperty('--secondary-color', data.secondary_color);
            })
            .catch(error => {
                console.error('Error fetching data', error);
            });
    }, []);

    return (
        <div className="Menu">
            <div className="menu-container" style={{ backgroundColor: primaryColor }}>
                <img src={`${resourcesInstance.defaults.baseURL}${logo}`} alt="Site logo" className="logo-img" />
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
                        <button className="btn btn-dark" onClick={() => window.open('/intranet/config/home', '__blank')}>
                            <i className="fa-solid fa-user-shield"></i> Intranet
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuComponent;
