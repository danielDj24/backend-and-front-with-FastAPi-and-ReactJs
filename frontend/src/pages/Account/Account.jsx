import React, { useEffect, useState } from "react";
import { axiosInstanceAuth,resourcesInstance } from "../../components/functions/axiosConfig";
import useAuthStore from "../../components/store/userAuthToken";
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";
import { ShowErrorAlter, ShowSuccesAlert } from "../../components/functions/Alerts";
import { useParams, useNavigate } from 'react-router-dom';
import userSvg from "../../assets/resources-ecommerce/user.svg";
import cartSvg from "../../assets/resources-ecommerce/cart.svg";
import WompiPayment from "../../components/paymentWidget/paymentWidget";
import './Account.css';

const Account = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, checkToken } = useAuthStore();
    const [userRole, setUserRole] = useState(null);
    const [setShowLoginModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState(null);
    const [orderProducts, setOrderProducts] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null); 
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPreferencialClient, setIsPreferencialClient] = useState(false);


    const [paymentReference, setPaymentReference] = useState(null);

    useEffect(() => {
        if (selectedOrder) {
            setPaymentReference(selectedOrder.order_id);
        }
    }, [selectedOrder]);
    
    useEffect(() => {
        if (!token) {
            checkToken();
        }
        if (userId && token) {
            fetchOrders(userId);
            fetchDataUsers(userId);
        }
    }, [userId, token]);

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
        setUserRole(storedToken ? 'admin' : null ? 'client' : null);
    }, []);

    const fetchDataUsers = async (userId) => {
        if (!token) {
            setError("Authentication error. Please log in again.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const axiosAuth = axiosInstanceAuth(token);
            const response = await axiosAuth.get(`/user/${userId}`);
            const userData = response.data;
            setUsers(Array.isArray(userData) ? userData : [userData]);
    
            // Almacena el preferencial_client en un estado separado
            const user = Array.isArray(userData) ? userData[0] : userData;
            setIsPreferencialClient(user.preferencial_client);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to fetch users. Please try again later.");
        } finally {
            setLoading(false);
        }
    };
    

    const fetchOrders = async (userId) => {
        if (!token) {
            setError("Authentication error. Please log in again.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const axiosAuth = axiosInstanceAuth(token);
            const response = await axiosAuth.get(`/orders/user/${userId}`);
            let orderData = Array.isArray(response.data) ? response.data : [response.data];
    
            // 🧠 Ordenar por fecha descendente
            orderData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
            setOrders(orderData);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to fetch orders. Please try again later.");
        } finally {
            setLoading(false);
        }
    };
    

    const handleConfirmOrder = async (orderId) => {
        try {
            const response = await axiosInstanceAuth(token).get(`/order/${orderId}`);
            const order = response.data;
            if (order && order.order_items && order.order_items.length > 0) {
                setOrderProducts(order.order_items);
                setSelectedOrderId(order.order_id);
                setSelectedOrder(order);
            } else {
                ShowErrorAlter("No se encontraron productos para esta orden.");
            }
        } catch (error) {
            ShowErrorAlter("Error al obtener los productos de la orden.");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            const response = await axiosInstanceAuth(token).delete(`/order/delete/${orderId}`);
            if (response.status === 200) {
                setOrders(orders.filter(order => order.id !== orderId));
                ShowSuccesAlert("Orden eliminada exitosamente.");
            }
        } catch (error) {
            console.error("Error al eliminar la orden", error);
            ShowErrorAlter("Error al eliminar la orden. Intente nuevamente.");
        }
    };

    const handleConfirmOrderStatus = async (orderId) => {
        try {
            const response = await axiosInstanceAuth(token).put(`/order/update/${orderId}`, {
                state_order: "Orden confirmada",
            });
    
            if (response.status === 200) {
                const updatedOrders = orders.map((order) =>
                    order.id === orderId ? { ...order, state_order: "Orden confirmada" } : order
                );
                setOrders(updatedOrders);
                ShowSuccesAlert("Orden confirmada exitosamente.");
            } else {
                ShowErrorAlter("Error al confirmar la orden.");
            }
        } catch (error) {
            ShowErrorAlter("Error al actualizar el estado de la orden.");
        }
    };
    


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="account-container">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={handleLogout}
                isECommerce={true}
            />
            
            <div className="account-content">
                <div className="account-content-background">
                    <div className="account-content-header">
                    </div>
                    <div className="account-content-body">

                        <div className="account-elements">
                            <div className="account-elements-data-users">
                                <img src={userSvg} alt="User" />
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <div key={user.id}>
                                            <p>{user.name_company || "No disponible"}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No se encontró información del usuario.</p>
                                )}
                                <div className="elements-account-control">
                                    <div className="orders-element" onClick={() => setSelectedTab("orders")}>
                                        <img src={cartSvg} alt="Orders" />
                                        <p>Órdenes</p>
                                    </div>
                                    <div className="info-element" onClick={() => setSelectedTab("info")}>
                                        <img src={userSvg} alt="User" />
                                        <p>Mi información</p>
                                    </div>
                                </div>
                            </div>
                            <div className="account-elements-data-info">
                                {selectedTab === "info" && users.length > 0 && (
                                    <div className="account-elements-data-info">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Usuario</th>
                                                    <th>Email</th>
                                                    <th>Teléfono</th>
                                                    <th>Dirección</th>
                                                    <th>Empresa</th>
                                                    <th>NIT</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user) => (
                                                    <tr key={user.id}>
                                                        <td>{user.username}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.phone || "No disponible"}</td>
                                                        <td>{user.address || "No disponible"}</td>
                                                        <td>{user.name_company || "No disponible"}</td>
                                                        <td>{user.nit_company || "No disponible"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Mostrar órdenes o productos confirmados */}
                                {selectedTab === "orders" && !orderProducts && orders.length > 0 && (
                                    <div className="orders-container">
                                        <table className="orders-table">
                                            <thead>
                                                <tr>
                                                    <th>#Orden</th>
                                                    <th>Fecha</th>
                                                    <th>Total</th>
                                                    <th>Estado</th>
                                                    <th>Control de compra</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr key={order.id}>
                                                        <td>{order.order_id}</td>
                                                        <td>{new Date(order.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</td>
                                                        <td>
                                                        {isPreferencialClient ? "" : order.total_value.toFixed(2)}
                                                        </td>

                                                        <td>{order.state_order}</td>
                                                        <td>
                                                            <button 
                                                                onClick={() => handleConfirmOrder(order.id)} 
                                                                className="btn btn-details"
                                                            >
                                                                Ver detalles
                                                            </button>

                                                            {order.state_order !== "Orden confirmada" && (
                                                                <>
                                                                    <button 
                                                                        onClick={() => handleConfirmOrderStatus(order.order_id)} 
                                                                        className="btn btn-confirm"
                                                                    >
                                                                        Confirmar
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteOrder(order.id)} 
                                                                        className="btn btn-delete"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {selectedTab === "orders" && orderProducts && selectedOrder && (
                                    <div className="order-products-container">
                                        <h3>{selectedOrder.order_id}</h3> 
                                        <button 
                                            className="btn btn-back" 
                                            onClick={() => {
                                                setOrderProducts(null);
                                                setSelectedOrder(null);
                                                setSelectedOrderId(null);
                                            }}
                                        >
                                            ← Volver a ver las Órdenes
                                        </button>
                                        <table className="products-table">
                                            <thead>
                                                <tr>
                                                    <th>Marca</th>
                                                    <th>Referencia</th>
                                                    <th>Color</th>
                                                    <th>Cantidad</th>
                                                    {isPreferencialClient ? "" : <th>Total $</th> }
                                                    <th>Foto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderProducts.map((item) => (
                                                    <tr key={item.product_id}>
                                                        <td>{item.product_brand}</td> 
                                                        <td>{item.product_name}</td>
                                                        <td>{item.product_color}</td>
                                                        <td>{item.quantity}</td>
                                                        {isPreferencialClient ? "" : <td>{item.total_price.toFixed(2)}</td> }
                                                        <td>
                                                            {item.product_picture ? (
                                                                <img 
                                                                    src={`${resourcesInstance.defaults.baseURL}${item.product_picture}`} 
                                                                    alt={item.product_name} 
                                                                    style={{ width: "100px", height: "70px", objectFit: "cover" }} 
                                                                />
                                                            ) : (
                                                                "Sin imagen"
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {selectedOrder.state_order === "Orden creada" && !isPreferencialClient && (
                                            <WompiPayment 
                                                amount={selectedOrder.total_value * 100} 
                                                reference={paymentReference} 
                                            />
                                        )}

                                        {selectedOrder.state_order === "Orden creada" && isPreferencialClient && (
                                            <button
                                                className="btn-confirm-state"
                                                onClick={() => handleConfirmOrderStatus(selectedOrder.order_id)}
                                            >
                                                Confirmar Orden como cliente preferencial
                                            </button>
                                        )}
                                    </div>
                                )}

                                {selectedTab === "orders" && orders.length === 0 && <p>No hay órdenes disponibles.</p>}
                                {selectedTab === "info" && users.length === 0 && <p>No se encontró información del usuario.</p>}
                            </div>
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

export default Account;