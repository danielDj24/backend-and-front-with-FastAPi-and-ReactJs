import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from "../../functions/axiosConfig";
import { ShowErrorAlter,ShowSuccesAlert } from '../../functions/Alerts';
import Layout from "../../../routes/LayoutControl/Layouts";
import './OrdersControl.css';

const OrdersControl = () => { 
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { token, checkToken } = useAuthStore();
    const [users, setUsers] = useState({});
    const [userRole, setUserRole] = useState(null);
    const [orderItems, setOrderItems] = useState([]);  

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); 
    const [totalPages, setTotalPages] = useState(0);
    const [expandedOrders, setExpandedOrders] = useState({});

    useEffect(() => {
        if (orders.length > 0) {
            orders.forEach((order) => {
                if (order.user_id) { 
                    fetchDataUsers(order.user_id);
                } else {
                    console.error("Missing user_id for order:", order);
                }
            });
        }
    }, [orders]); 
    
    useEffect(() => {
        checkToken();
        fetchOrdersState();
    }, [checkToken, currentPage, pageSize]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1); 
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrders(prevState => ({
            ...prevState,
            [orderId]: !prevState[orderId]
        }));
    };
    
    useEffect(() => {
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null ? 'client' : null);
    }, []);

    const fetchDataUsers = async (userId) => {
        if (!userId) {
            console.error("No user ID provided");
            return;
        }
    
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
    
            setUsers(prevUsers => ({
                ...prevUsers,
                [userId]: userData 
            }));
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to fetch users. Please try again later.");
        } finally {
            setLoading(false);
        }
    };
    
    const fetchOrdersState = async () => {
        if (!token) return;

        const axiosAuth = axiosInstanceAuth(token);
        setLoading(true);

        try {
            const response = await axiosAuth.get("/orders/confirmed", {
                params: {
                    page: currentPage,
                    size: pageSize,
                },
            });

            setOrders(response.data.items); 
            setTotalPages(response.data.pages);
        } catch (err) {
            setError("Error al obtener órdenes confirmadas");
            ShowErrorAlter("Error", "No se pudieron cargar las órdenes");
        } finally {
            setLoading(false);
        }
    };

    const checkAndUpdateOrderStatus = async (orderId, newStatus) => {
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
    
            // 2️⃣ Verificar si la orden ya tiene el estado que queremos actualizar
            if (orderResponse.data.state_order === newStatus) {
                console.log(`🚫 La orden ya está ${newStatus}.`);
                return;
            }
    
            // 3️⃣ Actualizar la orden con el nuevo estado
            const updateResponse = await axiosAuth.put(`/order/update/${orderId}`, {
                state_order: newStatus,
            });
            ShowSuccesAlert(`${newStatus} correctamente.`);
            console.log("✅ Orden actualizada:", updateResponse);
        } catch (err) {
            ShowErrorAlter("Error al verificar o actualizar el estado de la orden.");
            console.error("❌ Error:", err);
        }
    };
    


    return (
        <div className="container">
            <div className="background-container">
                <Layout />
                <div className="title-container">
                    <h2>Órdenes Confirmadas</h2>
                </div>

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

                {loading ? (
                    <p>Cargando...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : (
                    <div className="orders-container">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <div key={order.id} className="order-element-card">
                                    <div className="order-summary" onClick={() => toggleOrderDetails(order.id)} style={{ cursor: "pointer" }}>
                                        <p>{order.order_id}</p>
                                        <p> {order.state_order}</p>
                                        <p>${order.total_value}</p>
                                        <p>{users[order.user_id]?.username || "Cargando..."}</p>
                                        <p>{users[order.user_id]?.email || "Cargando..."}</p>
                                        <p>{users[order.user_id]?.phone || "Cargando..."}</p>        
                                        <p>{users[order.user_id]?.address || "Cargando..."}</p>
                                        <p className="toggle-details">{expandedOrders[order.id] ? "▲ Detalles de la orden" : "▼Detalles de la orden"}</p>
                                    </div>

                                    {expandedOrders[order.id] && (
                                        <div className="order-details">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Referencia</th>
                                                        <th>Imagen</th>
                                                        <th>Color</th>
                                                        <th>Marca</th>
                                                        <th>Cantidad</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.order_items.map((item) => (
                                                        <tr key={item.id}>
                                                            <td>{item.product_name}</td>
                                                            <td>
                                                                <img 
                                                                    src={`${resourcesInstance.defaults.baseURL}${item.product_picture}`} 
                                                                    alt={item.product_name} 
                                                                    style={{ width: "130px", height: "50px", objectFit: "cover" }} 
                                                                />
                                                            </td>
                                                            <td>{item.product_color}</td>
                                                            <td>{item.product_brand}</td>
                                                            <td>{item.quantity}</td>
                                                            <td>${item.total_price}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button 
                                                className="btn btn-success"
                                                onClick={() => checkAndUpdateOrderStatus(order.order_id, "Orden enviada")}
                                            >
                                                Marcar como "Orden Enviada"
                                            </button>
                                        </div>
                                    )}
        
                                </div>
                            ))
                        ) : (
                            <p>No hay órdenes confirmadas.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersControl;
