import React,{useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent"
import {CustomModal} from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import useAuthStore from "../../components/store/userAuthToken";
import { useTranslation } from "react-i18next";

//estilos
import BannerAboutus from "../../assets/bannersBurn/framesgo-lentes-azules-tigre.jpg"
import Img1Aboutus from "../../assets/imgsBurn/framesgo-lentes-opticas-inventario.jpg"
import Img2Aboutus from "../../assets/imgsBurn/lentes-tendencia-rojo-framesgo.jpg"
import Layout from "../../routes/LayoutControl/Layouts";
import './aboutUs.css'

const AboutUs = () => {
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
        <div className="about-us-container">
                <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
                />
                <div className="banner-about-us">
                <div>
                    <img src={BannerAboutus} alt="banner Aboutus" />
                    <p>{t('aboutUs.banner.description')}</p>
                </div>
                </div>
                <div className="about-us-elements">
                <Layout />
                <div className="our-company-container">
                    <div className="title-company">
                    <h1>{t('aboutUs.company.title')}</h1>
                    </div>
                    <div className="content-our-company">
                    <div className="content-company-left">
                        <h2>{t('aboutUs.company.content.0')}</h2>
                        <p>{t('aboutUs.company.content.1')}</p>
                        <p>{t('aboutUs.company.content.2')}</p>
                    </div>
                    <div className="content-company-right">
                        <img src={Img1Aboutus} alt="example-img" />
                    </div>
                    </div>
                </div>
                <div className="our-company-container">
                    <div className="title-company">
                    <h1>{t('aboutUs.company.quality.title')}</h1>
                    </div>
                    <div className="content-our-company">
                    <div className="content-company-left">
                        <h2>{t('aboutUs.company.quality.content.0')}</h2>
                        <p>{t('aboutUs.company.quality.content.1')}</p>
                        <p>{t('aboutUs.company.quality.content.2')}</p>
                    </div>
                    <div className="content-company-right">
                        <img src={Img2Aboutus} alt="example-img" />
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

export default AboutUs;
