import React from "react";
import { Link } from "react-router-dom";

//estilos
import './homeIntranet.css'
import BannerPlus from "../../assets/bannersBurn/PLusssizeBanner.jpg"
import ExampleImg from "../../assets/imgsBurn/intranetexample.jpg"

const Intranet = () => {
    return (
        <div className="intranet-container">
            <div className="banner-intranet">
                <div>
                    <img src={BannerPlus} alt="banner intranet" />
                    <p>Bienvenido a la intranet</p>
                </div>
            </div>
            <div className="intranet-elements-container">
                <div className="container-intranet-control">
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <Link to="/intranet/config/control/users">
                                <button type="button" className="btn btn-light">Control de usuarios</button>
                            </Link>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <Link to="/intranet/config/upload/banners">
                                <button type="button" className="btn btn-light">Subir Banner</button>
                            </Link>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <Link to="/intranet/config/upload/brands">
                                <button type="button" className="btn btn-light">Subir Marca</button>
                            </Link>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <Link to="/intranet/config/edit/configsite">
                                <button type="button" className="btn btn-light">Configurar Sitio</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intranet;