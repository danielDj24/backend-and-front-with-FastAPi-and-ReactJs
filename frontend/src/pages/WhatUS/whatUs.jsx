import React,{useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent"
import {CustomModal} from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import useAuthStore from "../../components/store/userAuthToken";


//estilos
import './whatUs.css'

import BannerPlus from "../../assets/bannersBurn/PLusssizeBanner.jpg"
import ExampleImg from "../../assets/imgsBurn/example.jpg"

const WhatUs = () => {
    const [activeForm, setActiveForm] = useState('login');
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Control de rutas para el login admin
    const [userRole, setUserRole] = useState(null);

    const handleOpenLoginModal = () => setShowLoginModal(true);
    const handleCloseLoginModal = () => setShowLoginModal(false);

    useEffect(() => {
        // Método para obtener el token almacenado
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null);
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
        <div className="what-us-container">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
            />
            <div className="banner-what-us">
                <div>
                <img src={BannerPlus} alt="banner WhatUS" />
                    <p>¿Por que elegir frames como tu distribuidora?</p>
                </div>
            </div>
            <div className="what-us-elements">
                <div className="what-us-content-container">
                    <div className="title-whatus">
                        <h1>Frames. es un distribuidor global impulsado a la venta en volumen de gafas de diseñador.</h1>
                    </div>
                    <div className="content-what-us">
                        <div className="content-what-us-left">
                            <h2>A lo largo de dos décadas, hemos desarrollado relaciones de confianza con más de 1000 clientes y 100 marcas en todo el mundo. </h2>
                            <p>Comenzamos cada sociedad con comunicación transparente y una meta compartida para crecer juntos, lo que nos ha permitido fomentar relaciones con nuestros clientes a largo plazo y mantener un alto índice de retención de nuestras relaciones.</p>
                            <p>Al entender el modelo de negocios único de cada marca y nuestra investigación profunda de antecedentes de nuestros clientes, podemos evitar colocación conflictiva de productos y distribuir solo a clientes que están dentro de los límites de las solicitudes de nuestros vendedores.</p>
                        </div>
                        <div className="content-what-us-right">
                            <img  src={ExampleImg} alt="exaple-img" /> 
                        </div>
                        <div className="content-what-us-right">
                            <img  src={ExampleImg} alt="exaple-img" /> 
                        </div>
                        <div className="content-what-us-left">
                            <h2>A lo largo de dos décadas, hemos desarrollado relaciones de confianza con más de 1000 clientes y 100 marcas en todo el mundo. </h2>
                            <p>Comenzamos cada sociedad con comunicación transparente y una meta compartida para crecer juntos, lo que nos ha permitido fomentar relaciones con nuestros clientes a largo plazo y mantener un alto índice de retención de nuestras relaciones.</p>
                            <p>Al entender el modelo de negocios único de cada marca y nuestra investigación profunda de antecedentes de nuestros clientes, podemos evitar colocación conflictiva de productos y distribuir solo a clientes que están dentro de los límites de las solicitudes de nuestros vendedores.</p>
                        </div>
                        
                    </div>
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
                        onClick={() => setActiveForm('register')}
                    >
                        Registrarse
                    </p>
                </div>
                {activeForm === 'login' ? <Login onLoginSuccess={handleLoginSuccess} /> : <Register onRegisterSuccess={handleCloseLoginModal} />}
            </CustomModal>

            <FooterComponent 
                handleOpenLoginModal={handleOpenLoginModal} 
                userRole={userRole}
                handleLogout={handleLogout}
            />
            </div>
    );
};

export default WhatUs;