import React, { useState, useEffect } from "react";
import { axiosInstance, resourcesInstance, axiosInstanceAuth } from "../../functions/axiosConfig";
import getRoleFromToken from "../../functions/DecodeToken";
import useAuthStore from "../../store/userAuthToken";
import { useNavigate } from "react-router-dom";
import getUserIdFromToken from "../../functions/UserByToken";
import { useTranslation } from "react-i18next";

// estilos
import "./menuStyles.css";

const MenuComponent = ({ handleOpenLoginModal, userRole, handleLogout, isECommerce }) => {
    const { t, i18n } = useTranslation();
    const [logo, setLogo] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const storedToken = useAuthStore.getState().token;
    const roleFromToken = getRoleFromToken(storedToken);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const [submenuBrandsOpen, setSubmenuBrandsOpen] = useState(false);
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [hamburgerOpen, setHamburgerOpen] = useState(false); 

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
        if (storedToken) {
            window.location.href = '/e-commerce';
        } else {
            window.location.href = '/';
        }
    };

    const toggleSubmenu = () => {
        setSubmenuOpen(prevState => !prevState);
    };
    
    const toggleBrandsSubmenu = () => {
        setSubmenuBrandsOpen(prevState => !prevState);
    };

    const handleNavigateBrands = (gender) => {
        navigate(`/e-commerce/products/gender/${gender}`);
    };
    
    const handleNavigateToBrand = (brandId) => {
        navigate(`/e-commerce/products/brands/${brandId}`);
    };
    
    const handleCartClick = () => {
        const userId = getUserIdFromToken(token);  
        navigate(`/e-commerce/cart/${userId}`);
    };

    const toggleHamburgerMenu = () => {
        setHamburgerOpen(prevState => !prevState);
    };

    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        i18n.changeLanguage(newLanguage);
    };

    return (
        <div className="Menu">
            <div className="menu-container" style={{ backgroundColor: primaryColor }}>
                <img 
                    src={`${resourcesInstance.defaults.baseURL}${logo}`} 
                    alt="Site logo" 
                    className="logo-img" 
                    onClick={handleLogoClick} 
                    style={{ cursor: 'pointer' }} 
                />
                
                <div className="hamburger" onClick={toggleHamburgerMenu}>
                    <i className={`fa-solid ${hamburgerOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </div>

                <div className={`menu-items ${hamburgerOpen ? 'open' : ''}`} style={{ backgroundColor: secondaryColor }}>
                    {(roleFromToken === 'admin' || roleFromToken === 'client') && isECommerce ? (
                        <>
                            <div className="menu-item" onClick={toggleSubmenu}>
                                {t("monturas")}
                                <i className={`fa-solid ${submenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            </div>
                            {submenuOpen && (
                                <div className="submenu" style={{ backgroundColor: primaryColor }}>
                                    <a href="/e-commerce/products" className="submenu-item">{t("tienda")}</a>
                                    <a onClick={() => handleNavigateBrands('Hombre')} className="submenu-item">{t("hombre")}</a>
                                    <a onClick={() => handleNavigateBrands('Mujer')} className="submenu-item">{t("mujer")}</a>
                                    <a onClick={() => handleNavigateBrands('Lentes de sol')} className="submenu-item">{t("lentes_de_sol")}</a>
                                    <a onClick={() => handleNavigateBrands('Optico')} className="submenu-item">{t("opticos")}</a>
                                </div>
                            )}
                            <div className="menu-item" onClick={toggleBrandsSubmenu}>
                                {t("marcas")}
                                <i className={`fa-solid ${submenuBrandsOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            </div>
                            {submenuBrandsOpen && (
                                <div className="submenu" style={{ backgroundColor: primaryColor }}>
                                    {brands.map((brand) => (
                                        <a key={brand.id} className="submenu-item" onClick={() => handleNavigateToBrand(brand.id)}>
                                            {brand.name}
                                        </a>
                                    ))}
                                </div>
                            )}

                            <a href="/e-commerce/products/search" className="menu-item">{t("buscador")}</a>
                            <a href="/e-commerce/contactanos" className="menu-item">{t("contactanos")}</a>
                            <div className="language-toggle">
                                <select value={i18n.language} onChange={handleLanguageChange}>
                                    <option value="es">Español</option>
                                    <option value="en">Inglés</option>
                                </select>
                            </div>
                            <div className="current-buttons-control">
                                <button className="btn btn-dark" onClick={handleLogout}>
                                    {t("cerrar_sesion")}
                                </button>
                                
                                <button className="btn btn-dark" onClick={handleCartClick}>
                                    {t("carrito")}
                                </button>
                            </div>
                            {roleFromToken === 'admin' && (
                                <div className="admin-container">
                                    <button className="btn btn-dark" onClick={() => window.open('/intranet/', '__blank')}>
                                        {t("configuraciones_web")}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <a href="/sobre-nosotros" className="menu-item">{t("sobre_nosotros")}</a>
                            <a href="/por-que-nosotros" className="menu-item">{t("por_que_nosotros")}</a>
                            <a href="/blog" className="menu-item">{t("blog")}</a>
                            <div className="language-toggle">
                                <select value={i18n.language} onChange={handleLanguageChange}>
                                    <option value="es">Español</option>
                                    <option value="en">Inglés</option>
                                </select>
                            </div>
                            <div className="login-container">
                                {!storedToken ? (
                                    <button className="btn btn-dark" onClick={handleOpenLoginModal}>
                                        {t("ingresar")}
                                    </button>
                                ) : (
                                    <button className="btn btn-dark" onClick={handleLogout}>
                                        {t("cerrar_sesion")}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuComponent;
