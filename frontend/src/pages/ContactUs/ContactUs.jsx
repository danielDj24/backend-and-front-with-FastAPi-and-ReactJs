import React, { useState, useEffect } from "react";
import { axiosInstance, axiosInstanceAuth } from "../../components/functions/axiosConfig";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";
import useAuthStore from "../../components/store/userAuthToken";
import { useNavigate } from 'react-router-dom';
import { ShowErrorAlter,ShowSuccesAlert } from "../../components/functions/Alerts";

import './ContactUs.css';
// Assets
import WhatsappIcon from "../../assets/icons/whatsapp.svg";
import MailIcon from "../../assets/icons/mail-icon.svg";
import LocationIcon from "../../assets/icons/location-icon.svg";

const ContactUs = () => {
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, checkToken } = useAuthStore();
    const navigate = useNavigate();

    const [setShowLoginModal] = useState(false);
    const [userRole, setUserRole] = useState(null);

    const handleOpenLoginModal = () => setShowLoginModal(true);

    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        company: "",
        email: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault(); 
    
        try {
            const response = await axiosInstance.post("/contact", formData);
            if (response.status === 200) {
                ShowSuccesAlert("Mensaje enviado correctamente");
                setFormData({ name: "",lastName:"", company: "", email: "", message: "" }); 
            }
        } catch (error) {
            ShowErrorAlter("Hubo un error al enviar el mensaje. Inténtalo de nuevo.");
        }
    };
    
    useEffect(() => {
        checkToken();
    }, [checkToken]);

    const handleLogout = async () => {
        const token = useAuthStore.getState().token;
        try {
            const response = await axiosInstanceAuth(token).post('/logout');

            if (response.status === 200) {
                useAuthStore.getState().clearToken();
                setUserRole(null);
                navigate('/');
            } else {
                ShowErrorAlter("Error al cerrar sesión en el backend");
            }
        } catch (error) {
            ShowErrorAlter("Error al cerrar sesión", error);
        }
    };

    const fetchConfigSite = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/config");
            const { whatsapp_link, contact_email, contact_phone, address } = response.data;
            setWhatsappLink(whatsapp_link);
            setContactEmail(contact_email);
            setContactPhone(contact_phone);
            setAddress(address);
        } catch (error) {
            setError(error.response ? error.response.data.detail : "Error fetching config");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigSite();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="contact-us">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
                isECommerce={true}
            />
            <div className="contact-us-background-container">
                <div className="contact-us-elements">
                    <div className="contact-us-title">
                        <h1>Contáctanos</h1>
                    </div>
                    <div className="contact-us-info">
                        {/* Información de contacto - Lado derecho */}
                        <div className="contact-us-right-info">
                            <div className="contact-us-right-info-title">
                                <h2>Nuestros canales de comunicación</h2>
                            </div>
                            <div className="contact-us-right-info-content">
                                <div className="contact-us-whatsapp">
                                    <img src={WhatsappIcon} alt="WhatsApp Icon" className="whatsapp-icon" />
                                    <div>
                                        <h3>WhatsApp</h3>
                                        <p>
                                            {whatsappLink ? (
                                                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                                    {contactPhone}
                                                </a>
                                            ) : (
                                                contactPhone
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {/* Email Info */}
                                <div className="contact-us-email">
                                    <img src={MailIcon} alt="Mail Icon" className="mail-icon" />
                                    <div>
                                        <h3>Email</h3>
                                        <p>
                                            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                                        </p>
                                    </div>
                                </div>
                                <div className="contact-us-location">
                                    <img src={LocationIcon} alt="Location Icon" className="location-icon" />
                                    <div>
                                        <h3>Dirección</h3>
                                        <p>
                                        {address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Formulario de contacto - Lado izquierdo */}
                        <div className="contact-us-left-info">
                            <div className="contact-form">
                                <h2>Déjanos tu mensaje</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-row">
                                        <input 
                                            type="text" 
                                            placeholder="Nombre" 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Apellido" 
                                            name="lastName" 
                                            value={formData.lastName} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Nombre de empresa" 
                                        name="company" 
                                        value={formData.company} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <input 
                                        type="email" 
                                        placeholder="Correo electrónico" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <textarea 
                                        placeholder="Mensaje" 
                                        name="message" 
                                        value={formData.message} 
                                        onChange={handleChange} 
                                        required
                                    ></textarea>
                                    <button type="submit" className="btn-submit">Enviar</button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <FooterComponent />
        </div>
    );
};

export default ContactUs;
