import React, { useEffect, useState } from "react";
import useAuthStore from "../../components/store/userAuthToken";
import { axiosInstanceAuth, resourcesInstance } from '../../components/functions/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import MenuComponent from "../../components/network/Menu/MenuComponent";
import FooterComponent from "../../components/network/Footer/footerComponent";
import Layout from "../../routes/LayoutControl/Layouts";
import { ShowErrorAlter, ShowSuccesAlert } from "../../components/functions/Alerts";
import cartEmpty from "../../assets/resources-ecommerce/cart-empty.svg";
import './Cart.css';
import { v4 as uuidv4 } from 'uuid';

const CartShop = () => {
    const [cart, setCart] = useState(null);
    const [error, setError] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [newQuantity, setNewQuantity] = useState(1);
    const { userId } = useParams();
    const { token, checkToken } = useAuthStore();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [setShowLoginModal] = useState(false);

    const generatePaymentReference = () => `order-${uuidv4()}`;
    const [paymentReference, setPaymentReference] = useState(generatePaymentReference());

    useEffect(() => {
        checkToken();
    }, [checkToken]);

    useEffect(() => {
        if (userId) {
            fetchInfoCart();
        } else {
            setLoading(false);
            setError("Carrito no encontrado");
        }
    }, [userId]);

    const handleLogout = async () => {
        const token = useAuthStore.getState().token;  
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

    const handleOpenLoginModal = () => setShowLoginModal(true);

    useEffect(() => {
        useAuthStore.getState().checkToken();
        const storedToken = useAuthStore.getState().token;
        setUserRole(storedToken ? 'admin' : null);
    }, []);

    const fetchInfoCart = async () => {
        const axiosAuth = axiosInstanceAuth(token);
        setLoading(true)
        if (token) {
            try {
                const response = await axiosAuth.get(`/cart/${userId}`);
                setCart(response.data);
            } catch (error) {
                setError(error.response ? error.response.data.detail : "Error al obtener el carrito");
            } finally {
                setLoading(false);
            }
        }
    };

    const formatPrice = (price) => {
        return price.toLocaleString('es-CO', { maximumFractionDigits: 2 });
    };

    const calculateTotalQuantity = () => {
        return cart.cart_items.reduce((acc, item) => acc + item.quantity, 0);
    };

    const updateItemQuantity = async (itemId) => {
        const axiosAuth = axiosInstanceAuth(token);
        try {
            const itemToUpdate = cart.cart_items.find(item => item.id === itemId);
            if (!itemToUpdate) {
                setError("Producto no encontrado en el carrito");
                return;
            }

            const response = await axiosAuth.put(`/cart/items/${itemId}`, {
                product_id: itemToUpdate.product.id,
                quantity: newQuantity,
                total_price: 0,
            }, {
                params: {
                    current_user: userId
                }
            });

            const updatedItem = response.data;

            setCart(prevCart => {
                const updatedItems = prevCart.cart_items.map(item =>
                    item.id === updatedItem.id ? { ...item, ...updatedItem } : item
                );
                return {
                    ...prevCart,
                    cart_items: updatedItems,
                    total_value: updatedItems.reduce((acc, item) => acc + item.total_price, 0),
                };
            });
            setEditingItemId(null);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || "Error al actualizar el producto en el carrito";
            setError(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
        }
    };

    const deleteItemFromCart = async (itemId) => {
        const axiosAuth = axiosInstanceAuth(token);
        try {
            await axiosAuth.delete(`/cart/items/delete/${itemId}`, {
                params: {
                    current_user: userId
                }
            });

            // Actualizar el carrito eliminando el item eliminado
            setCart(prevCart => {
                const updatedItems = prevCart.cart_items.filter(item => item.id !== itemId);
                return {
                    ...prevCart,
                    cart_items: updatedItems,
                    total_value: updatedItems.reduce((acc, item) => acc + item.total_price, 0),
                };
            });
        } catch (error) {
            setError(error.response?.data?.detail || "Error al eliminar el producto del carrito");
        }
    };

    const handleEditClick = (itemId, currentQuantity) => {
        setEditingItemId(itemId);
        setNewQuantity(currentQuantity);
    };

    const handleInputChange = (e) => {
        const inputValue = Math.max(1, Math.min(e.target.value, cart.cart_items.find(item => item.id === editingItemId)?.product.quantity || 0));
        setNewQuantity(inputValue);
    };

    const handleCreateOrder = async () => {
        if (!cart || cart.cart_items.length === 0) {
            alert("Carrito vacío");
            return;
        }
    
        const orderData = {
            user_id: Number(userId), 
            order_id: generatePaymentReference(),
            state_order: "En proceso",  
            total_value: cart.total_value,  
            order_items: cart.cart_items.map(item => ({
                product_id: item.product.id,
                product_name: item.product.name_product, 
                product_color: item.product.color,
                product_brand: item.product.brand.name,
                product_picture: item.product.side_picture,
                quantity: item.quantity,        
                total_price: item.total_price  
            })),
        };

        console.log("Enviando orden:", JSON.stringify(orderData, null, 2));
        
        try {
            const axiosAuth = axiosInstanceAuth(token);
            const response = await axiosAuth.post('/create/order', orderData);
    
            if (response.status === 201 || response.status === 200) {
                ShowSuccesAlert("Orden creada con éxito");
            } else {
                ShowErrorAlter("Error al crear la orden");
            }
        } catch (error) {
            console.error("Error al crear la orden:", error.response?.data || error.message);
            ShowErrorAlter("Error al crear la orden");
        }
    };
    
    
    if (loading) {
        return <div>Loading...</div>; 
    }

    // Si el carrito está vacío
    if (!cart || cart.cart_items.length === 0) {
        return (
            <div className="cart-empty">
                <MenuComponent
                    handleOpenLoginModal={handleOpenLoginModal}
                    userRole={userRole}
                    handleLogout={() => useAuthStore.getState().clearToken()}
                    isECommerce={true}
                />

                <div className="cart-empty-message">
                    <img src={cartEmpty} alt="Carrito vacío" className="empty-cart-image" />
                    <h2>Tu carrito está vacío</h2>
                    <p>¡Añade productos a tu carrito para continuar con la compra!</p>
                </div>

                <FooterComponent
                    handleOpenLoginModal={handleOpenLoginModal}
                    userRole={userRole}
                    handleLogout={handleLogout}
                />
            </div>
        );
    }

    return (
        <div className="cart-items-page">
            <MenuComponent
                handleOpenLoginModal={handleOpenLoginModal}
                userRole={userRole}
                handleLogout={() => useAuthStore.getState().clearToken()}
                isECommerce={true}
            />

            <div className="background-container-cart">
                <Layout />
                <div className="product-list-cart">
                    <div className="cart-items">
                        {cart.cart_items.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-detail">
                                    <div className="cart-item-img">
                                        <img
                                            src={`${resourcesInstance.defaults.baseURL}${item.product.center_picture}`}
                                            alt={`Product ${item.product.id}`}
                                            className="center-image-cart"
                                        />
                                    </div>
                                    <div className="cart-item-info">
                                        <h1>{item.product.name_product}</h1>
                                        <div className="cart-item-pricing">
                                            <p>Color: {item.product.color}</p>
                                            <p>Cantidad: {item.quantity}</p>
                                            <p>Precio Total: ${formatPrice(item.total_price)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="cart-item-actions">
                                    {editingItemId === item.id ? (
                                        <div>
                                            <input
                                                type="number"
                                                value={newQuantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                max={item.product.quantity}
                                                className="quantity-input"
                                            />
                                            <button onClick={() => updateItemQuantity(item.id)} className="btn btn-success">Actualizar</button>
                                        </div>
                                    ) : (
                                        <div className="buttoms-control">
                                            <button onClick={() => handleEditClick(item.id, item.quantity)} style={{ marginRight: '10px' }} className="btn btn-warning">Editar Cantidad</button>
                                            <button onClick={() => deleteItemFromCart(item.id)} className="btn btn-danger">Eliminar</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h3>Total de Productos: {calculateTotalQuantity()}</h3>
                        <h3>Valor Total del Carrito: ${formatPrice(cart.total_value)}</h3>
                    </div>

                    <button onClick={handleCreateOrder} className="btn btn-primary">Crear Orden</button>
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

export default CartShop;
