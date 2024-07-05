import React, { useEffect, useState } from "react";
import { axiosInstance, resourcesInstance } from "../../functions/axiosConfig";
import { Route, Routes, useParams, Link } from "react-router-dom";
import "./Blogcomponent.css";

const DetailViewComponent = () => {
    const { noticeId } = useParams();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotice = async () => {
        try {
            const response = await axiosInstance.get(`/data/notice/${noticeId}`);
            setNotice(response.data);
        } catch (error) {
            setError(error.response ? error.response.data.detail : "Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotice();
    }, [noticeId]);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>{error}</p>;
    if (!notice) return <p>Noticia no encontrada</p>;

    return (
        <div className="detailed-view">
        <div className="banner-detail-container">
            <img
                src={`${resourcesInstance.defaults.baseURL}${notice.img_notice}`}
                alt={notice.img_notice}
                className="banner-detail-notice-img"
            />
        </div>
        <div className="view-notice-content-detail">
            <div className="notice-info-top">
                <p className="notice-date">{notice.date}</p>
                <p className="notice-categorie">{notice.categorie}</p>
            </div>
            <h1>{notice.title}</h1>
            <p>{notice.notice_content}</p>
        </div>
    </div>
    );
};

const BlockViewComponent = ({ notices }) => {
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
                            <p>{notice.date}</p>
                            <button
                                onClick={() => window.open(`/notice/${notice.id}`, '_blank')}
                                className="read-more-button"
                            >
                                Leer más
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Blogcomponent = ({ view }) => {
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

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>{error}</p>;

    return(
        <Routes>
            {view === "detail" && <Route path=":noticeId" element={<DetailViewComponent />} />}
            {(view === "home" || view === "blog") && <Route path="/" element={<BlockViewComponent notices={notices} />} />}
        </Routes>   
    );
};

export default Blogcomponent;