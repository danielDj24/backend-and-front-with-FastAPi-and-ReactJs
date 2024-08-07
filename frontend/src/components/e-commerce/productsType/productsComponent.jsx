import React,{useEffect, useState} from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../functions/axiosConfig';
import { ShowErrorAlter } from '../../functions/Alerts';
import { useParams } from 'react-router-dom'; 

import MenuComponent from "../../network/Menu/MenuComponent";
import FooterComponent from "../../network/Footer/footerComponent"

import './productsComponent.css'
import BannerPlus from "../../../assets/bannersBurn/PLusssizeBanner.jpg"

const ProductsByType = () =>{
    const { gender } = useParams();
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); 
    const [totalPages, setTotalPages] = useState(0);
    const {token, checkToken } = useAuthStore();

    // Constantes para controlar el login y el registro en el modal de usuarios
    const [ setShowLoginModal] = useState(false);

    // Control de rutas para el login admin
    const [userRole, setUserRole] = useState(null);

    const handleOpenLoginModal = () => setShowLoginModal(true);

    useEffect(() => {
        checkToken();
    }, [checkToken]);
        

    const handleLogout = () => {
        useAuthStore.getState().clearToken();
        setUserRole(null);
    };

    useEffect(() => {
        if (gender) {
            fetchProducts();
        } else {
            setLoading(false);
            setError("Gender is not defined");
        }
        }, [currentPage, pageSize, gender]);

    const fetchProducts = async () => {
        setLoading(true);
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get(`/products/gender/${gender}`, {
                    params: {
                        page: currentPage,
                        size: pageSize,
                    },
                });
                setProducts(response.data.items);
                setTotalPages(response.data.total_pages);
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching products");
            } finally {
                setLoading(false);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1); 
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="product-container">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={() => useAuthStore.getState().clearToken()}
                isECommerce={true}
            />
            <div className="banner-blog">
                <div>
                    <img src={BannerPlus} alt="banner blog" />
                    <p> {gender} </p>
                </div>
            </div>
            <div className="background-container">
                <div className="pagination-controls">
                    <button className="btn btn-light" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Anterior
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button className="btn btn-light" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Siguiente
                    </button>
                    <select className="btn btn-light" onChange={(e) => handlePageSizeChange(e.target.value)} value={pageSize}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>

                <div className="product-list-types">
                {products && products.map((product) => (
                    <div key={product.id} className="product-item-types mb-3">
                        <div className="product-image-container-type">
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${product.center_picture}`}
                                alt={`Product ${product.id}`}
                                className="center-image"
                            />
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${product.side_picture}`}
                                alt={`Product ${product.id}`}
                                className="side-imagen"
                            />
                        </div>
                        <div className="product-details-type">
                            <div className="description-list">
                                <h2 className="product-info-type">{product.brand?.name || 'N/A'}</h2>
                                <h1 className="product-info-type"><strong>{product.name_product}</strong></h1>
                                <p className="product-info-type">Color: {product.color}</p>
                                <p className="product-info-type">Tamaño: {product.size}</p>
                            </div>
                            <div className="products-buy-details-type">
                                <h1 className="product-price"><strong>${product.price_product}</strong></h1>
                                <h2 className="product-info-type">{product.quantity}</h2>
                            </div>
                        </div>
                        <div className="shop-control-elements"> 
                            <button className="btn btn-dark">
                                <i className="fa-solid fa-shopping-cart"></i> Agregar al carrito
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            </div>
            <FooterComponent 
                handleOpenLoginModal={handleOpenLoginModal} 
                userRole={userRole}
                handleLogout={handleLogout}
            />
        </div>
    );
};

export default ProductsByType;