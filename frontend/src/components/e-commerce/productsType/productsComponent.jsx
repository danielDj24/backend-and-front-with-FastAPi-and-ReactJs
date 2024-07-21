import React,{useEffect, useState} from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../functions/axiosConfig';
import { ShowErrorAlter } from '../../functions/Alerts';
import { useParams } from 'react-router-dom'; 

import MenuComponent from "../../network/Menu/MenuComponent";
import FooterComponent from "../../network/Footer/footerComponent"

import BannerPlus from "../../../assets/bannersBurn/PLusssizeBanner.jpg"

const ProductsByType = () =>{
    const { gender } = useParams();
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); 
    const [totalPages, setTotalPages] = useState(0);
    const [brands, setBrands] = useState([]);
    const { token } = useAuthStore();

    // Constantes para controlar el login y el registro en el modal de usuarios
    const [activeForm, setActiveForm] = useState('login');
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Control de rutas para el login admin
    const [userRole, setUserRole] = useState(null);

    const handleOpenLoginModal = () => setShowLoginModal(true);

    useEffect(() => {
        // Método para obtener el token almacenado
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null);
    }, []);
        

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
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
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
            <div className="product-list">
                {products.map((product) => (
                    <div key={product.id} className="product-item mb-3">
                        <div className="product-image-container">
                            <img src={`${resourcesInstance.defaults.baseURL}${product.center_picture}`} alt={`Product ${product.id}`} className="product-image" />
                            <img src={`${resourcesInstance.defaults.baseURL}${product.side_picture}`} alt={`Product ${product.id}`} className="product-image" />
                        </div>
                        <div className="product-details">
                            <p className="product-info"><strong> {product.name_product}</strong></p>
                            <p className="product-info"> {product.frame_material}</p>
                            <p className="product-info"> {product.color}</p>
                            <p className="product-info"> {product.shape.name_shape}</p>
                            <p className="product-info"> {product.brand.name}</p>
                            <p className="product-info"> {product.discount.discount_percentage}%</p>
                            <p className="product-info"> {product.size}</p>
                            <p className="product-info"> {product.gender}</p>
                            <p className="product-info"> {product.quantity}</p>
                            <p className="product-info"> {product.price_product}</p>
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