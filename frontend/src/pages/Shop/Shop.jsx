import React, { useEffect, useState } from "react";
import useAuthStore from "../../components/store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../components/functions/axiosConfig';
import {useNavigate } from 'react-router-dom';
import DownloadPdfButton from "../../components/functions/DownloadPdfButton";
import { ShowErrorAlter } from "../../components/functions/Alerts";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";
import QuantitySelector from "../../components/functions/QuantitySelector";
import { addProductToCart } from "../../components/functions/CartsUtils";
import Layout from "../../routes/LayoutControl/Layouts";
import './Shop.css'

const Shop = () => {
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

    const fetchAllProducts = async () =>{
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            setLoading(true);
            try {
                const response = await axiosAuth.get("/products", {
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
        fetchAllProducts();
    }, [checkToken, currentPage, pageSize]);



    const handleLogout = async () => {
        const token = useAuthStore.getState().token;  // Obtener el token almacenado en el frontend
        try {
            // Consumir la ruta del backend para invalidar el token
            const response = await axiosInstanceAuth(token).post('/logout');
            
            if (response.status === 200) {
                // Si la respuesta es exitosa, eliminar el token del frontend
                useAuthStore.getState().clearToken();
                setUserRole(null);  // Reiniciar el rol del usuario
                navigate('/');  // Redirigir al usuario a la página de inicio
            } else {
                ShowErrorAlter("Error al cerrar sesión en el backend");
            }
        } catch (error) {
            ShowErrorAlter("Error al cerrar sesión", error);
        }
    };

    const handlePageChange = (page) => {
        fetchAllProducts();
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        fetchAllProducts();
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
        <div className="shop-principal">
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
        <div className="background-container-shop">
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

                <div className="product-list-shop">
                    {products.map((product) => (
                    <div key={product.id} className="product-item-shop mb-3" >
                        <div className="product-image-container-shop">
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${product.side_picture}`}
                                alt={`Product ${product.id}`}
                                className="side-imagen"
                                onClick={() => handleImageClick(product.id)}
                            />
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${product.center_picture}`}
                                alt={`Product ${product.id}`}
                                className="center-image"
                                onClick={() => handleImageClick(product.id)}
                            />
                        </div>
                        <div className="product-details-shop">
                            <div className="description-list">
                                <h2 className="product-info-shop">{product.brand?.name || 'N/A'}</h2>
                                <h1 className="product-info-shop"><strong>{product.name_product}</strong></h1>
                                <p className="product-info-shop">Color: {product.color}</p>
                                <p className="product-info-shop">Tamaño: {product.size}</p>
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
                                        initialQuantity={0}
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
                <div className="generate-pdf-button">
                    <DownloadPdfButton products={products} /> 
                </div>
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


export default Shop;