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
                            <a href="/intranet/config/control/users" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Usuarios</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/banners" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Banners</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/brands" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Marcas</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/edit/configsite" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Configuraciones</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/notices" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Noticias</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/products" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Productos</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/shapes" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Formas</button>
                            </a>
                        </div>
                    </div>
                    <div className="buttom-intranet-control">
                        <div className="image-container">
                            <img src={ExampleImg} alt="control intranet" />
                            <a href="/intranet/config/upload/discounts" target="_blank" rel="noopener noreferrer">
                                <button type="button" className="btn btn-light">Descuentos</button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intranet;