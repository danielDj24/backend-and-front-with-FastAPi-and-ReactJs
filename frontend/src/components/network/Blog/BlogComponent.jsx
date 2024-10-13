import React, { useEffect, useState } from "react";
import { axiosInstance, resourcesInstance } from "../../functions/axiosConfig";
import { Route, Routes, useParams } from "react-router-dom";

import { CustomModal } from "../../functions/CustomModal";
import Layout from "../../../routes/LayoutControl/Layouts";
import useAuthStore from "../../store/userAuthToken";
import MenuComponent from "../Menu/MenuComponent";
import FooterComponent from "../Footer/footerComponent";
import Login from "../Login/Login";
import Register from "../Register/Register";
import { useTranslation } from "react-i18next"; // Importa useTranslation
import "./Blogcomponent.css";


const DetailViewComponent = () => {
    const { t } = useTranslation(); // Inicializa la traducción
    const { noticeId } = useParams();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState(null);
    const [activeForm, setActiveForm] = useState('login');
    const [showLoginModal, setShowLoginModal] = useState(false);

    const fetchNotice = async () => {
        try {
            const response = await axiosInstance.get(`/data/notice/${noticeId}`);
            setNotice(response.data);
        } catch (error) {
            setError(error.response ? error.response.data.detail : t("error"));
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchNotice();
    }, [noticeId]);

    if (loading) return <p>{t("cargando")}</p>;
    if (error) return <p>{error}</p>;
    if (!notice) return <p>{t("noticia_no_encontrada")}</p>;

    return (
        <div className="detailed-view">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={() => useAuthStore.getState().clearToken()}
                isECommerce={false}
            />
            <div className="banner-detail-container">
                <img
                    src={`${resourcesInstance.defaults.baseURL}${notice.img_notice}`}
                    alt={notice.img_notice}
                    className="banner-detail-notice-img"
                />
            </div>
            <div className="view-notice-content-detail">
                <Layout />
                <div className="notice-info-top">
                    <p>{t("fecha")}: {new Date(notice.date).toLocaleDateString()}</p>
                    <p className="notice-categorie">t{notice.categorie}</p>
                </div>
                <h1>t{notice.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: notice.notice_content }} />
            </div>
            <CustomModal show={showLoginModal} handleClose={handleCloseLoginModal} title={t("iniciar_sesion")}>
                <div className="form-toggle"> 
                    <p
                        className={`form-toggle-item ${activeForm === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveForm('login')}
                    >
                        {t("iniciar_sesion")}
                    </p>
                    <p
                        className={`form-toggle-item ${activeForm === 'register' ? 'active' : ''}`}
                        onClick={() => setActiveForm('register')}
                    >
                        {t("registrarse")}
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

const BlockViewComponent = ({ notices }) => {
    const { t } = useTranslation(); // Inicializa la traducción
    const limitedNotices = notices.slice(0, 3);

    return (
        <div className="blog-block-view">
            <div className="block-view">
                {limitedNotices.map((notice) => (
                    <div className="notice-block" key={notice.id}>
                        <img
                            src={`${resourcesInstance.defaults.baseURL}${notice.img_notice}`}
                            alt={notice.img_notice}
                            className="notice-img-block"
                        />
                        <div className="notice-content">
                            <h2>{notice.title}</h2>
                            <p>{t("fecha")}: {new Date(notice.date).toLocaleDateString()}</p>
                            <button
                                onClick={() => window.open(`/notice/${notice.id}`, '_blank')}
                                className="read-more-button"
                            >
                                {t("ver_mas")}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Blogcomponent = ({ view }) => {
    const { t } = useTranslation(); // Inicializa la traducción
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotices = async () => {
        try {
            const response = await axiosInstance.get("/data/notice");
            setNotices(response.data);
        } catch (error) {
            setError(error.response ? error.response.data.detail : "Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    if (loading) return <p>{t("cargando")}</p>;
    if (error) return <p>{error}</p>;

    return (
        <Routes>
            {view === "detail" && <Route path=":noticeId" element={<DetailViewComponent />} />}
            {(view === "home" || view === "blog") && <Route path="/" element={<BlockViewComponent notices={notices} />} />}
        </Routes>   
    );
};

export default Blogcomponent;