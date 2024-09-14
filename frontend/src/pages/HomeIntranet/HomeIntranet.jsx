import React, {useState,useEffect} from "react";

//estilos
import './homeIntranet.css'
import BannerPlus from "../../assets/bannersBurn/framesgo-frames-video-gafas.jpg"
import ExampleImg from "../../assets/imgsBurn/intranetexample.jpg"
import Layout from "../../routes/LayoutControl/Layouts";


import {CustomModal} from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import useAuthStore from "../../components/store/userAuthToken";

const Intranet = () => {
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
        <div className="intranet-container">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
                isECommerce={true}

            />

            <div className="banner-intranet">
                <div>
                    <img src={BannerPlus} alt="banner intranet" />
                    <p>Bienvenido a la intranet</p>
                </div>
            </div>
            <div className="intranet-elements-container">
            <Layout/>
                <div className="container-intranet-control">
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/control/users" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Usuarios</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/banners" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Banners</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/brands" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Marcas</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/edit/configsite" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Configuraciones</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/notices" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Noticias</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/products" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Productos</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/shapes" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Formas</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/discounts" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Descuentos</button>
                            </a>
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

        </div>
    );
};

export default Intranet;