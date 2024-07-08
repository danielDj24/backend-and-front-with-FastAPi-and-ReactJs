import React, {useEffect,useState} from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance, axiosInstance, axiosInstanceFiles } from '../../functions/axiosConfig';

import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";


const UploadNotices =  () => {
    //token
    const {token, checkToken } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    //notices 
    const [notices, setNotices] = useState([]);
    const [categorie, setCategorie] =  useState('');
    const [title, setTitle] =  useState('');
    const [noticeContent, setNoticeContent] =  useState('');
    const [file, setFile] = useState(null);
    const [noticeIdToDelete, setNoticeIdToDelete] = useState(null);

    
    useEffect(() => {
    checkToken();
    },[checkToken]);

    useEffect(() => {
        FectNotices();
    }, []);

    

    const FectNotices = async () =>{
        try {
            const response = await axiosInstance.get("/data/notice");
            setNotices(response.data);
        } catch (error) {
            setError(error.response ? error.response.data.detail : "Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUploadNotice = async () =>{
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.post("/data/create/notice", {
                    categorie: categorie,
                    title: title,
                    notice_content: noticeContent
                });
                const noticeId = response.data.id;       
                handleCreateBannerNotice(noticeId);
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating notice");
                ShowErrorAlter("Error", "No se pudo crear la noticia.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const handleCreateBannerNotice= async (noticeId)=> {
        if (token && file) {
            const axiosAuth = axiosInstanceFiles(token);
            const formData = new FormData();
            formData.append("file", file);
            try {
                await axiosAuth.post(`/data/upload/img/${noticeId}/img`, formData);
                ShowSuccesAlert('banner notice uploaded successfully!');
                fetchBrands();
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating banner notice");
                ShowErrorAlter("Error", "No se pudo subir la imagen de la marca.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token o el archivo. Por favor, inicia sesión y selecciona un archivo.");
        }
    };

    const handleOpenModal = () => {
        setModalMessage("¿Estás seguro de subir esta noticia?");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmModal = () => {
        setShowModal(false);
        handleUploadNotice();
    };

    const handleDeleteNotice = async (noticeId) => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                await axiosAuth.delete(`/data/notice/delete/${noticeId}`);
                setBrands(notices.filter((notice) => notice.id !== noticeId));
                ShowSuccesAlert('Notice deleted successfully!');
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating Notice");
                ShowErrorAlter("Error", "No se pudo eliminar la noticia.");
                ShowErrorAlter("Error", `No se pudo eliminar la noticia ${noticeId}.`);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        FectNotices();
    };


    const handleOpenDeleteModal = (noticeId) => {
        setNoticeIdToDelete(noticeId);
        setModalMessage("¿Estás seguro de eliminar esta noticia?");
        setShowModal(true);
    };

    const handleConfirmDeleteModal = () => {
        setShowModal(false);
        handleDeleteNotice(noticeIdToDelete);
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div className="container">
            <div className="background-container-notices">
                
            </div>
        </div>
    );
};


export default UploadNotices;