import React, {useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import Banners from "../../components/network/Banners/bannerscomponet";
import FooterComponent from "../../components/network/Footer/footerComponent"
import Blogcomponent from "../../components/network/Blog/BlogComponent";

import {CustomModal} from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import useAuthStore from "../../components/store/userAuthToken";
import BrandsComponent from "../../components/network/Brands/brandsComponent" 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

//estilos
import "./Home.css"

//assets
import HombreLentes from "../../assets/hombre_con_lentes.jpg";
import MujerLentes from "../../assets/mujer-gafas.jpg";
import LentesSol from "../../assets/lentes-sol.jpg";
import LentesOpticos from "../../assets/lentes-opticos.jpg";
import BannerPlus from "../../assets/bannersBurn/PLusssizeBanner.jpg"
import confiabilidad from "../../assets/lentes-opticos.jpg"
import videoThumbnail from "../../assets/bannersBurn/PLusssizeBanner.jpg";

const Home = () => {
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

    const [activeTitle, setActiveTitle] = useState(0);
    
    const titleContents = [
        {
            title: "Confiabilidad",
            content: {
            h3: "A lo largo de dos décadas, hemos desarrollado relaciones de confianza con más de 1000 clientes y 100 marcas en todo el mundo.",
            p: "Comenzamos cada sociedad con comunicación transparente y una meta compartida para crecer juntos, lo que nos ha permitido fomentar relaciones con nuestros clientes a largo plazo y mantener un alto índice de retención de nuestras relaciones. Al entender el modelo de negocios único de cada marca y nuestra investigación profunda de antecedentes de nuestros clientes, podemos evitar colocación conflictiva de productos y distribuir solo a clientes que están dentro de los límites de las solicitudes de nuestros vendedores.",
            img: confiabilidad
            }
        },
        {
            title: "Variedad",
            content: {
            h3: "A lo largo de dos décadas, hemos desarrollado relaciones de confianza con más de 1000 clientes y 100 marcas en todo el mundo.",
            p: "Comenzamos cada sociedad con comunicación transparente y una meta compartida para crecer juntos, lo que nos ha permitido fomentar relaciones con nuestros clientes a largo plazo y mantener un alto índice de retención de nuestras relaciones. Al entender el modelo de negocios único de cada marca y nuestra investigación profunda de antecedentes de nuestros clientes, podemos evitar colocación conflictiva de productos y distribuir solo a clientes que están dentro de los límites de las solicitudes de nuestros vendedores.",
            img: LentesSol
            }
        },
        {
            title: "Flexibilidad",
            content: {
            h3: "A lo largo de dos décadas, hemos desarrollado relaciones de confianza con más de 1000 clientes y 100 marcas en todo el mundo.",
            p: "Comenzamos cada sociedad con comunicación transparente y una meta compartida para crecer juntos, lo que nos ha permitido fomentar relaciones con nuestros clientes a largo plazo y mantener un alto índice de retención de nuestras relaciones. Al entender el modelo de negocios único de cada marca y nuestra investigación profunda de antecedentes de nuestros clientes, podemos evitar colocación conflictiva de productos y distribuir solo a clientes que están dentro de los límites de las solicitudes de nuestros vendedores.",
            img: MujerLentes
            }
        },
        {
            title: "Acompañamiento",
            content: {
            h3: "A lo largo de dos décadas, hemos desarrollado relaciones de confianza con más de 1000 clientes y 100 marcas en todo el mundo.",
            p: "Comenzamos cada sociedad con comunicación transparente y una meta compartida para crecer juntos, lo que nos ha permitido fomentar relaciones con nuestros clientes a largo plazo y mantener un alto índice de retención de nuestras relaciones. Al entender el modelo de negocios único de cada marca y nuestra investigación profunda de antecedentes de nuestros clientes, podemos evitar colocación conflictiva de productos y distribuir solo a clientes que están dentro de los límites de las solicitudes de nuestros vendedores.",
            img: LentesOpticos
            }
        }
    ]

        const handlePlayVideo = () => {
            const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";
            window.open(videoUrl, '_self');
        };
    
    
    return (
        <div className="home-container">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
            />
                <Banners positionFilter={1} />
                <div className="components-elements-home">
                    <div className="information-container">
                        <h1><strong>Frames. es un distribuidor global impulsado a la venta en volumen de gafas de diseñador.</strong></h1>
                        <h3>Con una cartera diversa de más de 100 marcas que van desde colecciones de alta gama hasta líneas de moda actuales, NYWD Inc. es un socio confiable para la distribución mundial de anteojos.</h3>
                        <div className="container-images-variety">
                            <div>
                                <img src={HombreLentes} alt="Hombre con lentes" />
                                <p>Marcos para Hombre</p>
                            </div>
                            <div>
                                <img src={MujerLentes} alt="Mujer con lentes" />
                                <p>Marcos para Mujer</p>
                            </div>
                            <div>
                                <img src={LentesSol} alt="Lentes de sol" />
                                <p>Lentes de sol</p>
                            </div>
                            <div>
                                <img src={LentesOpticos} alt="Lentes ópticos" />
                                <p>Lentes Ópticos</p>
                            </div>
                        </div>
                        <h3>Frames. es un distribuidor global impulsado a la venta en volumen de gafas de diseñador.</h3>
                    </div>
                    <div className="pluss-size-container">
                        <div>
                        <img src={BannerPlus} alt="pluss size" />
                                <p>Todo el inventario en nuestra plataforma B2B está disponible para envío inmediato, lo que ofrece a nuestros clientes un proceso de pedido simple, fluido y oportuno.</p>
                        </div>
                    </div>

                    <div className="experience-section">
                        <h2>Nuestra experiencia</h2>
                        <div className="title-container">
                            <div className="titles">
                                {titleContents.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`title ${activeTitle === index ? 'active' : ''}`} 
                                        onClick={() => setActiveTitle(index)}
                                    >
                                        {item.title}
                                    </div>
                                ))}
                            </div>
                            <div className="content">
                                <div className="content-left">
                                    <h3>{titleContents[activeTitle].content.h3}</h3>
                                    <p>{titleContents[activeTitle].content.p}</p>
                                </div>
                                <div className="content-right">
                                    <img src={titleContents[activeTitle].content.img} alt={titleContents[activeTitle].title} />
                                </div>
                            </div>
                        </div>
                    </div>{/*  elemento carousel */}
                    
                    <div className="video-section">
                        <div className="video-container">
                            <img
                                src={videoThumbnail}
                                alt="Video Thumbnail"
                                className="video-thumbnail"
                                onClick={handlePlayVideo}
                            />
                            <button className="play-button" onClick={handlePlayVideo}>
                                <FontAwesomeIcon icon={faPlay} />
                            </button>
                        </div>
                    </div>
                                    
                    <div className="blog-component-home">
                        <div className="content-blog-home">
                        <h1>Noticias</h1>
                        <Blogcomponent view="home"/>
                        </div>
                    </div>

                </div>{/*div final styles home   */}
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

export default Home;
