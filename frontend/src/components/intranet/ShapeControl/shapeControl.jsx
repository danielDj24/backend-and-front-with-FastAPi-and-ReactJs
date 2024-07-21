import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, axiosInstanceFiles, resourcesInstance } from '../../functions/axiosConfig';
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";
import './ShapeControl.css'

const CreateShape = () => {
    const { token, checkToken } = useAuthStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const [shapes, setShapes] = useState([]);
    const [shapeImage, setShapeImage] = useState(null);

    const [nameShape, setNameShape] = useState('');
    const [shapeIdDelete,setShapeIdDelete] = useState(null);

    useEffect(() => {
        checkToken();
        fetchShapes();

    },[checkToken]);

    const fetchShapes = async () => {
        setLoading(true);
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get("/product/shapes");
                setShapes(response.data) ;
            } catch (error){
                setError(error.response ? error.response.data.detail : "Error fetching shapes");
            } finally {
                setLoading(false);
            }   
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const handleFileChange = (e) => {
        setShapeImage(e.target.files[0]);
    };


    const handleCreateShape = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.post("/product/create/shape",{
                    name_shape : nameShape,
                });
                const shapeId = response.data.id;
                handleUplaodImageShape(shapeId);
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating product");
                ShowErrorAlter("Error", "No se pudo crear el producto.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const handleUplaodImageShape = async (shapeId) => {
        if (token && shapeImage) {
            const axiosAuth = axiosInstanceFiles(token);
            const formData = new FormData();
            formData.append("file", shapeImage);
            try{
                await axiosAuth.post(`/products/shape/upload_img/${shapeId}/img`, formData);
                ShowSuccesAlert('Shape uploaded successfully!');
                fetchShapes();
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating shape picture");
                ShowErrorAlter("Error", "No se pudo subir la imagen de la forma.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token o el archivo. Por favor, inicia sesión y selecciona un archivo.");
        }
    };

    const handleDeleteShape = async (shapeId) => {
        if (token){
            const axiosAuth = axiosInstanceAuth(token);
            try{
                await axiosAuth.delete(`/products/shape/delete/${shapeId}`)
                setShapes(shapes.filter((shape) => shape.id !== shapeId));
                ShowSuccesAlert('product deleted successfully!');
            }catch (err) {
                    setError(err.response ? err.response.data.detail : "Error creating shape");
                    ShowErrorAlter("Error", "No se pudo eliminar la forma del marco.");
                    ShowErrorAlter("Error", `No se pudo eliminar la forma del marco ${shapeId}.`);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        fetchShapes();
    };

    
    const handleOpenDeleteModal = (shapeId) => {
        setShapeIdDelete(shapeId);
        setModalMessage("¿Estás seguro de eliminar esta forma?");
        setShowModal(true);
    };

    const handleConfirmDeleteModal = () => {
        setShowModal(false);
        handleDeleteShape(shapeIdDelete);
    };

    const handleOpenModal = () => {
        setModalMessage("¿Estás seguro de crear esta forma del marco?");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmModal = () => {
        setShowModal(false);
        handleCreateShape();
    };


    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="container"> 
                <div className="background-container-shapes">
                    <h2 className = "shapes-title">control de las formas de los Productos</h2>
                    <form onSubmit={(e) => {e.preventDefault(); handleOpenModal();}}>
                        <div className="form-group">
                            <label>Nombre de la forma:</label>
                            <input type="text" value={nameShape} onChange={(e) => setNameShape(e.target.value)} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Foto de la forma:</label>
                            <input type="file" onChange={handleFileChange} className="form-control my-2"/>
                        </div>
                        <button className="btn btn-primary" onClick={handleOpenModal}>Crear Nueva forma</button>
                    </form>
                    <div>
                    <h4 className="shapes-title">Formas existentes</h4>
                    <div className="row">
                        {shapes.map((shape) => (
                            <div key={shape.id} className="col-lg-2 col-md-3 col-sm-4 col-xs-6 mb-3">
                                <div className="list-group-item shape-item">
                                    <p>Marca: {shape.name_shape}</p>
                                    {shape.shape_picture && <img src={`${resourcesInstance.defaults.baseURL}${shape.shape_picture}`} alt={`Shape ${shape.id}`} className="shape-image shapes-img" />}
                                    <button className="delete-button-shape mb-2" onClick={() => handleOpenDeleteModal(shape.id)}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                </div>
                <ConfirmationModal
                show={showModal}
                handleClose={handleCloseModal}
                handleConfirm={modalMessage.includes("eliminar") ? handleConfirmDeleteModal : handleConfirmModal}
                message={modalMessage}
            />
        </div>
    );
};

export default CreateShape;