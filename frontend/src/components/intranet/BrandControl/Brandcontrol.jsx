import React, {useState, useEffect} from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance, axiosInstance, axiosInstanceFiles } from '../../functions/axiosConfig';

import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";

import "./BrandControl.css"

const UploadBrands = () => {
    const [namebrand, setnameBrand] = useState('');
    const [file, setFile] = useState(null);
    const {token, checkToken } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [brandIdToDelete, setBrandIdToDelete] = useState(null);
    const [brands, setBrands] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkToken();

    },[checkToken]);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try{
            const response = await axiosInstance.get("/uploaded/brands");
            setBrands(response.data);
        } catch (error) {
            setError(error.response ? error.response.data.detail : "Error fetching brands");
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleCreateBrand = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.post("/create/brands", {
                    name: namebrand
                });
                const brandId = response.data.id;
                handleUploadBrandImage(brandId);
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating brand");
                ShowErrorAlter("Error", "No se pudo crear el brand.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const handleUploadBrandImage = async (brandId) => {
        if (token && file) {
            const axiosAuth = axiosInstanceFiles(token);
            const formData = new FormData();
            formData.append("file", file);
            try {
                await axiosAuth.post(`/brands/upload/${brandId}/brand_logo`, formData);
                ShowSuccesAlert('brand uploaded successfully!');
                fetchBrands();
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating brand");
                ShowErrorAlter("Error", "No se pudo subir la imagen de la marca.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token o el archivo. Por favor, inicia sesión y selecciona un archivo.");
        }
    };

    const handleOpenModal = () => {
        setModalMessage("¿Estás seguro de subir esta marca?");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmModal = () => {
        setShowModal(false);
        handleCreateBrand();
    };

    
    const handleDeleteBrand = async (brandId) => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                await axiosAuth.delete(`/brands/delete/${brandId}`);
                setBrands(brands.filter((brand) => brand.id !== brandId));
                ShowSuccesAlert('Brand deleted successfully!');
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating Brand");
                ShowErrorAlter("Error", "No se pudo eliminar la marca.");
                ShowErrorAlter("Error", `No se pudo eliminar la marca ${brandId}.`);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        fetchBrands();
    };

    const handleOpenDeleteModal = (brandId) => {
        setBrandIdToDelete(brandId);
        setModalMessage("¿Estás seguro de eliminar esta Marca?");
        setShowModal(true);
    };

    const handleConfirmDeleteModal = () => {
        setShowModal(false);
        handleDeleteBrand(brandIdToDelete);
    };

    if(loading){
        return <div>Loading....</div>
    }

    return(
    <div className="container">
        <div className="background-container-brands">
            <h2 className = "brands-title">Control de Marcas</h2>
            {error && <p className="text-danger">{error}</p>}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="name Brand"
                    value={namebrand}
                    onChange={(e) => setnameBrand(e.target.value)}
                />
                <input
                    type="file"
                    accept=".png"
                    className="form-control my-2"
                    onChange={handleFileChange}
                    
                />
                <button className="btn btn-primary" onClick={handleOpenModal}>Subir Marca</button>
            </div>
            <ConfirmationModal
                show={showModal}
                handleClose={handleCloseModal}
                handleConfirm={modalMessage.includes("eliminar") ? handleConfirmDeleteModal : handleConfirmModal}
                message={modalMessage}
            />
                <div>
                <h4 className="brands-title">Marcas existentes</h4>
                <div className="row">
                    {brands.map((brand) => (
                        <div key={brand.id} className="col-lg-2 col-md-3 col-sm-4 col-xs-6 mb-3">
                            <div className="list-group-item brand-item">
                                <p>Marca: {brand.name}</p>
                                {brand.brand_logo && <img src={`${resourcesInstance.defaults.baseURL}${brand.brand_logo}`} alt={`Brand ${brand.id}`} className="brand-image brands-img" />}
                                <button className="delete-button-brand mb-2" onClick={() => handleOpenDeleteModal(brand.id)}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    );
};

export default UploadBrands;
