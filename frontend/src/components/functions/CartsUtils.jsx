import { axiosInstanceAuth } from './axiosConfig';
import getUserIdFromToken from './UserByToken';
import { ShowErrorAlter, ShowSuccesAlert } from './Alerts';

export const addProductToCart = async (token, productId, quantity) => {
    const axiosAuth = axiosInstanceAuth(token);
    if (token) {
        const userId = getUserIdFromToken(token);
        if (!userId) {
            ShowErrorAlter("Error", "No se pudo obtener el ID del usuario");
            return;
        }
        try {
            await axiosAuth.post(`/cart/items/${userId}`, {
                product_id: productId,
                quantity: quantity,
                total_price: 0
            });
            ShowSuccesAlert("Éxito", "El producto se ha agregado al carrito.");
        } catch (error) {
            ShowErrorAlter("Error", error.response?.data?.detail || "No se pudo agregar el producto al carrito.");
        }
    } 
};