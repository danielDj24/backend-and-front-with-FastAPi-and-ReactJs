import React, {useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import Banners from "../../components/network/Banners/bannerscomponet";
import FooterComponent from "../../components/network/Footer/footerComponent"
import { useNavigate } from "react-router-dom";
import { axiosInstanceAuth } from "../../components/functions/axiosConfig";
import { ShowErrorAlter } from "../../components/functions/Alerts";
import useAuthStore from "../../components/store/userAuthToken";
import { useTranslation } from "react-i18next";


import './homeStore.css'
import GafasSol from "../../assets/resources-ecommerce/Gafas-de-sol.jpg";
import HombreGafas from "../../assets/resources-ecommerce/Gafas-hombre.jpg";
import  MujerGafas from "../../assets/resources-ecommerce/Gafas-mujer.jpg";
import GafasOpticos from "../../assets/resources-ecommerce/gafas-opticas.jpg";
import Discounts from "../../assets/resources-ecommerce/Promociones.jpg";

import FilterDiscounts from "../../assets/resources-ecommerce/opticas-mujer-gafas.jpg";
import FilterPrices from "../../assets/resources-ecommerce/mujer-gafas-opticas-colombia.jpg";

    const HomeEcomerce = () =>{
        const { t } = useTranslation(); // Usa useTranslation para obtener la función t
        // Constantes para controlar el login y el registro en el modal de usuarios
        const [ setShowLoginModal] = useState(false);

        // Control de rutas para el login admin
        const [userRole, setUserRole] = useState(null);

        const handleOpenLoginModal = () => setShowLoginModal(true);

        const navigate = useNavigate();

        useEffect(() => {
            // Método para obtener el token almacenado
            useAuthStore.getState().checkToken();
            const storedToken = useAuthStore.getState().token;
            setUserRole(storedToken ? 'admin' : null);
        }, []);

        const handleLogout = async () => {
            const token = useAuthStore.getState().token;  // Obtener el token almacenado en el frontend
            try {
                // Consumir la ruta del backend para invalidar el token
                const response = await axiosInstanceAuth(token).post('/logout');
                
                if (response.status === 200) {
                    // Si la respuesta es exitosa, eliminar el token del frontend
                    useAuthStore.getState().clearToken();
                    setUserRole(null);  // Reiniciar el rol del usuario
                    navigate('/');  // Redirigir al usuario a la página de inicio
                } else {
                    ShowErrorAlter("Error al cerrar sesión en el backend");
                }
            } catch (error) {
                ShowErrorAlter("Error al cerrar sesión", error);
            }
        };

        const handleNavigate = (gender) => {
            navigate(`/e-commerce/products/gender/${gender}`);
        };

        const handleNavigateDiscounts = (discountId) => {
            navigate(`/e-commerce/products/discounts/${discountId}`);
        };
        return (
            <div className="home-ecommerce">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
                isECommerce={true}
            />
            
            <Banners positionFilter={2} />

            <div className="ecommerce-elements-home">
            <div className="container-images-e-commerce">
                <div onClick={() => handleNavigate('Hombre')}>
                    <img src={HombreGafas} alt={t('ecommerce.hombre.alt')} />
                    <p>{t('ecommerce.hombre.label')}</p>
                </div>
                <div onClick={() => handleNavigate('Mujer')}>
                    <img src={MujerGafas} alt={t('ecommerce.mujer.alt')} />
                    <p>{t('ecommerce.mujer.label')}</p>
                </div>
                <div onClick={() => handleNavigate('Lentes de sol')}>
                    <img src={GafasSol} alt={t('ecommerce.lentesSol.alt')} />
                    <p>{t('ecommerce.lentesSol.label')}</p>
                </div>
                <div onClick={() => handleNavigate('Optico')}>
                    <img src={GafasOpticos} alt={t('ecommerce.optico.alt')} />
                    <p>{t('ecommerce.optico.label')}</p>
                </div>
            </div>
            <div className="discount-element">
                <div onClick={() => handleNavigateDiscounts(2)}>
                    <img src={Discounts} alt={t('ecommerce.discount.alt')} />
                </div>
            </div>
            <div className="filter-elements">
                <div>
                    <a href="/e-commerce/products/discounts">
                        <img src={FilterDiscounts} alt={t('ecommerce.filterDiscounts.alt')} />
                        <p>{t('ecommerce.filterDiscounts.label')}</p>
                    </a>
                </div>
                <div>
                    <a href="/e-commerce/products/price">
                        <img src={FilterPrices} alt={t('ecommerce.filterPrices.alt')} />
                        <p>{t('ecommerce.filterPrices.label')}</p>
                    </a>
                </div>
            </div>
        </div>
            <FooterComponent 
            handleOpenLoginModal={handleOpenLoginModal} 
            userRole={userRole}
            handleLogout={handleLogout}
            />
            </div>
        )
    };

    export default HomeEcomerce;