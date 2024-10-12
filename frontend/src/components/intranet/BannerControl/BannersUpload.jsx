import React, {useState, useEffect} from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance, axiosInstance, axiosInstanceFiles } from '../../functions/axiosConfig';

import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";
import Layout from "../../../routes/LayoutControl/Layouts";
import "./BannersUpload.css"

const UploadBanner = () => {
    const [linkUrl, setLinkUrl] = useState('');
    const [position, setPosition] = useState('1');
    const [file, setFile] = useState(null);

    const {token, checkToken } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [error, setError] = useState(null);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bannerIdToDelete, setBannerIdToDelete] = useState(null);


    useEffect(() => {
        checkToken();

    },[checkToken]);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/config/banners");
            setBanners(response.data);
        } catch (error) {
            setError(error.response ? error.response.data.detail : "Error fetching banners");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleCreateBanner = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.post("/config/banners/upload", {
                    link_url: linkUrl,
                    position: position
                });
                const bannerId = response.data.id;
                handleUploadBannerImage(bannerId);
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating banner");
                ShowErrorAlter("Error", "No se pudo crear el banner.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const handleUploadBannerImage = async (bannerId) => {
        if (token && file) {
            const axiosAuth = axiosInstanceFiles(token);
            const formData = new FormData();
            formData.append("file", file);
            try {
                await axiosAuth.post(`/config/banners/${bannerId}/banner`, formData);
                ShowSuccesAlert('Banner uploaded successfully!');
                fetchBanners();
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating banner");
                ShowErrorAlter("Error", "No se pudo subir la imagen del banner.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token o el archivo. Por favor, inicia sesión y selecciona un archivo.");
        }
    };

    const handleOpenModal = () => {
        setModalMessage("¿Estás seguro de subir este banner?");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmModal = () => {
        setShowModal(false);
        handleCreateBanner();
    };

    const handleDeleteBanner = async (bannerId) => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                await axiosAuth.delete(`/config/banners/${bannerId}`);
                setBanners(banners.filter((banner) => banner.id !== bannerId));
                ShowSuccesAlert('Banner deleted successfully!');
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating banner");
                ShowErrorAlter("Error", "No se pudo eliminar el banner.");
                ShowErrorAlter("Error", `No se pudo eliminar el banner ${bannerId}.`);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        fetchBanners();
    };

    const handleOpenDeleteModal = (bannerId) => {
        setBannerIdToDelete(bannerId);
        setModalMessage("¿Estás seguro de eliminar este banner?");
        setShowModal(true);
    };

    const handleConfirmDeleteModal = () => {
        setShowModal(false);
        handleDeleteBanner(bannerIdToDelete);
    };

    if(loading){
        return <div>Loading....</div>
    }
    
    const bannersPosition1 = banners.filter(banner => banner.position === 1);
    const bannersPosition2 = banners.filter(banner => banner.position === 2);

    return (
    <div className="container">
        <div className="background-container">
        <Layout/>
            <h2 className = "banner-title">Control de Banners</h2>
            {error && <p className="text-danger">{error}</p>}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Link URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                />
                <select
                    className="form-control my-2"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                >
                    <option value="1">Home</option>
                    <option value="2">E-commerce</option>
                </select>
                <input
                    type="file"
                    accept=".jpg,.jpeg"
                    className="form-control my-2"
                    onChange={handleFileChange}
                />
                <button className="btn btn-primary" onClick={handleOpenModal}>Subir banner</button>
            </div>
            <ConfirmationModal
                show={showModal}
                handleClose={handleCloseModal}
                handleConfirm={modalMessage.includes("eliminar") ? handleConfirmDeleteModal : handleConfirmModal}
                message={modalMessage}
            />
            <div className="mt-4">
                {bannersPosition1.length > 0 && (
                    <div>
                        <h4 className = "banner-title" >Banners en Home</h4>
                        <div className="row">
                            {bannersPosition1.map((banner) => (
                                <div key={banner.id} className="col-lg-2 col-md-3 col-sm-4 col-xs-6 mb-3">
                                    <div className="list-group-item banner-item">
                                        <p>Redirección: {banner.link_url}</p>
                                        <p>Posición: {banner.position}</p>
                                        {banner.image && <img src={`${resourcesInstance.defaults.baseURL}${banner.image}`} alt={`Banner ${banner.id}`} className="banner-image banners-img" />}
                                        <div className="control-buttons">
                                            <button className="delete-button-banners mb-2" onClick={() => handleOpenDeleteModal(banner.id)}>Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {bannersPosition2.length > 0 && (
                    <div>
                        <h4 className = "banner-title">Banners en E-commerce</h4>
                        <div className="row">
                            {bannersPosition2.map((banner) => (
                                <div key={banner.id} className="col-lg-2 col-md-3 col-sm-4 col-xs-6 mb-3">
                                    <div className="list-group-item banner-item">
                                        <p>Redirección: {banner.link_url}</p>
                                        <p>Posición: {banner.position}</p>
                                        {banner.image && <img src={`${resourcesInstance.defaults.baseURL}${banner.image}`} alt={`Banner ${banner.id}`} className="banner-image banners-img" />}
                                        <button className="delete-button-banners mb-2" onClick={() => handleOpenDeleteModal(banner.id)}>Eliminar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {bannersPosition1.length === 0 && bannersPosition2.length === 0 && (
                    <p>No hay banners disponibles.</p>
                )}
            </div>
        </div>
    </div>
    );
};

export default UploadBanner;
