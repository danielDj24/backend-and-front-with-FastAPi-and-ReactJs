import React, { useEffect, useState } from "react";
import useAuthStore from "../../components/store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../components/functions/axiosConfig';
import { ShowErrorAlter } from '../../components/functions/Alerts';
import { useParams } from 'react-router-dom';

import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";
import QuantitySelector from "../../components/functions/QuantitySelector";
import { addProductToCart } from "../../components/functions/CartsUtils";
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
    const [totalPrices, setTotalPrices] = useState({});
    const [QuantityCart, setQuantityCart] = useState([]);

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
        // Método para obtener el token almacenado
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null);
    }, []);

    
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

    const handleAddProductCart = (productId, quantity) => {
        addProductToCart(token, productId, quantity);
    };
    

    const handleQuantityChange = (productId, price, quantity) => {
        setQuantityCart(quantity);  // Actualiza la cantidad
        setTotalPrices(prevTotalPrices => ({
            ...prevTotalPrices,
            [productId]: price * quantity
        }));
    };

    const formatPrice = (price) => {
        return price.toLocaleString('es-CO', {  maximumFractionDigits: 2 });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

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
                <div className="product-list-discounts">
                {products && products.map((product) => (
                    <div key={product.id} className="product-item-discounts mb-3">
                        <div className="product-image-container-discount">
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
                        <div className="product-details-discount">
                            <div className="description-list">
                                <h2 className="product-info-discount">{product.brand?.name || 'N/A'}</h2>
                                <h1 className="product-info-discount"><strong>{product.name_product}</strong></h1>
                                <p className="product-info-discount">Color: {product.color}</p>
                                <p className="product-info-discount">Tamaño: {product.size}</p>
                            </div>
                            <div className="products-buy-details">
                            {product.discount?.discount_percentage > 0 ? (
                                <>
                                    <h5 className="product-price-discount">
                                        <s>${formatPrice(product.price_product)}</s> -{product.discount.discount_percentage}%
                                    </h5>
                                    <h1 className="product-price"><strong>${formatPrice(product.discounted_price)}</strong></h1>
                                </>
                            ) : (
                                <h1 className="product-price"><strong>${formatPrice(product.price_product)}</strong></h1>
                            )}
                                <div className="quantity-selector-wrapper">
                                    <QuantitySelector                            
                                        initialQuantity={1}
                                        maxQuantity={product.quantity} 
                                        onQuantityChange={(newQuantity) => handleQuantityChange(product.id, product.discounted_price, newQuantity)}
                                    />
                                    <strong className="price-overlay">${formatPrice(totalPrices[product.id] || product.discounted_price)}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="shop-control-elements"> 
                        <button
                            className="btn btn-dark"
                            onClick={() => handleAddProductCart(product.id, QuantityCart)} 
                            >
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

export default SearchProductsByDiscount;
