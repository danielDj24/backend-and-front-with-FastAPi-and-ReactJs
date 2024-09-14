import React, {useState,useEffect} from "react";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import Banners from "../../components/network/Banners/bannerscomponet";
import FooterComponent from "../../components/network/Footer/footerComponent"
import Blogcomponent from "../../components/network/Blog/BlogComponent";

import {CustomModal} from "../../components/functions/CustomModal";
import Login from "../../components/network/Login/Login";
import Register from "../../components/network/Register/Register";
import useAuthStore from "../../components/store/userAuthToken";
// import BrandsComponent from "../../components/network/Brands/brandsComponent" 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import VideoModal from "../../components/functions/VideoModal";
//estilos
import "./Home.css"

//assets
import HombreLentes from "../../assets/resources-home/hombre_con_lentes.jpg";
import MujerLentes from "../../assets/resources-home/mujer-gafas.jpg";
import LentesSol from "../../assets/resources-home/lentes-sol.jpg";
import LentesOpticos from "../../assets/resources-home/lentes-opticos.jpg";
import BannerPlus from "../../assets/bannersBurn/framesgo-gafas-colombia-B2B.jpg"
import confiabilidad from "../../assets/resources-home/lentes-opticos.jpg"
import videoThumbnail from "../../assets/bannersBurn/framesgo-frames-video-gafas.jpg";

const Home = () => {
    // Constantes para controlar el login y el registro en el modal de usuarios
    const [activeForm, setActiveForm] = useState('login');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);

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
            h3: "En FramesGo, hemos cultivado relaciones basadas en la confianza con ópticas en Colombia y Latinoamérica por más de 14 años, destacando calidad y compromiso.",
            p: "En cada relación, comenzamos con una comunicación abierta y la meta compartida de prosperar juntos. Cada montura es cuidadosamente seleccionada para cumplir con los más altos estándares de calidad, asegurando estilo, durabilidad y rendimiento. Más allá de los productos, sabemos que la confianza es clave en las relaciones comerciales, por lo que nos esforzamos por ser un socio confiable. Desde la selección inicial hasta la entrega, nuestro compromiso es ofrecer un servicio excepcional que contribuya al éxito continuo de nuestros clientes.",
            img: confiabilidad
            }
        },
        {
            title: "Variedad",
            content: {
            h3: "En FramesGo, ofrecemos un catálogo amplio de monturas ópticas y de sol, con diseños clásicos y modernos, con el fin de satisfacer las diversas necesidades del mercado.",
            p: "Cada montura es cuidadosamente seleccionada para adaptarse a todos los estilos y preferencias de los clientes de nuestros socios. Nuestro catálogo incluye desde las últimas tendencias en moda hasta modelos clásicos, lo que asegura que siempre haya una opción perfecta. Además, actualizamos continuamente nuestra oferta para mantenernos al día con las demandas del mercado y las tendencias globales.",
            img: LentesSol
            }
        },
        {
            title: "Flexibilidad",
            content: {
            h3: "En FramesGo, ofrecemos una plataforma de e-commerce intuitiva y eficiente, diseñada para satisfacer las necesidades del mercado y facilitar tus compras.",
            p: "Nuestra tienda en línea está pensada para ofrecer una experiencia de compra ágil y sin complicaciones. Con ella, puedes acceder a nuestro catálogo completo, gestionar pedidos fácilmente y realizar compras desde cualquier lugar, en cualquier momento. Además, contamos con herramientas integradas que te permiten hacer seguimiento de tus pedidos y disfrutar de opciones de pago flexibles. El soporte técnico continuo garantiza que siempre tengas la asistencia que necesitas.",
            img: MujerLentes
            }
        },
        {
            title: "Acompañamiento",
            content: {
            h3: "En FramesGo, no solo vendemos gafas, sino que construimos relaciones sólidas, ofreciendo asesoramiento personalizado y apoyo en cada etapa de tu compra.",
            p: "Entendemos que cada socio tiene necesidades únicas y estamos aquí para acompañarte en cada paso. Te ayudamos a seleccionar los productos adecuados para tu mercado y aseguramos que cada pedido llegue a tiempo y en perfectas condiciones. En FramesGo, nos dedicamos a proporcionar un servicio excepcional que va más allá de una simple transacción. Creemos que tu éxito es nuestro éxito, y estamos aquí para ser un aliado constante en el crecimiento de tu negocio.",
            img: LentesOpticos
            }
        }
    ]

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
                        <h1><strong>FramesGo es su aliado confiable en Colombia, ofreciendo una amplia selección de gafas de diseñador con un enfoque en la calidad, moda y valor.</strong></h1>
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
                        <h3>Con 14 años de experiencia, FramesGo lidera la distribución de monturas ópticas y de sol en Colombia, brindando a sus socios un servicio sin igual y productos de vanguardia.</h3>
                    </div>
                    <div className="pluss-size-container">
                        <div>
                        <img src={BannerPlus} alt="pluss size" />
                                <p>Todo el inventario en nuestra plataforma B2B está disponible para envío inmediato, lo que ofrece a nuestros clientes un proceso de pedido simple, fluido y oportuno.</p>
                        </div>
                    </div>

                    <div className="experience-section">
                        <h2>Nuestra experiencia</h2>
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
                    </div>{/*  elemento carousel */}
                    
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
