import React, {useEffect,useState} from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance, axiosInstance, axiosInstanceFiles } from '../../functions/axiosConfig';

import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";

//estilos
import "./ConfigSite.css";

const ConfigSite = () => {
    
    //token
    const {token, checkToken } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [error, setError] = useState(null);

    //json
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [facebookLink, setFacebookLink] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [youtubeLink, setYoutubeLink] = useState('');
    const [twitterLink, setTwitterLink] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');
    const [logoFile, setLogoFile] = useState([]);
    const [favIconFile, setFavIconFile] = useState([]);
    const [logoFileIdToDelete, setlogoFileIdToDelete] = useState(null);
    const [favIconFileIdToDelete, setfavIconFileIdToDelete] = useState(null);

    //fecth config 
    const [config, setConfig] = useState({ fav_icon: '' });
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        checkToken();

    },[checkToken]);

    useEffect(() => {
        fetchConfigSite();
    }, []);


    const fetchConfigSite = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/config");
            const { primary_color, secondary_color, facebook_link, youtube_link, whatsapp_link, twitter_link, contact_email, contact_phone,address } = response.data;
            setPrimaryColor(primary_color);
            setSecondaryColor(secondary_color);
            setFacebookLink(facebook_link);
            setYoutubeLink(youtube_link);
            setWhatsappLink(whatsapp_link);
            setTwitterLink(twitter_link);
            setContactEmail(contact_email);
            setContactPhone(contact_phone);
            setAddress(address);
            setConfig(response.data);
        } catch (error) {
            setError(error.response ? error.response.data.detail : "Error fetching config");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoFileChange = (e) => {
        setLogoFile(e.target.files[0]);
    };

    const handleFavIconFileChange = (e) => {
        setFavIconFile(e.target.files[0]);
    };

    const handleCreateConfig= async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.post("/create/config", {
                    primary_color: primaryColor,
                    secondary_color: secondaryColor,
                    facebook_link: facebookLink,
                    youtube_link: youtubeLink,
                    whatsapp_link: whatsappLink,
                    twitter_link: twitterLink,
                    contact_email: contactEmail,
                    contact_phone: contactPhone,
                    address: address
                });
                const LogoId = response.data.id;
                await handleUploadLogoImage(LogoId);

                const favIconId = response.data.id;
                await handleUploadFavIconImage(favIconId);

                ShowSuccesAlert('Configuración guardada exitosamente.');
                setShowModal(false);
            
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating Logo or FavIcon");
                ShowErrorAlter("Error", "No se pudo crear el Logo o el FavIcon.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const handleUploadLogoImage = async (LogoId) => {
        if (token && logoFile) {
            const axiosAuth = axiosInstanceFiles(token);
            const formData = new FormData();
            formData.append("file", logoFile);
            try {
                await axiosAuth.post(`/config/logo/${LogoId}/logo`, formData);
                ShowSuccesAlert('Logo uploaded successfully!');
                fetchConfigSite();
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating Logo");
                ShowErrorAlter("Error", "No se pudo subir la imagen del Logo.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token o el archivo. Por favor, inicia sesión y selecciona un archivo.");
        }
    };

    const handleUploadFavIconImage = async (favIconId) => {
        if (token && favIconFile) {
            const axiosAuth = axiosInstanceFiles(token);
            const formData = new FormData();
            formData.append("file", favIconFile);
            try {
                await axiosAuth.post(`/config/${favIconId}/fav_icon`, formData);
                ShowSuccesAlert('FavIcon uploaded successfully!');
                fetchConfigSite();
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating FavIcon");
                ShowErrorAlter("Error", "No se pudo subir la imagen del FavIcon.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token o el archivo. Por favor, inicia sesión y selecciona un archivo.");
        }
    };

    useEffect(() => {
        const favicon = document.querySelector("link[rel='icon']");
        if (favicon) {
            favicon.href = `${resourcesInstance.defaults.baseURL}${config.fav_icon}`;
        }
    }, [config.fav_icon]);

    const handleOpenModal = () => {
        setModalMessage("¿Estás seguro de cambiar la configuración del sitio?");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmModal = () => {
        handleCreateConfig();
    };

    //eliminar logo 
    const handleDeleteLogoImage = async (logoId) => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                await axiosAuth.delete(`/config/logo/delete/${logoId}`);
                setLogoFile(logoFile.filter((logo) => logo.id !== logoId));
                ShowSuccesAlert('Logo deleted successfully!');
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating logo");
                ShowErrorAlter("Error", "No se pudo eliminar el Logo.");
                ShowErrorAlter("Error", `No se pudo eliminar el logo ${logoId}.`);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        fetchConfigSite();
    };


    //eliminar logo
    const handleOpenDeleteLogoModal = (logoId) => {
        setlogoFileIdToDelete(logoId);
        setModalMessage("¿Estás seguro de eliminar el logo?");
        setShowModal(true);
    };
    const handleConfirmDeleteLogoModal = () => {    
        setShowModal(false);
        handleDeleteLogoImage(logoFileIdToDelete);
    };

    //eliminar favicon 
    const handleDeleteFavIconImage = async (FavIconId) => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                await axiosAuth.delete(`/config/fav_icon/delete/${FavIconId}`);
                setFavIconFile(favIconFile.filter((favIcon) => favIcon.id !== FavIconId));
                ShowSuccesAlert('favIcon deleted successfully!');
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating favIcon");
                ShowErrorAlter("Error", "No se pudo eliminar el favIcon.");
                ShowErrorAlter("Error", `No se pudo eliminar el favIcon ${FavIconId}.`);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        fetchConfigSite();
    };
    
    const handleOpenDeleteFavIconModal = (FavIconId) => {
        setfavIconFileIdToDelete(FavIconId);
        setModalMessage("¿Estás seguro de eliminar el FavIcon?");
        setShowModal(true);
    };
    
    const handleConfirmDeleteFavIconModal = () => {
        setShowModal(false);
        handleDeleteFavIconImage(favIconFileIdToDelete);
    };

    if(loading){
        return <div>Loading....</div>
    }
    return (
        <div className="container">
                <div className="background-container">
            <h2 className="config-title">Configuraciones del WebSite</h2>
                {error && <div className="error">{error}</div>}
                <form className="config-form">
                    <div className="form-group-config">
                        <label>Color Primario:</label>
                        <input type="text" className="form-control-config" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                    </div>
                    <div className="form-group-config">
                        <label>Color Secundario</label>
                        <input type="text" className="form-control-config" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                    </div>
                    <div className="form-group-config">
                        <label>Facebook:</label>
                        <input type="text" className="form-control-config" value={facebookLink} onChange={(e) => setFacebookLink(e.target.value)} />
                    </div>
                    <div className="form-group-config">
                        <label>WhatsApp:</label>
                        <input type="text" className="form-control-config" value={whatsappLink} onChange={(e) => setWhatsappLink(e.target.value)} />
                    </div>
                    <div className="form-group-config">
                        <label>YouTube:</label>
                        <input type="text" className="form-control-config" value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} />
                    </div>
                    <div className="form-group-config">
                        <label>Twitter:</label>
                        <input type="text" className="form-control-config" value={twitterLink} onChange={(e) => setTwitterLink(e.target.value)} />
                    </div>
                    <div className="form-group-config">
                        <label>Correo Electronico:</label>
                        <input type="email" className="form-control-config" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <div className="form-group-config">
                        <label>Numero de telefono:</label>
                        <input type="text" className="form-control-config" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    </div>
                    <div className="form-group-config">
                        <label>Dirección sede principal:</label>
                        <input type="text" className="form-control-config" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div className="form-group-config">
                        <label>Subir Logo:</label>
                        <input type="file" className="form-control-config" accept="image/png" onChange={handleLogoFileChange} />
                    </div>
                    <div className="form-group-config">
                        <label>Subir FavIcon:</label>
                        <input type="file" className="form-control-config" accept="image/png" onChange={handleFavIconFileChange} />
                    </div>
                    <button type="button" className="btn btn-success mt-3" onClick={handleOpenModal}>
                        Guardar Configuración
                    </button>
                </form>
                <ConfirmationModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    handleConfirm={modalMessage.includes("¿Estás seguro de eliminar el logo?") ? handleConfirmDeleteLogoModal : 
                    modalMessage.includes("¿Estás seguro de eliminar el FavIcon?") ? handleConfirmDeleteFavIconModal : 
                    handleConfirmModal}
                    message={modalMessage}
                />
                <div>
                    <h3 className="config-title">Logo y FavIcon</h3>
                    <div className="container-resources">
                    {config && config.logo_site && (
                        
                        <div className="config-item">
                            <img src={`${resourcesInstance.defaults.baseURL}${config.logo_site}`} alt="Logo actual" className="config-image-logo" />
                            <div>
                            <button className="delete-button-config" onClick={() => handleOpenDeleteLogoModal(config.id)}>Eliminar Logo</button>
                            </div>
                        </div>
                    )}
                    {config && config.fav_icon && (
                        <div className="config-item" >
                            <img src={`${resourcesInstance.defaults.baseURL}${config.fav_icon}`} alt="FavIcon actual"  className="config-image"/>
                            <div>
                            <button className="delete-button-config" onClick={() => handleOpenDeleteFavIconModal(config.id)}>Eliminar FavIcon</button>
                            </div>
                        </div>
                        
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigSite;
