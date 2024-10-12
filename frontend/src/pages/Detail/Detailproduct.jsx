import React,{useEffect,useState} from "react";
import useAuthStore from "../../components/store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../components/functions/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';

import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";
import QuantitySelector from "../../components/functions/QuantitySelector";
import { addProductToCart } from "../../components/functions/CartsUtils";
//breadcrums
import Layout from "../../routes/LayoutControl/Layouts";
import './Detailproduct.css'

const DetailProduct = () => {
    const {productId} = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const {token, checkToken } = useAuthStore();

    const [product, setProduct] = useState(null);
    const [totalPrices, setTotalPrices] = useState({});
    const [QuantityCart, setQuantityCart] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    const [setShowLoginModal] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const [isFullScreen, setIsFullScreen] = useState(false); 
    const [fullScreenImage, setFullScreenImage] = useState(null); 

    const handleOpenLoginModal = () => setShowLoginModal(true);

    useEffect(() => {
        checkToken();
        fetchProduct();
    }, [checkToken, productId]);

    useEffect(() => {
        if (product) {
            fetchRelatedProducts(product.name_product);
        }
    }, [product]);
    const handleLogout = () => {
        useAuthStore.getState().clearToken();
        setUserRole(null);
    };

    useEffect(() => {
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null);
    }, []);

    const fetchProduct = async () => {
        setLoading(true);
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get(`/products/existing/${productId}`);
                setMainImage(`${resourcesInstance.defaults.baseURL}${response.data.center_picture}`); // Configurar la imagen principal

                setProduct(response.data);
                fetchRelatedProducts();
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching products");
            } finally {
                setLoading(false);
            }
        }
    };

    const fetchRelatedProducts = async (productName) => {
        if (!productName) return; 
        const response = await axiosInstanceAuth(token).get(`/products/name/${productName}`);
        setRelatedProducts(response.data.filter(p => p.id !== product.id));
    
    };

    const handleAddProductCart = (productId, quantity) => {
        addProductToCart(token, productId, quantity);
    };
    

    const handleQuantityChange = (productId, price, quantity) => {
        setQuantityCart(quantity);  
        setTotalPrices(prevTotalPrices => ({
            ...prevTotalPrices,
            [productId]: price * quantity
        }));
    };

    const handleImageClick = (imageUrl) => {
        setIsFullScreen(true);
        setFullScreenImage(imageUrl);
    };

    const handleFullScreenClose = () => {
        setIsFullScreen(false);
    };

    const images = [
        product?.center_picture ? `${resourcesInstance.defaults.baseURL}${product.center_picture}` : '',
        product?.side_picture ? `${resourcesInstance.defaults.baseURL}${product.side_picture}` : '',
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleFullScreenImageSwap = (newImage) => {
        setFullScreenImage(newImage);
    };

    const prevImage = () => {
        const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
        handleFullScreenImageSwap(images[newIndex]);
    };

    const nextImage = () => {
        const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
        handleFullScreenImageSwap(images[newIndex]);
    };

    const handleImageMainClick = (imageUrl) => {
        setMainImage(imageUrl);
    };

    const handleProductClick = (productId) => {
        navigate(`/e-commerce/products/detail/${productId}`);
    };

    const shapeName = product?.shape?.name_shape || 'N/A';
    const shapeImage = `${resourcesInstance.defaults.baseURL}${product?.shape?.shape_picture}` || '';
    
    const formatPrice = (price) => {
        return price.toLocaleString('es-CO', {  maximumFractionDigits: 2 });
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!product) return <p>Producto no encontrado</p>;

    return (
        <div className="detail-container">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={() => useAuthStore.getState().clearToken()}
                isECommerce={true}
            />
            {isFullScreen && (
                <div className="fullscreen-modal">
                    <div className="fullscreen-overlay" onClick={handleFullScreenClose}></div>
                    <div className="fullscreen-content">

                        <button className="close-button" onClick={handleFullScreenClose}>
                            <span>&times;</span>
                        </button>

                        <button className="arrow-button arrow-left" onClick={prevImage}>
                            <span>&larr;</span>
                        </button>

                        <img src={fullScreenImage} alt="Full Screen" className="fullscreen-image" />

                        <button className="arrow-button arrow-right" onClick={nextImage}>
                            <span>&rarr;</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="background-container-detail-shop">
            <Layout/>
                <div className="detail-title-product">
                <h1>Detalles del producto</h1>
                </div>
                <div key={product.id} className="product-item-detail mb-3">
                
                <div className="space-related-items">
                    <div className="detail-img-product">
                    <div className="image-inspect-detail">
                        <img
                                src={mainImage}
                                alt={`Product ${product.id}`}
                                className="center-image-detail"
                                onClick={() => handleImageClick(mainImage)}
                            />
                        </div>
                        <div className="product-image-container-detail">
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${product.center_picture}`}
                                alt={`Product ${product.id}`}
                                className="side-imagen-detail"
                                onClick={() => handleImageMainClick(`${resourcesInstance.defaults.baseURL}${product.center_picture}`)}
                            />
                            <img
                                src={`${resourcesInstance.defaults.baseURL}${product.side_picture}`}
                                alt={`Product ${product.id}`}
                                className="side-imagen-detail"
                                onClick={() => handleImageMainClick(`${resourcesInstance.defaults.baseURL}${product.side_picture}`)}
                            />
                        
                        </div>
                        
                    </div>
                </div>

                <div className="product-detail-container">
                    <div className="title-detail-product">
                        <h2 className="product-info-discount">{product.brand?.name || 'N/A'}</h2>
                        <h1 className="product-info-discount"><strong>{product.name_product}</strong></h1>
                    </div>
                    
                    <div className="shop-detail-product">
                        <div className="products-buy-details">
                            {product.discount?.discount_percentage > 0 ? (
                                <>
                                    <h5 className="product-price-discount">
                                        <s>${formatPrice(product.price_product)}</s> -{product.discount.discount_percentage}%
                                    </h5>
                                    <h1 className="product-price"><strong>${formatPrice(product.discounted_price)}</strong></h1>
                                    <p className="roduct-price">Stock: {product.quantity}</p>

                                </>
                            ) : (
                                <h1 className="product-price"><strong>${formatPrice(product.price_product)}</strong></h1>
                            )}
                        </div>

                        <div className="shop-quantity-product">
                            <div className="quantity-selector-wrapper">
                                <QuantitySelector
                                    initialQuantity={0}
                                    maxQuantity={product.quantity} 
                                    onQuantityChange={(newQuantity) => handleQuantityChange(product.id, product.discounted_price, newQuantity)}
                                />
                                <strong className="price-overlay">${formatPrice(totalPrices[product.id] || product.discounted_price)}</strong>
                            </div>
                            <div className="buttom-shop-detail">
                                
                                <button
                                    className="btn btn-dark" style={{ marginLeft: '17px', marginBottom: '10px' }}
                                    onClick={() => handleAddProductCart(product.id, QuantityCart)} 
                                    >
                                    Agregar al carrito
                                </button>
                            </div>
                        </div>
                        
                    </div>
                    <div className="related-products">
                            {relatedProducts.length > 0 && (
                                <div style={{ marginBottom: '5px' }} className="related-products-section">
                                    <h5>Colores disponibles:</h5>
                                    <div className="related-products-list">
                                        {relatedProducts.map(relatedProduct => (
                                            <div key={relatedProduct.id} className="related-product-item" onClick={() => handleProductClick(relatedProduct.id)}>
                                                <img src={`${resourcesInstance.defaults.baseURL}${relatedProduct.center_picture}`} alt={relatedProduct.color} className="related-product-image" />
                                                <p>{relatedProduct.color}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                
                    <div  className="info-product">
                    <h5>Información del producto:</h5>
                    <div className="content-info-product">
                        <p className="product-info">color: {product.color}</p>
                        <p className="product-info">material: {product.frame_material}</p>
                        <p className="product-info">publico destino: {product.gender ? product.gender : 'N/A'}</p>
                        <p className="product-info">forma: {shapeName}</p>
                        <p className="product-info">medida: {product.size}</p>
                        <p className="product-info">Puente: {product.size_caliber}</p>
                        <p className="product-info">vertical: {product.size_vertical}</p>
                        <p className="product-info">brazo: {product.size_arm}</p>
                    </div>
                    
                </div> 
            </div>
        </div>
        
        <div className="detail-shape-product">
            <h2>Información sobre el tamaño</h2>
            <img src={shapeImage} alt={shapeName} className="shape-image" /> 
        </div> 
    </div>
            <FooterComponent 
                handleOpenLoginModal={handleOpenLoginModal} 
                userRole={userRole}
                handleLogout={handleLogout}
            />
        </div>
    );
}

export default DetailProduct;