import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance, axiosInstance } from "../../functions/axiosConfig";
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import Layout from "../../../routes/LayoutControl/Layouts";
import './OrdersControl.css';

const OrdersControl = () => {
    const [orders, setOrders] = useState([]);
    const [sentOrders, setSentOrders] = useState([]); // Estado para las órdenes enviadas
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { token, checkToken } = useAuthStore();
    const [users, setUsers] = useState({});
    const [userRole, setUserRole] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [invoiceFiles, setInvoiceFiles] = useState({});

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

    const handleFileChange = (orderId, file) => {
        setInvoiceFiles(prev => ({
            ...prev,
            [orderId]: file
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
            // Obtener las órdenes confirmadas (el endpoint sigue siendo el mismo)
            const responseConfirmed = await axiosAuth.get("/orders/confirmed", {
                params: {
                    page: currentPage,
                    size: pageSize,
                },
            });
    
            const sortedOrders = responseConfirmed.data.items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Ordenar por fecha
            setOrders(sortedOrders);
    
            // Obtener las órdenes enviadas
            const responseSent = await axiosAuth.get("/orders/send", {
                params: {
                    page: currentPage,
                    size: pageSize,
                },
            });
    
            // Filtrar y almacenar las órdenes enviadas
            const sentOrders = responseSent.data.items.filter(order => order.state_order === "Orden enviada");
            setSentOrders(sentOrders);
    
            setTotalPages(responseConfirmed.data.pages);
        } catch (err) {
            setError("Error al obtener órdenes confirmadas y enviadas");
            ShowErrorAlter("Error", "No se pudieron cargar las órdenes");
        } finally {
            setLoading(false);
        }
    };
    

    const sendInvoice = async (file, clientEmail) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("email", clientEmail);

            const response = await axiosInstance.post("/send-document", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            ShowSuccesAlert("Factura enviada correctamente.");
            console.log("✅ Documento enviado:", response.data);
        } catch (err) {
            ShowErrorAlter("Error al enviar la factura.");
            console.error("❌ Error al enviar documento:", err);
        }
    };

    const checkAndUpdateOrderStatus = async (orderId, newStatus, invoiceFile) => {
        if (!token) {
            setError("Authentication error. Please log in again.");
            return;
        }

        const axiosAuth = axiosInstanceAuth(token);

        try {
            const orderResponse = await axiosAuth.get(`/order/${orderId}/item`);
            setOrderItems(orderResponse.data.order_items);

            if (orderResponse.data.state_order === newStatus) {
                console.log(`🚫 La orden ya está ${newStatus}.`);
                return;
            }

            await axiosAuth.put(`/order/update/${orderId}`, { state_order: newStatus });

            ShowSuccesAlert(`${newStatus} correctamente.`);

            const clientEmail = users[orderResponse.data.user_id]?.email;

            if (!clientEmail) {
                console.error("No se pudo obtener el correo del cliente.");
                return;
            }

            if (!invoiceFile) {
                console.error("No se ha proporcionado el archivo de factura.");
                ShowErrorAlter("Debes seleccionar el archivo de la factura.");
                return;
            }

            await sendInvoice(invoiceFile, clientEmail);
            fetchOrdersState();

        } catch (err) {
            ShowErrorAlter("Error al actualizar la orden o enviar la factura.");
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
                    <div>
                        {/* Mostrar órdenes confirmadas */}
                        <div className="orders-container">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <div key={order.id} className="order-element-card">
                                        <div className="order-summary" onClick={() => toggleOrderDetails(order.id)} style={{ cursor: "pointer" }}>
                                            <p>{order.order_id}</p>
                                            <p>{order.state_order}</p>
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
                                                <div className="mb-2">
                                                    <label htmlFor={`file-${order.order_id}`} className="form-label">
                                                        Selecciona factura (PDF):
                                                    </label>
                                                    <input
                                                        type="file"
                                                        id={`file-${order.order_id}`}
                                                        accept="application/pdf"
                                                        className="form-control"
                                                        onChange={(e) => handleFileChange(order.order_id, e.target.files[0])}
                                                    />
                                                </div>
                                                <button 
                                                    className="btn btn-success"
                                                    onClick={() => checkAndUpdateOrderStatus(order.order_id, "Orden enviada", invoiceFiles[order.order_id])}
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

                        {/* Mostrar órdenes enviadas */}
                        <div className="orders-container">
                            <h3>Órdenes Enviadas</h3>
                            {sentOrders.length > 0 ? (
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Referencia</th>
                                            <th>Estado</th>
                                            <th>Total</th>
                                            <th>Cliente</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.order_id}</td>
                                                <td>{order.state_order}</td>
                                                <td>${order.total_value}</td>
                                                <td>{users[order.user_id]?.username || "Cargando..."}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No hay órdenes enviadas.</p>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersControl;
