import React, { useState, useEffect } from "react";
import useAuthStore from "../../components/store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../components/functions/axiosConfig';
import { ShowErrorAlter } from '../../components/functions/Alerts';

import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";

import BannerPlus from "../../assets/bannersBurn/PLusssizeBanner.jpg";
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

    const [shapes, setShapes] = useState([]);
    const [brands, setBrands] = useState([]);
    const [frameMaterials, setFrameMaterials] = useState([]);
    const [colors, setColors] = useState([]);
    const [gender, setGender] = useState([]);

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
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
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
        checkToken();
        fetchFieldsSearch();
    }, [checkToken, currentPage, pageSize]);

    const handleLogout = () => {
        useAuthStore.getState().clearToken();
        setUserRole(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        handleSearch();
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
        handleSearch();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="search-container">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={() => useAuthStore.getState().clearToken()}
                isECommerce={true}
            />
            <div className="banner-blog">
                <div>
                    <img src={BannerPlus} alt="banner blog" />
                    <p>Buscar productos</p>
                </div>
            </div>
            <div className="background-container">
                <div className="search-elements">
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
                    <div className="product-list">
                        {products.map((product) => (
                            <div key={product.id} className="product-item mb-3">
                                <div className="product-image-container">
                                    <img src={`${resourcesInstance.defaults.baseURL}${product.center_picture}`} alt={`Product ${product.id}`} className="product-image" />
                                    <img src={`${resourcesInstance.defaults.baseURL}${product.side_picture}`} alt={`Product ${product.id}`} className="product-image" />
                                </div>
                                <div className="product-details">
                                    <p className="product-info"><strong>{product.name_product}</strong></p>
                                    <p className="product-info">{product.frame_material}</p>
                                    <p className="product-info">{product.color}</p>
                                    <p className="product-info">{product.shape?.name_shape || 'N/A'}</p>
                                    <p className="product-info">{product.brand?.name || 'N/A'}</p>
                                    <p className="product-info">{product.discount?.discount_percentage || 'N/A'}%</p>
                                    <p className="product-info">{product.size}</p>
                                    <p className="product-info">{product.gender}</p>
                                    <p className="product-info">{product.quantity}</p>
                                    <p className="product-info">{product.price_product}</p>
                                </div>
                            </div>
                        ))}
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
