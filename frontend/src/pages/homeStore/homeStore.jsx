import React, {useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import Banners from "../../components/network/Banners/bannerscomponet";
import FooterComponent from "../../components/network/Footer/footerComponent"
import { useNavigate } from "react-router-dom";


import useAuthStore from "../../components/store/userAuthToken";



import './homeStore.css'
import GafasSol from "../../assets/resources-ecommerce/Gafas-de-sol.jpg";
import HombreGafas from "../../assets/resources-ecommerce/Gafas-hombre.jpg";
import  MujerGafas from "../../assets/resources-ecommerce/Gafas-mujer.jpg";
import GafasOpticos from "../../assets/resources-ecommerce/gafas-opticas.jpg";
import Discounts from "../../assets/resources-ecommerce/Promociones.jpg";

import FilterDiscounts from "../../assets/resources-ecommerce/opticas-mujer-gafas.jpg";
import FilterPrices from "../../assets/resources-ecommerce/mujer-gafas-opticas-colombia.jpg";

    const HomeEcomerce = () =>{
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

        const handleLogout = () => {
            useAuthStore.getState().clearToken();
            setUserRole(null);
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
                        <img src={HombreGafas} alt="Hombre con Gafas" />
                        <p>Hombre</p>
                    </div>
                    <div onClick={() => handleNavigate('Mujer')}>
                        <img src={MujerGafas} alt="Mujer con Gafas" />
                        <p>Mujer</p>
                    </div>
                    <div onClick={() => handleNavigate('Lentes de sol')}>
                        <img src={GafasSol} alt="Gafas de sol" />
                        <p>Lentes de sol</p>
                    </div>
                    <div onClick={() => handleNavigate('Optico')}>
                        <img src={GafasOpticos} alt="Lentes ópticos" />
                        <p>Lentes Ópticos</p>
                    </div>
                </div>
                <div className="discount-element">
                    <div onClick={() => handleNavigateDiscounts(3)}>
                        <img src={Discounts} alt="discount" />
                    </div>
                </div>
                <div className="filter-elements">
                    <div>
                        <a href="/e-commerce/products/discounts">
                        <img src={FilterDiscounts} alt="filter discounts" />
                            <p>En descuento</p>
                        </a>
                    </div>
                    <div>
                        <a href="/intranet/config/edit/configsite">
                        <img src={FilterPrices} alt="filter prices" />
                            <p>Más económico</p>
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