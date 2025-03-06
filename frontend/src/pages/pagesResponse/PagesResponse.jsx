import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { axiosInstanceAuth,resourcesInstance } from "../../components/functions/axiosConfig";
import { ShowErrorAlter, ShowSuccesAlert } from "../../components/functions/Alerts";
import useAuthStore from "../../components/store/userAuthToken";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";
import './pagesResponse.css';

const PaymentResponse = () => {
    const [transaction, setTransaction] = useState(null);
    const [error, setError] = useState(null);
    const location = useLocation();
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [setShowLoginModal] = useState(false);
    const [orderItems, setOrderItems] = useState([]);  

    const checkAndUpdateOrderStatus = async (orderId) => {
        if (!token) {
            setError("Authentication error. Please log in again.");
            return;
        }
        const axiosAuth = axiosInstanceAuth(token);
        try {
            // 1️⃣ Obtener datos de la orden incluyendo los productos
            const orderResponse = await axiosAuth.get(`/order/${orderId}/item`);
            console.log("📦 Datos de la orden:", orderResponse.data);

            // Guardamos los productos en el estado
            setOrderItems(orderResponse.data.order_items);

            // 2️⃣ Verificar si la orden ya está confirmada
            if (orderResponse.data.state_order === "Orden confirmada") {
                console.log("🚫 La orden ya está confirmada.");
                return;
            }

            // 3️⃣ Actualizar la orden si aún no está confirmada
            const updateResponse = await axiosAuth.put(`/order/update/${orderId}`, {
                state_order: "Orden confirmada",
            });
            ShowSuccesAlert("Orden confirmada correctamente.");
            console.log("✅ Orden actualizada:", updateResponse);
        } catch (err) {
            ShowErrorAlter("Error al verificar o actualizar el estado de la orden.");
            console.error("❌ Error:", err);
        }
    };

    useEffect(() => {
        const transactionId = getTransactionId();
        console.log("🆔 ID de la transacción extraído de la URL:", transactionId);

        if (transactionId) {
            const apiUrl = `https://sandbox.wompi.co/v1/transactions/${transactionId}`;
            console.log("🌐 URL de la API:", apiUrl);

            axios
                .get(apiUrl)
                .then(response => {
                    console.log("✅ Respuesta de la API:", response.data);

                    if (response.data && response.data.data) {
                        setTransaction(response.data.data);

                        if (response.data.data.status === "APPROVED") {
                            const orderId = response.data.data.reference;
                            checkAndUpdateOrderStatus(orderId);  // 🔄 Llamamos a la validación antes de actualizar
                        }
                    } else {
                        setError("La API no devolvió datos válidos.");
                    }
                })
                .catch(err => {
                    setError("No se pudo obtener el estado del pago.");
                    console.error("❌ Error en la petición:", err);
                });
        } else {
            setError("No se encontró el ID de la transacción en la URL.");
        }
    }, [location, token]);

    const getTransactionId = () => {
        const params = new URLSearchParams(location.search);
        return params.get("id");
    };

    const handleLogout = async () => {
        const token = useAuthStore.getState().token;
        try {
            const response = await axiosInstanceAuth(token).post('/logout');
            if (response.status === 200) {
                useAuthStore.getState().clearToken();
                setUserRole(null);
                navigate('/');
            } else {
                ShowErrorAlter("Error al cerrar sesión en el backend");
            }
        } catch (error) {
            ShowErrorAlter("Error al cerrar sesión", error);
        }
    };

    const handleOpenLoginModal = () => setShowLoginModal(true);

    useEffect(() => {
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null);
    }, []);

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    if (!transaction) {
        return <p>Cargando estado de la transacción...</p>;
    }

    return (
        <div className="payment-response">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={() => useAuthStore.getState().clearToken()}
                isECommerce={true}
            />

            <div className="container-content-orders">
                <div className="container-background-orders">
                    <div className="order-state-title">
                        <h2>Estado del Pago</h2>
                    </div>
                    <div className="order-state-content">
                        <p><strong>📅 Fecha:</strong> {new Date(transaction.created_at).toLocaleString()}</p>
                        <p><strong>💳 Método de pago:</strong> {transaction.payment_method_type}</p>
                        <p><strong>🏢 A quién pagó:</strong> {transaction.merchant.name}</p>
                        <p><strong>💰 Total pagado:</strong> {transaction.amount_in_cents / 100} {transaction.currency}</p>
                        <p><strong>✅ Estado :</strong> {transaction.status}</p>
                    </div>

                    <div className="order-state-products">
                        <h2>Productos de la Orden</h2>
                        {orderItems.length > 0 ? (
                            <div className="order-items-container">
                                {orderItems.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <img 
                                            src={`${resourcesInstance.defaults.baseURL}${item.product_picture}`} 
                                            alt={item.product_name} 
                                            style={{ width: "160px", height: "70px", objectFit: "cover" }} 
                                        />
                                        <p><strong>🛒 Producto</strong> {item.product_name}</p>
                                        <p><strong>🎨 Color</strong> {item.product_color}</p>
                                        <p><strong>🏷️ Marca</strong> {item.product_brand}</p>
                                        <p><strong>🔢 Cantidad</strong> {item.quantity}</p>
                                        <p><strong>💰 Precio Total</strong> ${item.total_price}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No se encontraron productos en la orden.</p>
                        )}
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

export default PaymentResponse;
