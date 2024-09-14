import React, { useEffect, useState } from "react";
import useAuthStore from "../../components/store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../components/functions/axiosConfig';
import {useNavigate } from 'react-router-dom';

import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";
import QuantitySelector from "../../components/functions/QuantitySelector";
import { addProductToCart } from "../../components/functions/CartsUtils";
import Layout from "../../routes/LayoutControl/Layouts";
import './productByPrice.css'

const ProductsByPrice = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); 
    const [totalPages, setTotalPages] = useState(0);
    const {token, checkToken } = useAuthStore();
    const [totalPrices, setTotalPrices] = useState({});
    const [QuantityCart, setQuantityCart] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(false); 
    const [fullScreenProductId, setFullScreenProductId] = useState(null);
    
    const navigate = useNavigate();
    const [setShowLoginModal] = useState(false);
    const [userRole, setUserRole] = useState(null);


    const handleAddProductCart = (productId, quantity) => {
        addProductToCart(token, productId, quantity);
    };

    const handleOpenLoginModal = () => setShowLoginModal(true);

    useEffect(() => {
        // Método para obtener el token almacenado
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null);
    }, []);

    const fetchProductsByPrice = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            setLoading(true);
            try {
                const response = await axiosAuth.get("/products/price", {
                    params : {
                        page: currentPage,
                        size: pageSize
                    }
                });
                setProducts(response.data.items || []);
                setTotalPages(response.data.total_pages || 0);
            } catch (error){
                setError(error.response ? error.response.data.detail : "Error fetching products");
            } finally {
                setLoading(false);
            }
        }
    };

    
    useEffect(() => {
        checkToken();
        fetchProductsByPrice();
    }, [checkToken, currentPage, pageSize]);



    const handleLogout = () => {
        useAuthStore.getState().clearToken();
        setUserRole(null);
    };

    const handlePageChange = (page) => {
        fetchProductsByPrice();
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        fetchProductsByPrice();
        setPageSize(size);
        setCurrentPage(1);
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

    const handleProductClick = (productId) => {
        navigate(`/e-commerce/products/detail/${productId}`);
    };

    const handleImageClick = (productId) => {
        setFullScreenProductId(productId);
        setIsFullScreen(true);
    };

    const handleFullScreenClose = () => {
        setIsFullScreen(false);
        setFullScreenProductId(null);
    };

    const getImagesForProduct = (product) => {
        return [
            `${resourcesInstance.defaults.baseURL}${product.center_picture}`,
            `${resourcesInstance.defaults.baseURL}${product.side_picture}`,
        ];
    };
    

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const prevImage = () => {
        const images = getImagesForProduct(products.find(product => product.id === fullScreenProductId));
        const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
    };
    
    const nextImage = () => {
        const images = getImagesForProduct(products.find(product => product.id === fullScreenProductId));
        const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
    };
    


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="prices-container">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={() => useAuthStore.getState().clearToken()}
                isECommerce={true}
            />
            {isFullScreen && fullScreenProductId !== null && (
                <div className="fullscreen-modal">
                    <div className="fullscreen-overlay" onClick={handleFullScreenClose}></div>
                    <div className="fullscreen-content">
                        <button className="close-button" onClick={handleFullScreenClose}>
                            <span>&times;</span>
                        </button>
                        <button className="arrow-button arrow-left" onClick={prevImage}>
                            <span>&larr;</span>
                        </button>
                        <button className="arrow-button arrow-right" onClick={nextImage}>
                            <span>&rarr;</span>
                        </button>
                        {products
                            .filter((product) => product.id === fullScreenProductId)
                            .map((product) => (
                                <div key={product.id}>
                                    <img
                                        src={getImagesForProduct(product)[currentImageIndex]}
                                        alt="Full Screen"
                                        className="fullscreen-image"
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}

            
            <div className="background-container-pgprice">
                <Layout/>
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

                <div className="product-list-pgprice">
                    {products.map((product) => (
                    <div key={product.id} className="product-item-pgprice mb-3" >
                        <div className="product-image-container-pgprice">
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${product.center_picture}`}
                                alt={`Product ${product.id}`}
                                className="center-image"
                                onClick={() => handleImageClick(product.id)}

                            />
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${product.side_picture}`}
                                alt={`Product ${product.id}`}
                                className="side-imagen"
                                onClick={() => handleImageClick(product.id)}

                            />
                        </div>
                        <div className="product-details-pgprice">
                            <div className="description-list">
                                <h2 className="product-info-pgprice">{product.brand?.name || 'N/A'}</h2>
                                <h1 className="product-info-pgprice"><strong>{product.name_product}</strong></h1>
                                <p className="product-info-pgprice">Color: {product.color}</p>
                                <p className="product-info-pgprice">Tamaño: {product.size}</p>
                                <button className="btn btn-dark" onClick={() => handleProductClick(product.id)} 
                                    >más detalles</button>
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
                                Agregar al carrito
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

export default ProductsByPrice;