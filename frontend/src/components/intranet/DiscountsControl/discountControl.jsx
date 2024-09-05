import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth } from '../../functions/axiosConfig';
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";
import Layout from "../../../routes/LayoutControl/Layouts";
import './discountControl.css'

const CreateDiscount = () => {
    const { token, checkToken } = useAuthStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    
    const [discounts, setDiscounts] = useState('')
    const [discountPercentaje, setPercentajeDiscount] = useState('');
    const [description, setDescription] = useState('');
    const [discountIdDelete,setDiscountIdDelete] = useState(null);

    useEffect(() => {
        checkToken();
        fetchDiscounts();

    },[checkToken]);

    const fetchDiscounts = async () => {
        setLoading(true);
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get("/products/discount/all");
                setDiscounts(response.data) ;
            } catch (error){
                setError(error.response ? error.response.data.detail : "Error fetching discounts");
            } finally {
                setLoading(false);
            }   
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const handleCreateDiscount = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                    await axiosAuth.post("/product/create/discount",{
                    discount_percentage : discountPercentaje,
                    description : description,
                });
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating discount");
                ShowErrorAlter("Error", "No se pudo crear el porcentaje de descuento.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        ShowSuccesAlert("Discount create succesfully");
        fetchDiscounts();
    };

    const handleDeleteDiscount = async (discountId) => {
        if (token){
            const axiosAuth = axiosInstanceAuth(token);
            try{
                await axiosAuth.delete(`/product/discount/delete/${discountId}`)
                setDiscounts(discounts.filter((discount) => discount.id !== discountId));
                ShowSuccesAlert('product deleted successfully!');
            }catch (err) {
                    setError(err.response ? err.response.data.detail : "Error creating shape");
                    ShowErrorAlter("Error", "No se pudo eliminar el porcentaje de descuento.");
                    ShowErrorAlter("Error", `No se pudo eliminar el porcentaje de descuento ${discountId}.`);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        fetchDiscounts();
    };

    
    const handleOpenDeleteModal = (discountId) => {
        setDiscountIdDelete(discountId);
        setModalMessage("¿Estás seguro de eliminar este porcentaje de descuento?");
        setShowModal(true);
    };

    const handleConfirmDeleteModal = () => {
        setShowModal(false);
        handleDeleteDiscount(discountIdDelete);
    };

    const handleOpenModal = () => {
        setModalMessage("¿Estás seguro de crear este porcentaje de descuento?");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmModal = () => {
        setShowModal(false);
        handleCreateDiscount();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <div className="background-container-discounts">
            <Layout/>

                <h2 className = "discount-title">control de los porcentajes de descuento</h2>
                <form onSubmit={(e) => {e.preventDefault(); handleOpenModal();}}>
                <div className="form-group">
                    <label>Porcentaje de descuento:</label>
                    <input type="number" value={discountPercentaje} onChange={(e) => setPercentajeDiscount(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Descripcion:</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" />
                </div>
                </form>
                <button className="btn btn-primary" onClick={handleOpenModal}>Crear Nuevo Descuento</button>
                <div>
                    <h4 className="discount-title">Descuentos existentes</h4>
                    <div className="row">
                        {discounts.map((discount) => (
                            <div key={discount.id} className="col-lg-2 col-md-3 col-sm-4 col-xs-6 mb-3">
                                <div className="list-group-item discount-item">
                                    <p>Porcentaje: {discount.discount_percentage}%</p>
                                    <p>Descripcion: {discount.description}</p>
                                    <button className="delete-button-discount mb-2" onClick={() => handleOpenDeleteModal(discount.id)}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <ConfirmationModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    handleConfirm={modalMessage.includes("eliminar") ? handleConfirmDeleteModal : handleConfirmModal}
                    message={modalMessage}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateDiscount;