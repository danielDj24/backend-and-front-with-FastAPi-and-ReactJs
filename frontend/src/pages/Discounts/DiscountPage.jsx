import React, { useEffect, useState } from "react";
import useAuthStore from "../../components/store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../components/functions/axiosConfig';
import { ShowErrorAlter } from '../../components/functions/Alerts';
import { useParams } from 'react-router-dom';

import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";

import BannerPlus from "../../assets/bannersBurn/PLusssizeBanner.jpg";
import './discountPage.css';

const SearchProductsByDiscount = () => {
    const { discountId } = useParams(); 
    const [discounts, setDiscounts] = useState([]);
    const [selectedDiscount, setSelectedDiscount] = useState(discountId || "");
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); 
    const [totalPages, setTotalPages] = useState(0);
    const {token, checkToken } = useAuthStore();

    const [setShowLoginModal] = useState(false);
    const [userRole, setUserRole] = useState(null);

    const handleOpenLoginModal = () => setShowLoginModal(true);

    useEffect(() => {
        fetchDiscounts();
        checkToken();
    }, [checkToken, currentPage, pageSize]);

    const handleLogout = () => {
        useAuthStore.getState().clearToken();
        setUserRole(null);
    };

    useEffect(() => {
        if (selectedDiscount) {
            fetchProducts();
        }
    }, [selectedDiscount, currentPage, pageSize]);

    const fetchDiscounts = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get("/products/discount/all");
                setDiscounts(response.data);
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching discounts");
            } finally {
                setLoading(false);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get(`/products/discount/${selectedDiscount}`, {
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

    const handleDiscountChange = (e) => {
        setSelectedDiscount(e.target.value);
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
                    <p>Buscar productos por descuento</p>
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
                <div className="discount-selector">
                    <div className="form-group">
                    <label htmlFor="discount-select">Selecciona un descuento:</label>
                    <select id="discount-select" value={selectedDiscount} onChange={handleDiscountChange} className="form-control">
                        <option value="">Por favor selecciona un porcentaje de descuento</option>
                        {discounts.map((discount) => (
                            <option key={discount.id} value={discount.id}>
                                {discount.discount_percentage}% de descuento
                            </option>
                        ))}
                    </select>
                    </div>
                </div>
                <div className="product-list">
                    {products && products.map((product) => (
                        <div key={product.id} className="product-item mb-3">
                            <div className="product-image-container">
                                <img src={`${resourcesInstance.defaults.baseURL}${product.center_picture}`} alt={`Product ${product.id}`} className="product-image" />
                                <img src={`${resourcesInstance.defaults.baseURL}${product.side_picture}`} alt={`Product ${product.id}`} className="product-image" />
                            </div>
                            <div className="product-details">
                                <p className="product-info"><strong>{product.name_product}</strong></p>
                                <p className="product-info">{product.frame_material}</p>
                                <p className="product-info">{product.color}</p>
                                <p className="product-info">{product.shape.name_shape}</p>
                                <p className="product-info">{product.brand.name}</p>
                                <p className="product-info">{product.discount.discount_percentage}%</p>
                                <p className="product-info">{product.size}</p>
                                <p className="product-info">{product.gender}</p>
                                <p className="product-info">{product.quantity}</p>
                                <p className="product-info">{product.price_product}</p>
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

export default SearchProductsByDiscount;
