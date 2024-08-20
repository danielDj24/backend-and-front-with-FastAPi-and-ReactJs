import React,{useEffect,useState} from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../functions/axiosConfig';
import { ShowErrorAlter } from '../../functions/Alerts';
import { useParams } from 'react-router-dom'; 

import { addProductToCart } from "../../functions/CartsUtils";
import QuantitySelector from "../../functions/QuantitySelector";
import MenuComponent from "../../network/Menu/MenuComponent";
import FooterComponent from "../../network/Footer/footerComponent"

import './productsBrands.css'
import BannerPlus from "../../../assets/bannersBurn/PLusssizeBanner.jpg"

const ProductsByBrand = () => {
    const {brandId} = useParams();
    const [totalPrices, setTotalPrices] = useState({});
    const [QuantityCart, setQuantityCart] = useState([]);
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); 
    const [totalPages, setTotalPages] = useState(0);
    const {token, checkToken } = useAuthStore();

    
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
        // Método para obtener el token almacenado
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null);
    }, []);

    useEffect(() => {
        if (brandId) {
            fetchProducts();
        } else {
            setLoading(false);
            setError("brandId is not defined");
        }
        }, [currentPage, pageSize, brandId]);

    const fetchProducts = async () => {
        setLoading(true);
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get(`/products/brand/${brandId}`, {
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

    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div className="product-container">
        <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
                isECommerce={true}
            />
        <div className="banner-blog">
                        <div>
                        <img src={BannerPlus} alt="banner blog" />
                            <p>Productos</p>
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
            <div className="product-list-brands">
                {products && products.map((product) => (
                    <div key={product.id} className="product-item-brands mb-3">
                        <div className="product-image-container-brand">
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
                        <div className="product-details-brand">
                            <div className="description-list">
                                <h2 className="product-info-brand">{product.brand?.name || 'N/A'}</h2>
                                <h1 className="product-info-brand"><strong>{product.name_product}</strong></h1>
                                <p className="product-info-brand">Color: {product.color}</p>
                                <p className="product-info-brand">Tamaño: {product.size}</p>
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

export default ProductsByBrand;