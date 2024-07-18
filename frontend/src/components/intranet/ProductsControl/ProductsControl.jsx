import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, axiosInstanceFiles } from '../../functions/axiosConfig';
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";

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

    useEffect(() => {
        checkToken();
        fetchProducts();
        fetchBrands();
        fetchShapes();
        fetchDiscounts();

    }, [checkToken]);

    const fetchProducts = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try {
                const response = await axiosAuth.get("/products");
                setProducts(response.data);
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Create Product</h2>
            <form onSubmit={(e) => {e.preventDefault(); HandleCreateProduct();}}>
                <div>
                    <label>Product Name:</label>
                    <input type="text" value={nameProduct} onChange={(e) => setNameProduct(e.target.value)} />
                </div>
                <div>
                    <label>Frame Material:</label>
                    <input type="text" value={frameMaterial} onChange={(e) => setFrameMaterial(e.target.value)} />
                </div>
                <div>
                    <label>Color:</label>
                    <input type="text" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div>
                    <label>Size:</label>
                    <input type="text" value={size} onChange={(e) => setSize(e.target.value)} />
                </div>
                <div>
                    <label>Gender:</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">Select gender</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                        <option value="Unisex">Unisex</option>
                    </select>
                </div>
                <div>
                    <label>Quantity:</label>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                <div>
                    <label>Price:</label>
                    <input type="number" value={priceProduct} onChange={(e) => setPriceProduct(e.target.value)} />
                </div>
                <div>
                    <label>Brand:</label>
                    <select onChange={(e) => setBrand(e.target.value)}>
                        <option value="">Select a brand</option>
                        {brands.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Shape:</label>
                    <select onChange={(e) => setShape(e.target.value)}>
                        <option value="">Select a shape</option>
                        {shapes.map((s) => (
                            <option key={s.id} value={s.id}>{s.name_shape}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Discount:</label>
                    <select onChange={(e) => setDiscount(e.target.value)}>
                        <option value="">Select a discount</option>
                        {discounts.map((d) => (
                            <option key={d.id} value={d.id}>{d.discount_percentage}% - {d.description}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Center Picture:</label>
                    <input type="file" onChange={(e) => setCenterPictureFile(e.target.files[0])} />
                </div>
                <div>
                    <label>Side Picture:</label>
                    <input type="file" onChange={(e) => setSidePictureFile(e.target.files[0])} />
                </div>
                <button type="submit">Create Product</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default CreateProduct;
