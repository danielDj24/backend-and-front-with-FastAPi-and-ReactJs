import React, { useEffect, useState } from "react";
import { axiosInstance, resourcesInstance } from '../../functions/axiosConfig';

//carrusel
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useTranslation } from "react-i18next";

//estilos
import "./Banners.css";


const Banners = ({ positionFilter }) => {
    const { t } = useTranslation();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        const fetchBanners = async () =>{
            try {
                const response = await axiosInstance.get("/config/banners");
                setBanners(response.data);
            } catch(error){
                setError(error.response ? error.response.data.detail : "Error fetching banners");
            } finally{
                setLoading(false);
            }
        };
        fetchBanners();

    }, []);

    if (loading) {
        return <div>{t("cargando")}</div>; // Traduce el texto de carga
    }
    if (error) {
        return <div>{t("error")}: {error}</div>; // Traduce el texto de error
    }

    const filteredBanners = banners.filter(banner => banner.position === positionFilter);

    return (
        <div className="banners-container-get">
            {filteredBanners.length > 1 ? (
                <Carousel showThumbs={false} showIndicators={false} autoPlay interval={3000} infiniteLoop>
                    {filteredBanners.map((banner) => (
                        <div key={banner.id}>
                            <div className="banner-wrapper-get">
                                <img
                                    src={`${resourcesInstance.defaults.baseURL}${banner.image}`}
                                    alt={`Banner ${banner.id}`}
                                    className="banners-img-get"
                                />
                                {banner.link_url && (
                                    <div className="button-container-get">
                                        <a href={banner.link_url} className="btn btn-light" target="_blank" rel="noopener noreferrer">
                                            {t("ver_mas")} {/* Traduce el texto del botón */}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </Carousel>
            ) : (
                filteredBanners.map((banner) => (
                    <div key={banner.id} className="single-banner">
                        <div className="banner-wrapper-get">
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${banner.image}`}
                                alt={`Banner ${banner.id}`}
                                className="banners-img-get"
                            />
                            {banner.link_url && (
                                <div className="button-container">
                                    <a href={banner.link_url} className="btn" target="_blank" rel="noopener noreferrer">
                                        {t("ver_mas")} {/* Traduce el texto del botón */}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Banners;