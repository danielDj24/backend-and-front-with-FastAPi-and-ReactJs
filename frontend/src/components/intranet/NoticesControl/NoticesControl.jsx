import React, { useEffect, useState } from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance, axiosInstance, axiosInstanceFiles } from '../../functions/axiosConfig';
import ReactQuill from "react-quill";

import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";

// Estilos 
import "./NoticesControl.css";
import 'react-quill/dist/quill.snow.css';

const UploadNotices = () => {
    const { token, checkToken } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // State para manejar noticias
    const [notices, setNotices] = useState([]);
    const [categorie, setCategorie] = useState('');
    const [title, setTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [file, setFile] = useState(null);
    const [noticeIdToDelete, setNoticeIdToDelete] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString());

    // Verificar token al cargar el componente
    useEffect(() => {
        checkToken();
    }, [checkToken]);

    // Cargar noticias al montar el componente
    useEffect(() => {
        fetchNotices();
    }, []);

    // Función para obtener las noticias
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

    // Manejar cambio de archivo
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Subir nueva noticia
    const handleUploadNotice = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.post("/data/create/notice", {
                    categorie: categorie,
                    title: title,
                    notice_content: noticeContent,
                    date: selectedDate
                });
                const noticeId = response.data.id;
                await handleCreateBannerNotice(noticeId);
                ShowSuccesAlert('¡Noticia creada exitosamente!');
                fetchNotices(); // Actualizar lista de noticias después de crear una nueva
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating notice");
                ShowErrorAlter("Error", "No se pudo crear la noticia.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    // Subir imagen de la noticia
    const handleCreateBannerNotice = async (noticeId) => {
        if (token && file) {
            const axiosAuth = axiosInstanceFiles(token);
            const formData = new FormData();
            formData.append("file", file);
            try {
                await axiosAuth.post(`/data/upload/img/${noticeId}/img`, formData);
                ShowSuccesAlert('¡Imagen de noticia subida exitosamente!');
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating banner notice");
                ShowErrorAlter("Error", "No se pudo subir la imagen de la noticia.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token o el archivo. Por favor, inicia sesión y selecciona un archivo.");
        }
    };

    // Abrir modal de confirmación para subir noticia
    const handleOpenModal = () => {
        setModalMessage("¿Estás seguro de subir esta noticia?");
        setShowModal(true);
    };

    // Cerrar modal de confirmación
    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Confirmar subida de noticia
    const handleConfirmModal = () => {
        setShowModal(false);
        handleUploadNotice();
    };

    // Eliminar noticia
    const handleDeleteNotice = async (noticeId) => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                await axiosAuth.delete(`/data/notice/delete/${noticeId}`);
                setNotices(notices.filter((notice) => notice.id !== noticeId));
                ShowSuccesAlert('Notice deleted successfully!');
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating Notice");
                ShowErrorAlter("Error", "No se pudo eliminar la noticia.");
                ShowErrorAlter("Error", `No se pudo eliminar la noticia ${noticeId}.`);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        fetchNotices();
    };

    // Abrir modal de confirmación para eliminar noticia
    const handleOpenDeleteModal = (noticeId) => {
        setNoticeIdToDelete(noticeId);
        setModalMessage("¿Estás seguro de eliminar esta noticia?");
        setShowModal(true);
    };

    // Confirmar eliminación de noticia
    const handleConfirmDeleteModal = () => {
        setShowModal(false);
        handleDeleteNotice(noticeIdToDelete);
    };

    // Si está cargando, mostrar mensaje de carga
    if (loading) return <p>Cargando...</p>;

    return (
        <div className="container">
            <div className="background-container-notices">
                <h2 className="notices-control-title">Control de Noticias</h2>
                {error && <p className="text-danger">{error}</p>}
                <div className="notices-form">
                    <div className="mb-3">
                        <label>Categoria:</label>
                        <select
                            className="form-control-notice my-2"
                            value={categorie}
                            onChange={(e) => setCategorie(e.target.value)}
                        >
                            <option value="salud">Salud</option>
                            <option value="negocios">Negocios</option>
                        </select>

                        <input
                            type="text"
                            className="form-control-notice"
                            placeholder="titulo de la noticia"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <ReactQuill
                            className="custom-quill-editor"
                            theme="snow"
                            value={noticeContent}
                            onChange={setNoticeContent}
                            placeholder="contenido de la noticia"
                        />
                        <input
                            type="date"
                            className="custom-date-input my-2"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <input
                            type="file"
                            accept=".jpg, .jpeg"
                            className="form-control-notices my-2"
                            onChange={handleFileChange}
                        />
                        <button className="btn btn-primary" onClick={handleOpenModal}>Subir Noticia</button>
                    </div>
                </div>
                <ConfirmationModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    handleConfirm={modalMessage.includes("eliminar") ? handleConfirmDeleteModal : handleConfirmModal}
                    message={modalMessage}
                />
            </div>

            {/* Mostrar noticias */}
            <div className="blog-block-view">
                <div className="block-view">
                    {notices.map((notice) => (
                        <div className="notice-block" key={notice.id}>
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${notice.img_notice}`}
                                alt={notice.img_notice}
                                className="notice-img-block"
                            />
                            <div className="notice-content">
                                <h2>{notice.title}</h2>
                                <p>{new Date(notice.date).toLocaleDateString()}</p>
                                <button
                                    onClick={() => handleOpenDeleteModal(notice.id)}
                                    className="delete-button-notice" 
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UploadNotices;
