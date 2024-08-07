import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, axiosInstanceFiles, resourcesInstance } from '../../functions/axiosConfig';
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";

import "./productsControl.css"

const CreateProduct = () => {
    const [nameProduct, setNameProduct ] = useState('');
    const [frameMaterial, setFrameMaterial] = useState('');
    const [color, setColor] = useState('');
    const [size, setSize] = useState('');
    const [gender, setGender] = useState('');
    const [quantity, setQuantity] = useState('');
    const [priceProduct, setPriceProduct] = useState('');
    const [brand, setBrand] = useState('');
    const [shape, setShape] = useState('');
    const [discount, setDiscount] = useState('');
    
    const [brands, setBrands] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [centerPictureFile, setCenterPictureFile] = useState(null);
    const [sidePictureFile, setSidePictureFile] = useState(null);
    const { token, checkToken } = useAuthStore();
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [productIdDelete,setProductIdDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    //pagination 
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); 
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        checkToken();
        fetchProducts();
        fetchBrands();
        fetchShapes();
        fetchDiscounts();

    }, [checkToken, currentPage, pageSize]);

    const fetchProducts = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get("/products", {
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

    const fetchBrands = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get("/uploaded/brands");
                setBrands(response.data);
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching brands");
            } finally {
                setLoading(false);
            }
        }else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };
    
    const fetchShapes = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get("/product/shapes");
                setShapes(response.data);
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching shapes");
            } finally {
                setLoading(false);
            }
        }else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const fetchDiscounts = async () => {
        if (token){
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get("/products/discount/all");
                setDiscounts(response.data);
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching discounts");
            } finally {
                setLoading(false);
            }
        }else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const HandleCreateProduct = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.post("/create/product", {
                    name_product: nameProduct,
                    frame_material: frameMaterial,
                    color: color,
                    size: size,
                    gender: gender,
                    quantity: quantity,
                    price_product: priceProduct,
                    shape_id: shape,
                    brand_id: brand,
                    discount_id: discount
                });
                const centerPictureId = response.data.id;
                await handleUploadCenterImage(centerPictureId);
                const sidePictureId = response.data.id;
                await handleUploadSideImage(sidePictureId);
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating product");
                ShowErrorAlter("Error", "No se pudo crear el producto.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
    };

    const handleOpenModal = () => {
        setModalMessage("¿Estás seguro de crear este producto?");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmModal = () => {
        setShowModal(false);
        HandleCreateProduct();
    };

    const handleUploadCenterImage = async (centerPictureId) => {
        if (token && centerPictureFile) {
            const axiosAuth = axiosInstanceFiles(token);
            const formData = new FormData();
            formData.append("file", centerPictureFile);
            try {
                await axiosAuth.post(`/create/products/${centerPictureId}/picture_center`, formData);
                ShowSuccesAlert('Center picture uploaded successfully!');
                fetchProducts();
                fetchBrands();
                fetchShapes();
                fetchDiscounts();
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating center picture");
                ShowErrorAlter("Error", "No se pudo subir la imagen del centro.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token o el archivo. Por favor, inicia sesión y selecciona un archivo.");
        }
    };

    const handleUploadSideImage = async (sidePictureId) => {
        if (token && sidePictureFile) {
            const axiosAuth = axiosInstanceFiles(token);
            const formData = new FormData();
            formData.append("file", sidePictureFile);
            try {
                await axiosAuth.post(`/create/products/${sidePictureId}/side_picture`, formData);
                ShowSuccesAlert("Side picture uploaded successfully!");
                fetchProducts();
            } catch (err) {
                setError(err.response ? err.response.data.detail : "Error creating side picture");
                ShowErrorAlter("Error", "No se pudo subir la imagen del costado.");
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token o el archivo. Por favor, inicia sesión y selecciona un archivo.");
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (token){
            const axiosAuth = axiosInstanceAuth(token);
            try{
                await axiosAuth.delete(`/products/delete/${productId}`)
                setProducts(products.filter((product) => product.id !== productId));
                ShowSuccesAlert('product deleted successfully!');
            }catch (err) {
                    setError(err.response ? err.response.data.detail : "Error creating product");
                    ShowErrorAlter("Error", "No se pudo eliminar el producto.");
                    ShowErrorAlter("Error", `No se pudo eliminar el producto ${productId}.`);
            }
        } else {
            ShowErrorAlter("Error", "No se encontró el token. Por favor, inicia sesión.");
        }
        fetchProducts();
    };

    
    const handleOpenDeleteModal = (productId) => {
        setProductIdDelete(productId);
        setModalMessage("¿Estás seguro de eliminar este producto?");
        setShowModal(true);
    };

    const handleConfirmDeleteModal = () => {
        setShowModal(false);
        handleDeleteProduct(productIdDelete);
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

    const handleOpenBrandsPage = () => {
        window.open('/intranet/config/upload/brands', '_blank', 'width=800,height=600');
        fetchProducts();
    };

    const handleOpenShapesPage = () => {
        window.open('/intranet/config/upload/shapes', '_blank', 'width=800,height=600');
        fetchProducts();
    };

    const handleOpenDiscountsPage = () => {
        window.open('/intranet/config/upload/discounts', '_blank', 'width=800,height=600');
        fetchProducts();
    };

    return (
        <div className="container">
        <div className="background-container">
            <h2 className = "titles-control">Crear Productos</h2>
            <form onSubmit={(e) => {e.preventDefault(); handleOpenModal();}}>
                <div className="form-group">
                    <label>Nombre del producto:</label>
                    <input type="text" value={nameProduct} onChange={(e) => setNameProduct(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Material del Marco:</label>
                    <input type="text" value={frameMaterial} onChange={(e) => setFrameMaterial(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Color del Marco:</label>
                    <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Medidas del Marco:</label>
                    <input type="text" value={size} onChange={(e) => setSize(e.target.value)}  className="form-control"/>
                </div>
                <div className="form-group">
                    <label>Tipo de producto:</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="form-control">
                        <option value="">Seleccionar tipo de producto</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                        <option value="Unisex">Unisex</option>
                        <option value="Optico">Óptico</option>
                        <option value="Lentes de sol">Lentes de sol</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Cantidad:</label>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="form-control"/>
                </div>
                <div className="form-group">
                    <label>Precio:</label>
                    <input type="number" value={priceProduct} onChange={(e) => setPriceProduct(e.target.value)} className="form-control"/>
                </div>
                <div className="form-group">
                    <label>Marca:</label>
                    <select  onChange={(e) => setBrand(e.target.value)} className="form-control">
                        <option value="">Seleccionar una Marca</option>
                        {brands.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={handleOpenBrandsPage}
                    >
                    Gestionar Marcas
                    </button>
                </div>
                <div className="form-group">
                    <label>forma del Marco:</label>
                    <select onChange={(e) => setShape(e.target.value)} className="form-control">
                        <option value="">Seleccionar una Forma</option>
                        {shapes.map((s) => (
                            <option key={s.id} value={s.id}>{s.name_shape}</option>
                        ))}
                    </select>
                    <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={handleOpenShapesPage}
                    >
                    Gestionar Formas
                    </button>
                </div>
                <div className="form-group">
                    <label>Procentaje de descuento:</label>
                    <select onChange={(e) => setDiscount(e.target.value)} className="form-control">
                        <option value="">Seleccionar un porcentaje de descuento</option>
                        {discounts.map((d) => (
                            <option key={d.id} value={d.id}>{d.discount_percentage}% - {d.description}</option>
                        ))}
                    </select>
                    <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={handleOpenDiscountsPage}
                    >Gestionar Descuentos</button>
                </div>
                <div className="form-group">
                    <label>Foto del Marco (centro):</label>
                    <input type="file" onChange={(e) => setCenterPictureFile(e.target.files[0])} className="form-control my-2"/>
                </div>
                <div className="form-group">
                    <label>Foto del Marco (costado):</label>
                    <input type="file" onChange={(e) => setSidePictureFile(e.target.files[0])} className="form-control my-2"/>
                </div>
                <button className="btn btn-primary" onClick={handleOpenModal}>Crear Nuevo Producto</button>
            </form>            
        </div>
        <div className="background-container">
            <h2 className = "title">Productos existentes</h2>
            <div className="filter-container">
                <div className="filter-group">
                    <select className="btn btn-light" onChange={(e) => setBrand(e.target.value)} >
                        <option value="">Buscar por Marca</option>
                        {brands.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <select className="btn btn-light" onChange={(e) => setShape(e.target.value)} >
                        <option value="">Buscar por Forma</option>
                        {shapes.map((s) => (
                            <option key={s.id} value={s.id}>{s.name_shape}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <select className="btn btn-light" onChange={(e) => setDiscount(e.target.value)} >
                        <option value="">Buscar por descuento</option>
                        {discounts.map((d) => (
                            <option key={d.id} value={d.id}>{d.discount_percentage}% - {d.description}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="pagination-controls">
                <button  class="btn btn-light" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
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
                            <p className="product-info">nombre: {product.name_product}</p>
                            <p className="product-info">material: {product.frame_material}</p>
                            <p className="product-info">color: {product.color}</p>
                            <p className="product-info">marca: {product.brand.name}</p>
                            <p className="product-info">medida: {product.size}</p>
                            <p className="product-info">cantidad: {product.quantity}</p>
                            <p className="product-info">precio: {product.price_product}</p>
                        </div>
                        
                        <button className="delete-button mb-2" onClick={() => handleOpenDeleteModal(product.id)}>Eliminar</button>
                        
                    </div>
                ))}
            </div>
            <ConfirmationModal
                show={showModal}
                handleClose={handleCloseModal}
                handleConfirm={modalMessage.includes("eliminar") ? handleConfirmDeleteModal : handleConfirmModal}
                message={modalMessage}
            />
        </div>
    </div>
    );
};

export default CreateProduct;
