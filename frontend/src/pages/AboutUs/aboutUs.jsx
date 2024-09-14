import React,{useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent"
import {CustomModal} from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import useAuthStore from "../../components/store/userAuthToken";


//estilos
import BannerPlus from "../../assets/bannersBurn/framesgo-frames-video-gafas.jpg"
import ExampleImg from "../../assets/imgsBurn/example.jpg"
import Layout from "../../routes/LayoutControl/Layouts";
import './aboutUs.css'

const AboutUs = () => {
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
                <img src={BannerPlus} alt="banner Aboutus" />
                    <p>Mas de dos decadas en la distribucion de marcos para lentes</p>
                </div>
            </div>

            <div className="about-us-elements">
            <Layout/>
                <div className="our-company-container">
                    <div className="title-company">
                        <h1>Nuestra compañia</h1>
                    </div>
                    <div className="content-our-company">
                        <div className="content-company-left">
                            <h2>Con 14 años de experiencia, Frames se ha establecido como un referente en la distribución de monturas ópticas y de sol en Colombia.  </h2>
                            <p>Desde nuestros inicios, hemos recorrido todo el país, llevando productos de alta calidad directamente a las ópticas locales. Nuestro compromiso con la excelencia nos ha permitido construir una sólida presencia en el mercado nacional</p>
                            <p>A lo largo de estos años, hemos forjado relaciones de confianza con ópticas en las principales ciudades de Colombia. Cada visita ha fortalecido nuestra reputación como un socio confiable, dedicado a ofrecer soluciones personalizadas que ayuden a nuestros clientes a crecer y prosperar en el competitivo mercado óptico.</p>
                        </div>
                        <div className="content-company-right">
                            <img  src={ExampleImg} alt="exaple-img" /> 
                        </div>
                    </div>
                </div>
                <div className="our-company-container">
                    <div className="title-company">
                        <h1>Confianza en cada montura, calidad en cada detalle.</h1>
                    </div>
                    <div className="content-our-company">
                        <div className="content-company-left">
                            <h2>Además, hemos expandido nuestras operaciones más allá de las fronteras, creando alianzas estratégicas con empresas en Estados Unidos. </h2>
                            <p>Estas colaboraciones nos han permitido incorporar nuevas tendencias y tecnologías a nuestro catálogo, beneficiando a nuestros clientes con una oferta más diversa y avanzada.</p>
                            <p>Nuestro objetivo es convertirnos en una de las principales distribuidoras de gafas para ópticas en Colombia. Con una trayectoria que respalda nuestra credibilidad y una visión enfocada en el crecimiento, estamos comprometidos a seguir liderando el mercado óptico del país.</p>
                        </div>
                        <div className="content-company-right">
                            <img  src={ExampleImg} alt="exaple-img" /> 
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
