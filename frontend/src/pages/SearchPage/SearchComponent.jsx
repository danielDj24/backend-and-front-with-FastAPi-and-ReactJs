import React, { useState, useEffect } from "react";
import useAuthStore from "../../components/store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../components/functions/axiosConfig';
import { ShowErrorAlter, ShowSuccesAlert } from '../../components/functions/Alerts';
import DownloadPdfButton from "../../components/functions/DownloadPdfButton";

import Layout from "../../routes/LayoutControl/Layouts";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";
import QuantitySelector from "../../components/functions/QuantitySelector";
import { addProductToCart } from "../../components/functions/CartsUtils";
import { useNavigate } from 'react-router-dom'; 
import "./searchPage.css"

const SearchPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, checkToken } = useAuthStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [totalPrices, setTotalPrices] = useState({});
    const navigate = useNavigate();
    const [isFullScreen, setIsFullScreen] = useState(false); 
    const [fullScreenProductId, setFullScreenProductId] = useState(null);

    const [shapes, setShapes] = useState([]);
    const [brands, setBrands] = useState([]);
    const [frameMaterials, setFrameMaterials] = useState([]);
    const [colors, setColors] = useState([]);
    const [gender, setGender] = useState([]);
    const [QuantityCart, setQuantityCart] = useState([]);

    const handleAddProductCart = (productId, quantity) => {
        addProductToCart(token, productId, quantity);
    };

    const handleOpenLoginModal = () => setShowLoginModal(true);

    const [searchParams, setSearchParams] = useState({
        shape_id: '',
        brand_id: '',
        frame_material: '',
        color: '',
        gender: '',
        min_price: '',
        max_price: ''
    });

    const fetchFieldsSearch = async () => {
        const axiosAuth = axiosInstanceAuth(token);
        if (token) {
            try {
                const response = await axiosAuth.get("/products/search/fields");
                setShapes(response.data.shapes );
                setBrands(response.data.brands );
                setFrameMaterials(response.data.frame_materials );
                setColors(response.data.colors );
                setGender(response.data.genders);
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching field options");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const [priceRanges, setPriceRanges] = useState([
        { label: "Menos de 50,000", min: 0, max: 50000 },
        { label: "50,000 - 100,000", min: 50000, max: 100000 },
        { label: "100,000 - 150,000", min: 100000, max: 150000 },
        { label: "150,000 - 200,000", min: 150000, max: 200000 },
        { label: "Más de 200,000", max: 200000}
    ]);
    
    const handleSearch = async () => {
        const axiosAuth = axiosInstanceAuth(token);
        setLoading(true);
        const filteredParams = Object.keys(searchParams).reduce((acc, key) => {
            if (searchParams[key]) {
                acc[key] = searchParams[key];
            }
            return acc;
        }, {});
        if (token) {
            try {
                const response = await axiosAuth.get("/products/search", {
                    params: {
                        ...filteredParams,
                        page: currentPage,
                        size: pageSize
                    }
                });
                setProducts(response.data.items || []);
                setTotalPages(response.data.total_pages || 0);
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching products");
            } finally {
                setLoading(false);
            }
        }
    };


    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name === "price_range") {
            const [min, max] = value.split(",").map(Number);
            setSearchParams({
                ...searchParams,
                min_price: min,
                max_price: max
            });
        } else {
            setSearchParams({
                ...searchParams,
                [name]: value
            });
        }
    };

    useEffect(() => {
        // Método para obtener el token almacenado
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null);
    }, []);

    useEffect(() => {
        checkToken();
        fetchFieldsSearch();
        handleSearch();
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
        setCurrentPage(page);
        handleSearch();
    };

    const handlePageSizeChange = (size) => {
        handleSearch();
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
        <div className="search-container">
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

            <div className="background-container-search">

                <div className="search-elements">
                <Layout/>

                    <div className="search-info">
                        <h1>Filtros de Busqueda</h1>
                        <p>Realice busquedas avanzadas segun sus necesidades</p>
                    </div>
                    <form onSubmit={handleSearch}>
                        <div className="search-elements-filters">
                            <select name="shape_id" value={searchParams.shape_id} onChange={handleInputChange}>
                                <option value="">Seleccionar Forma</option>
                                {shapes.map(shape => (
                                    <option key={shape.id} value={shape.id}>{shape.name}</option>
                                ))}
                            </select>

                            <select name="brand_id" value={searchParams.brand_id} onChange={handleInputChange}>
                                <option value="">Seleccionar Marca</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>

                            <select name="frame_material" value={searchParams.frame_material} onChange={handleInputChange}>
                                <option value="">Seleccionar Material del Marco</option>
                                {frameMaterials.map((material, index) => (
                                    <option key={index} value={material}>{material}</option>
                                ))}
                            </select>

                            <select name="color" value={searchParams.color} onChange={handleInputChange}>
                                <option value="">Seleccionar Color</option>
                                {colors.map((color, index) => (
                                    <option key={index} value={color}>{color}</option>
                                ))}
                            </select>

                            <select name="gender" value={searchParams.gender} onChange={handleInputChange}>
                                <option value="">Seleccionar Género</option>
                                {gender.map((gen, index) => (
                                    <option key={index} value={gen}>{gen}</option>
                                ))}
                            </select>
                            <select name="price_range" value={searchParams.price_range} onChange={handleInputChange}>
                            <option value="">Seleccionar Rango de Precio</option>
                            {priceRanges.map((range, index) => (
                                <option key={index} value={`${range.min},${range.max}`}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                        <div className="filter-button-container">
                            <button className="btn btn-light mt-3" type="submit">
                                <i className="fa fa-search"></i> Aplicar filtros
                            </button>
                        </div>
                        </div>
                    </form>
                    
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
                    <div className="product-list-search">
                    {products.map((product) => (
                    <div key={product.id} className="product-item-search mb-3" >
                        <div className="product-image-container-search">
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
                        <div className="product-details-search">
                            <div className="description-list">
                                <h2 className="product-info-search">{product.brand?.name || 'N/A'}</h2>
                                <h1 className="product-info-search"><strong>{product.name_product}</strong></h1>
                                <p className="product-info-search">Color: {product.color}</p>
                                <p className="product-info-search">Tamaño: {product.size}</p>
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
                            {product.reserved_quantity > 0 && (
                                <p>Cantidad en el carrito: {product.reserved_quantity}</p>
                            )}
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
            </div>
            <FooterComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
            />
        </div>
    );
};

export default SearchPage;
