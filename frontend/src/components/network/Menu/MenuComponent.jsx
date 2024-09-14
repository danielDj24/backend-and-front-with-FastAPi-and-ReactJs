import React, { useState, useEffect } from "react";
import { axiosInstance, resourcesInstance,axiosInstanceAuth } from "../../functions/axiosConfig";
import getRoleFromToken from "../../functions/DecodeToken";
import useAuthStore from "../../store/userAuthToken";
import { useNavigate } from "react-router-dom";
import getUserIdFromToken from "../../functions/UserByToken";
// estilos
import "./menuStyles.css";

const MenuComponent = ({ handleOpenLoginModal, userRole, handleLogout, isECommerce }) => {
    const [logo, setLogo] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const storedToken = useAuthStore.getState().token;
    const roleFromToken = getRoleFromToken(storedToken);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const [submenuBrandsOpen, setSubmenuBrandsOpen] = useState(false);
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const { token, checkToken } = useAuthStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBrands();
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

    const fetchBrands = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get("/uploaded/brands");
                setBrands(response.data);
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching brands");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLogoClick = () => {
        if (storedToken){
            window.location.href = '/e-commerce';
        } else  {
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
     // Nueva función para redirigir al carrito
    const handleCartClick = () => {
        const userId = getUserIdFromToken(token);  
        navigate(`/e-commerce/cart/${userId}`);
    };

    return (
        <div className="Menu">
        <div className="menu-container" style={{ backgroundColor: primaryColor }}>
            <img src={`${resourcesInstance.defaults.baseURL}${logo}`} alt="Site logo" className="logo-img" onClick={handleLogoClick} style={{ cursor: 'pointer' }} />
            
            {(roleFromToken === 'admin' || roleFromToken === 'client') && isECommerce ? (
                <div className="menu-items ecommerce-menu-items">
                    <div className="menu-item" onClick={toggleSubmenu}>
                            Monturas
                            <i className={`fa-solid ${submenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                        </div>
                        {submenuOpen && (
                            <div className="submenu" style={{ backgroundColor: primaryColor }}>
                                <a href="/e-commerce/products" className="submenu-item">Tienda</a>
                                <a onClick={() => handleNavigateBrands('Hombre')} className="submenu-item">Hombre </a>
                                <a onClick={() => handleNavigateBrands('Mujer')} className="submenu-item">Mujer</a>
                                <a onClick={() => handleNavigateBrands('Lentes de sol')} className="submenu-item">Lentes de Sol</a>
                                <a onClick={() => handleNavigateBrands('Optico')} className="submenu-item">Ópticos</a>
                            </div>
                        )}
                        <div className="menu-item" onClick={toggleBrandsSubmenu}>
                            Marcas
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
                    <a href="/e-commerce/products/search" className="menu-item">Buscador</a>
                    <a href="/e-commerce/contactanos" className="menu-item">Contáctanos</a>
                    <button className="btn btn-dark" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                    <button className="btn btn-dark" onClick={handleCartClick}>
                        Carrito 
                    </button>
                    {roleFromToken === 'admin' && (
                        <div className="admin-container">
                            <button className="btn btn-dark" onClick={() => window.open('/intranet/', '__blank')}>
                                configuraciones web
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
                                Ingresar
                            </button>
                        ) : (
                            <button className="btn btn-dark" onClick={handleLogout}>
                                Cerrar sesión
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
