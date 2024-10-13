import React,{useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent"
import {CustomModal} from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import useAuthStore from "../../components/store/userAuthToken";
import Layout from "../../routes/LayoutControl/Layouts";
import { useTranslation } from "react-i18next";
//estilos
import './whatUs.css'

import BannerPlus from "../../assets/bannersBurn/framesgo-frames-video-gafas.jpg"
import ExampleImg from "../../assets/imgsBurn/example.jpg"

const WhatUs = () => {
    const {t} = useTranslation();
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
                    <p>{t('whyChooseFramesGo')}</p>
                </div>
            </div>
            <div className="what-us-elements">
                <Layout />
                <div className="what-us-content-container">
                    <div className="title-whatus">
                        <h1>{t('reliablePartnerTitle')}</h1>
                    </div>
                    <div className="content-what-us">
                        <div className="content-what-us-left">
                            <h2>{t('chooseFramesGo')}</h2>
                            <p>{t('marketExperience')}</p>
                            <p>{t('trustTransparency')}</p>
                        </div>
                        <div className="content-what-us-right">
                            <img src={ExampleImg} alt="example-img" />
                        </div>
                        <div className="content-what-us-right">
                            <img src={ExampleImg} alt="example-img" />
                        </div>
                        <div className="content-what-us-left">
                            <h2>{t('diverseOffering')}</h2>
                            <p>{t('globalPartners')}</p>
                            <p>{t('personalizedSupport')}</p>
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