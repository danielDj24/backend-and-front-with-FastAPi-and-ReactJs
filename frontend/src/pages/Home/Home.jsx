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
import HombreLentes from "../../assets/resources-home/hombre_con_lentes.jpg";
import MujerLentes from "../../assets/resources-home/mujer-gafas.jpg";
import LentesSol from "../../assets/resources-home/lentes-sol.jpg";
import LentesOpticos from "../../assets/resources-home/lentes-opticos.jpg";
import BannerPlus from "../../assets/bannersBurn/framesgo-gafas-colombia-B2B.jpg";
import confiabilidad from "../../assets/resources-home/lentes-opticos.jpg";
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
                h3: t("En FramesGo, hemos cultivado relaciones basadas en la confianza con ópticas en Colombia y Latinoamérica por más de 14 años."),
                p: t("En cada relación, comenzamos con una comunicación abierta y la meta compartida de prosperar juntos. Cada montura es cuidadosamente seleccionada para cumplir con los más altos estándares."),
                img: confiabilidad
            }
        },
        {
            title: t("Variedad"),
            content: {
                h3: t("En FramesGo, ofrecemos un catálogo amplio de monturas ópticas y de sol."),
                p: t("Cada montura es cuidadosamente seleccionada para adaptarse a todos los estilos y preferencias. Actualizamos continuamente nuestra oferta para mantenernos al día."),
                img: LentesSol
            }
        },
        {
            title: t("Flexibilidad"),
            content: {
                h3: t("Ofrecemos una plataforma de e-commerce intuitiva y eficiente."),
                p: t("Nuestra tienda en línea está pensada para ofrecer una experiencia de compra ágil y sin complicaciones."),
                img: MujerLentes
            }
        },
        {
            title: t("Acompañamiento"),
            content: {
                h3: t("No solo vendemos gafas, sino que construimos relaciones sólidas."),
                p: t("Te ayudamos a seleccionar los productos adecuados para tu mercado y aseguramos que cada pedido llegue a tiempo."),
                img: LentesOpticos
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
                    <h1><strong>{t("FramesGo es su aliado confiable en Colombia, ofreciendo una amplia selección de gafas de diseñador.")}</strong></h1>
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
                    <h3>{t("Con 14 años de experiencia, FramesGo lidera la distribución de monturas ópticas y de sol en Colombia.")}</h3>
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
