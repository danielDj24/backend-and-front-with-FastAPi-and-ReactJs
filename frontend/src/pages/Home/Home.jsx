import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import Banners from "../../components/network/Banners/bannerscomponet";
import FooterComponent from "../../components/network/Footer/footerComponent";
import Blogcomponent from "../../components/network/Blog/BlogComponent";

import { CustomModal } from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import useAuthStore from "../../components/store/userAuthToken";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import VideoModal from "../../components/functions/VideoModal";

// estilos
import "./Home.css";

// assets
import HombreLentes from "../../assets/resources-home/gafas-diseño-hombre.jpg";
import MujerLentes from "../../assets/resources-home/Gafas-diseño-mujer.jpg";
import LentesSol from "../../assets/resources-home/gafas-sol-mujer.jpg";
import LentesOpticos from "../../assets/resources-home/gafas-opticas-hombre.jpg";

import BannerPlus from "../../assets/bannersBurn/Home-inventario-optica-framesgo.jpg";

import confiabilidad from "../../assets/resources-home/framesgo-confiabilidad.jpg";
import variedad from "../../assets/resources-home/gafas-lentes-variedad.jpg";
import flexibilidad from  "../../assets/resources-home/flexible-framesgo.jpg";
import acompañamiento from "../../assets/resources-home/framesgo-acompañamiento.jpg";
import videoThumbnail from "../../assets/bannersBurn/framesgo-frames-video-gafas.jpg";

