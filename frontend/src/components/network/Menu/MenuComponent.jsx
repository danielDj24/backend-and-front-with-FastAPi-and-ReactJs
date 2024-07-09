import React, { useState, useEffect } from "react";
import { axiosInstance, resourcesInstance } from "../../functions/axiosConfig";
import getRoleFromToken from "../../functions/DecodeToken";
import useAuthStore from "../../store/userAuthToken";

// estilos
import "./menuStyles.css";

const MenuComponent = ({ handleOpenLoginModal, userRole, handleLogout, isECommerce }) => {
    const [logo, setLogo] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const storedToken = useAuthStore.getState().token;
    const roleFromToken = getRoleFromToken(storedToken);


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

    const handleLogoClick = () => {
        window.location.href = '/';
    };

    return (
        <div className="Menu">
        <div className="menu-container" style={{ backgroundColor: primaryColor }}>
            <img src={`${resourcesInstance.defaults.baseURL}${logo}`} alt="Site logo" className="logo-img" onClick={handleLogoClick} style={{ cursor: 'pointer' }} />
            
            {(roleFromToken === 'admin' || roleFromToken === 'client') && isECommerce ? (
                <div className="menu-items ecommerce-menu-items">
                    <button className="btn btn-dark" onClick={handleLogout}>
                        <i className="fa-solid fa-sign-out-alt"></i> Cerrar sesión
                    </button>
                    <button className="btn btn-dark">
                        <i className="fa-solid fa-shopping-cart"></i> Comprar
                    </button>
                    {roleFromToken === 'admin' && (
                        <div className="admin-container">
                            <button className="btn btn-dark" onClick={() => window.open('/intranet/', '__blank')}>
                                <i className="fa-solid fa-user-shield"></i> Intranet
                            </button>
                        </div>
                    )}
                </div>
                
            ) : (
                <div className="menu-items">
                    <a href="/sobre-nosotros" className="menu-item">Sobre nosotros</a>
                    <a href="/por-que-nosotros" className="menu-item">Por qué nosotros</a>
                    <a href="/blog" className="menu-item">Blog</a>
                    <div className="login-container">
                        {!storedToken ? (
                            <button className="btn btn-dark" onClick={handleOpenLoginModal}>
                                <i className="fa-solid fa-sign-in-alt"></i> Ingresar
                            </button>
                        ) : (
                            <button className="btn btn-dark" onClick={handleLogout}>
                                <i className="fa-solid fa-sign-out-alt"></i> Cerrar sesión
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
);
};

export default MenuComponent;
