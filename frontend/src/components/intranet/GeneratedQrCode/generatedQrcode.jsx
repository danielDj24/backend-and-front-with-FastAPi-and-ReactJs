// components/GeneratedQrCode.js
import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../functions/axiosConfig';
import { ShowErrorAlter } from '../../functions/Alerts';

import './generatedQrCode.css';

const GeneratedQrCode = () => {
    const [products, setProducts] = useState([]);
    const [qrCodes, setQrCodes] = useState({}); // Almacenará las URLs de los QR generados
    const [loading, setLoading] = useState({
        products: true,
        qrCodes: false
    });
    const [error, setError] = useState('');
    const { token, checkToken } = useAuthStore();

    // Función para obtener productos
    const fetchProducts = async () => {
        if (token) {
            try {
                const axiosAuth = axiosInstanceAuth(token);
                const response = await axiosAuth.get("/products");
                setProducts(response.data.items || []);
                setLoading(prev => ({...prev, products: false}));
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error fetching products");
                ShowErrorAlter("Error", "No se pudieron obtener los productos.");
                setLoading(prev => ({...prev, products: false}));
            }
        }
    };

    // Función para generar y obtener un QR
    const fetchQrCode = async (productId, productName) => {
        try {
            const axiosAuth = axiosInstanceAuth(token);
            const response = await axiosAuth.get(
                `/generated_qr/${productId}`,
                {
                    params: { product_name: productName },
                    responseType: 'blob' 
                }
            );            
            const qrUrl = URL.createObjectURL(response.data);
            return qrUrl;
        } catch (error) {
            console.error(`Error generando QR para producto ${productId}:`, error);
            return null;
        }
    };

    // Generar QRs para todos los productos
    const generateAllQrCodes = async () => {
        setLoading(prev => ({...prev, qrCodes: true}));
        const newQrCodes = {};
        
        for (const product of products) {
            const qrUrl = await fetchQrCode(product.id, product.name_product);
            if (qrUrl) {
                newQrCodes[product.id] = qrUrl;
            }
        }
        
        setQrCodes(newQrCodes);
        setLoading(prev => ({...prev, qrCodes: false}));
    };

    useEffect(() => {
        checkToken();
        fetchProducts();
    }, [checkToken]);

    useEffect(() => {
        if (products.length > 0) {
            generateAllQrCodes();
        }
    }, [products]);

    if (loading.products) {
        return <div className="loading">Cargando productos...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="background-container">
            <h2>Generar Códigos QR para Productos</h2>
            
            {loading.qrCodes && (
                <div className="qr-loading">Generando códigos QR...</div>
            )}

            <div className="qr-grid">
                {products.map((product) => (
                    <div key={product.id} className="qr-card">
                        <div className="product-header">
                            <h3>{product.name_product}</h3>
                            {product.center_picture && (
                                <img 
                                    src={`${resourcesInstance.defaults.baseURL}${product.center_picture}`} 
                                    alt={product.name_product} 
                                    className="product-thumbnail" 
                                />
                            )}
                        </div>
                        <div className="qr-section">
                            {qrCodes[product.id] ? (
                                <>
                                    <img
                                        src={qrCodes[product.id]}
                                        alt={`QR para ${product.name_product}`}
                                        className="qr-image"
                                    />
                                    <a
                                        href={qrCodes[product.id]}
                                        download={`${product.name_product.replace(/\s+/g, '_')}_qr.png`}
                                        className="download-btn"
                                    >
                                        Descargar QR
                                    </a>
                                </>
                            ) : (
                                <div className="qr-error">
                                    No se pudo generar el QR
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GeneratedQrCode;