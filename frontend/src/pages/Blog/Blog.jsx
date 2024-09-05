import React,{useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent"
import {CustomModal} from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import useAuthStore from "../../components/store/userAuthToken";
import Blogcomponent from "../../components/network/Blog/BlogComponent";
import Layout from "../../routes/LayoutControl/Layouts";
import "./Blog.css"
import BannerPlus from "../../assets/bannersBurn/PLusssizeBanner.jpg"

const Blog = () => {
    // Constantes para controlar el login y el registro en el modal de usuarios
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

    return(
        <div className="blog-container">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
            />

            <div className="banner-blog">
                        <div>
                        <img src={BannerPlus} alt="banner blog" />
                            <p>Noticias</p>
                        </div>
                    </div>
            <div className="components-elements-blog">
            <Layout/>
                    <Blogcomponent view="blog" />
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

export default Blog;