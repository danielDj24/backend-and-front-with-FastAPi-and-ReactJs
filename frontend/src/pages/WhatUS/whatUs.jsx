import React,{useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent"
import {CustomModal} from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import useAuthStore from "../../components/store/userAuthToken";
import Layout from "../../routes/LayoutControl/Layouts";

//estilos
import './whatUs.css'

import BannerPlus from "../../assets/bannersBurn/framesgo-frames-video-gafas.jpg"
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
                    <p>¿Por que elegir FramesGo como tu distribuidora?</p>
                </div>
            </div>
            <div className="what-us-elements">
            <Layout/>
                <div className="what-us-content-container">
                    <div className="title-whatus">
                        <h1>Tu socio confiable en moda óptica, siempre a la vanguardia.</h1>
                    </div>
                    <div className="content-what-us">
                        <div className="content-what-us-left">
                            <h2>Elegir a FramesGo como su distribuidor significa optar por más de una década de experiencia en el mercado óptico.  </h2>
                            <p>Con 14 años de trayectoria, conocemos las necesidades y desafíos que enfrentan las ópticas en Colombia. Nos dedicamos a ofrecer productos que no solo cumplen con los más altos estándares de calidad, sino que también están en sintonía con las últimas tendencias de moda y tecnología. En FramesGo, la confianza es fundamental.</p>
                            <p>Hemos construido relaciones duraderas con ópticas en todo el país, basadas en la transparencia y el compromiso mutuo. Nos aseguramos de que cada pedido se maneje con la máxima atención al detalle, desde la selección de los productos hasta la entrega final, garantizando que nuestros clientes siempre reciban lo mejor.</p>
                        </div>
                        <div className="content-what-us-right">
                            <img  src={ExampleImg} alt="exaple-img" /> 
                        </div>
                        <div className="content-what-us-right">
                            <img  src={ExampleImg} alt="exaple-img" /> 
                        </div>
                        <div className="content-what-us-left">
                            <h2>Nuestra oferta es diversa y está en constante evolución, lo que nos permite adaptarnos rápidamente a las cambiantes demandas del mercado.</h2>
                            <p>Trabajamos con proveedores de renombre y colaboramos con empresas internacionales para asegurar que nuestros clientes tengan acceso a las monturas más innovadoras y de alta calidad disponibles. Finalmente, en FramesGo creemos en el acompañamiento continuo.</p>
                            <p>No solo somos un proveedor, sino un socio que está ahí en cada paso del camino, ofreciendo asesoramiento personalizado, soporte y soluciones adaptadas a las necesidades de cada óptica. Con FramesGo, usted tiene la tranquilidad de contar con un aliado confiable que se preocupa por el éxito de su negocio.</p>
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