const Home = () => {
    const { t } = useTranslation();  // Hook para la traducción
    const [activeForm, setActiveForm] = useState('login');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);

    const [userRole, setUserRole] = useState(null);

    const handleOpenLoginModal = () => setShowLoginModal(true);
    const handleCloseLoginModal = () => setShowLoginModal(false);

    useEffect(() => {
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
            title: t("Confiabilidad"),
            content: {
                h3: t("En FramesGo, nuestra prioridad es la confianza. Durante 14 años, hemos establecido relaciones sólidas con ópticas en toda Colombia y Latinoamérica, construyendo una reputación basada en la calidad y la integridad."),
                p: t("Cada una de nuestras monturas es cuidadosamente seleccionada para garantizar que cumple con los más altos estándares de la industria óptica, ofreciendo durabilidad, estilo y un rendimiento excepcional. Nuestro compromiso con la confiabilidad se extiende más allá de nuestros productos. Entendemos la importancia de la confianza en las relaciones comerciales, por lo que trabajamos arduamente para ser un socio en el que nuestros clientes pueden confiar. Desde la selección inicial hasta la entrega final, FramesGo está dedicado a proporcionar un servicio que nuestros socios pueden contar para el éxito continuo de su negocio."),
                img: confiabilidad
            }
        },
        {
            title: t("Variedad"),
            content: {
                h3: t("En FramesGo, creemos que la diversidad en opciones es clave para satisfacer las necesidades de nuestros clientes."),
                p: t("Es por eso que ofrecemos un catálogo extenso de monturas ópticas y de sol que abarca desde diseños clásicos hasta las últimas tendencias en moda. Cada modelo es seleccionado con cuidado para ofrecer opciones que se adapten a todos los estilos y preferencias, asegurando que nuestros socios siempre encuentren el producto perfecto para sus clientes. Nuestro catálogo se actualiza regularmente para mantenerse al día con las tendencias globales y las demandas del mercado. Ya sea que busques gafas de diseñador exclusivas o monturas accesibles y de alta calidad, FramesGo tiene la solución ideal para ti. La variedad es nuestra fortaleza, y estamos aquí para asegurarnos de que siempre tengas acceso a lo mejor del mercado óptico."),
                img: variedad
            }
        },
        {
            title: t("Flexibilidad"),
            content: {
                h3: t("Ofrecemos un catálogo extenso de monturas ópticas y de sol que abarca desde diseños clásicos hasta las últimas tendencias en moda."),
                p: t("Cada modelo es seleccionado con cuidado para ofrecer opciones que se adapten a todos los estilos y preferencias, asegurando que nuestros socios siempre encuentren el producto perfecto para sus clientes. Nuestro catálogo se actualiza regularmente para mantenerse al día con las tendencias globales y las demandas del mercado. Ya sea que busques gafas de diseñador exclusivas o monturas accesibles y de alta calidad, FramesGo tiene la solución ideal para ti. La variedad es nuestra fortaleza, y estamos aquí para asegurarnos de que siempre tengas acceso a lo mejor del mercado óptico."),
                img: flexibilidad
            }
        },
        {
            title: t("Acompañamiento"),
            content: {
                h3: t("En FramesGo, no solo vendemos Monturas, construimos relaciones."),
                p: t("Entendemos que cada socio tiene necesidades únicas, y estamos aquí para ofrecer el acompañamiento y asesoramiento que necesitas en cada etapa de tu compra. Desde ayudarte a seleccionar los productos que mejor se adapten a tu mercado, hasta garantizar que cada pedido llegue a tiempo y en perfectas condiciones, estamos contigo en cada paso del camino. Nuestro equipo de expertos está disponible para ofrecer orientación personalizada y soluciones adaptadas a tus requerimientos. Sabemos que el éxito de nuestros socios es nuestro éxito, por lo que nos dedicamos a brindar un servicio excepcional que va más allá de la simple transacción. Con FramesGo, siempre tendrás un aliado comprometido con tu satisfacción y el crecimiento de tu negocio."),
                img: acompañamiento
            }
        }
    ];

    const handlePlayVideo = () => {
        setShowVideoModal(true);
    };

    const handleCloseVideoModal = () => {
        setShowVideoModal(false);
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
                    <h1><strong>{t("FramesGo es su aliado confiable en Colombia, ofreciendo una amplia selección de gafas de diseñador con un enfoque en la calidad, moda y valor.")}</strong></h1>
                    <div className="container-images-variety">
                        <div>
                            <img src={HombreLentes} alt="Hombre con lentes" />
                            <p>{t("Marcos para Hombre")}</p>
                        </div>
                        <div>
                            <img src={MujerLentes} alt="Mujer con lentes" />
                            <p>{t("Marcos para Mujer")}</p>
                        </div>
                        <div>
                            <img src={LentesSol} alt="Lentes de sol" />
                            <p>{t("Lentes de sol")}</p>
                        </div>
                        <div>
                            <img src={LentesOpticos} alt="Lentes ópticos" />
                            <p>{t("Lentes Ópticos")}</p>
                        </div>
                    </div>
                    <h1><strong>{t("Con 14 años de experiencia, FramesGo lidera la distribución de monturas ópticas y de sol en Colombia, brindando a sus socios un servicio sin igual y productos de vanguardia.")}</strong></h1>
                </div>

                <div className="pluss-size-container">
                    <div>
                        <img src={BannerPlus} alt="pluss size" />
                        <p>{t("Todo el inventario en nuestra plataforma B2B está disponible para envío inmediato.")}</p>
                    </div>
                </div>

                <div className="experience-section">
                    <h2>{t("Nuestra experiencia")}</h2>
                    <div className="title-container-home">
                        <div className="titles-home">
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
                </div>

                <div className="video-section-banner">
                    <div className="video-container-banner">
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
                <VideoModal
                    show={showVideoModal}
                    handleClose={handleCloseVideoModal}
                    videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
                />

                <div className="blog-component-home">
                    <div className="content-blog-home">
                        <h1>{t("Noticias")}</h1>
                        <Blogcomponent view="home" />
                    </div>
                </div>
            </div>

            <CustomModal show={showLoginModal} handleClose={handleCloseLoginModal} title={t("Iniciar sesión")}>
                <div className="form-toggle"> 
                    <p
                        className={`form-toggle-item ${activeForm === 'login' ? 'active': ''}`}
                        onClick={() => setActiveForm('login')}
                    >
                        {t("Iniciar sesión")}
                    </p>
                    <p
                        className={`form-toggle-item ${activeForm === 'register' ? 'active':''}`}
                        onClick={() => setActiveForm('register')}
                    >
                        {t("Registrarse")}
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
