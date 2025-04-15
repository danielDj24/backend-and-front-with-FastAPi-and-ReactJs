import os
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi_pagination import Page, paginate
from datetime import datetime
from models.orders import Order, OrderItem
from models.cart import Cart, CartItem
from models.products import Product
from schemas.orders import OrderBase, OrderDataResponse,OrderStatusUpdate, PaymentData
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from routes.auth import oauth2_scheme
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from utils.generated_signatured import generate_signature
from typing import List

order_router = APIRouter()
load_dotenv()

INTEGRITY_KEY = os.getenv("WOMPI_INTEGRITY_KEY")

@order_router.post("/create/signature/order")
def generated_signature(payment_data: PaymentData,db: Session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to create orders")

    secret_key = INTEGRITY_KEY
    signature = generate_signature(payment_data.reference, payment_data.amount,payment_data.currency, secret_key)
    return {"signature": signature}


@order_router.post("/create/order", response_model=OrderDataResponse)
def create_order(order_data: OrderBase, db: Session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to create orders")

    # Obtener el carrito del usuario
    cart = db.query(Cart).filter(Cart.user_id == order_data.user_id).first()
    if not cart or not cart.cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Verificar que la orden tenga productos
    if not order_data.order_items or len(order_data.order_items) == 0:
        raise HTTPException(status_code=400, detail="Order must contain at least one product")

    try:
        # Crear la nueva orden con los datos enviados por el frontend
        new_order = Order(
            user_id=order_data.user_id,
            order_id=order_data.order_id,
            state_order=order_data.state_order,
            total_value=order_data.total_value,  
            created_at=datetime.utcnow(),
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        order_items = []
        for item in order_data.order_items:  
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            if product.quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for product {item.product_id}")

            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                total_price=item.total_price,
                product_name=item.product_name,
                product_color=item.product_color,  
                product_brand=item.product_brand,
                product_picture=item.product_picture
            )
            db.add(order_item)
            order_items.append(order_item)

            # Reducir stock
            product.reserved_quantity -= item.quantity
            product.quantity -= item.quantity
            db.add(product)

        # Vaciar el carrito
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.delete(cart)
        db.commit()

        # Crear un nuevo carrito vacío para el usuario
        new_cart = Cart(user_id=order_data.user_id, total_value=0.0)
        db.add(new_cart)
        db.commit()
        db.refresh(new_cart)

        return OrderDataResponse(
            id=new_order.id,
            user_id=new_order.user_id,
            order_id=new_order.order_id,
            state_order=new_order.state_order,
            total_value=new_order.total_value,
            created_at=new_order.created_at,
            order_items=[
                {
                    "id": item.id,
                    "order_id": item.order_id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "total_price": item.total_price,
                    "product_name": item.product_name,
                    "product_color": item.product_color,
                    "product_brand": item.product_brand,
                    "product_picture": item.product_picture,
                }
                for item in order_items
            ]
        )
    except Exception as e:
        db.rollback()
        print(f"Error al crear la orden: {str(e)}")  
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


# Obtener todas las órdenes con paginación
@order_router.get("/orders", response_model=Page[OrderDataResponse])
def get_orders(db : session=Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to search products")
    
    orders = db.query(Order).all()
    return paginate(orders)

@order_router.get("/orders/user/{user_id}", response_model=List[OrderDataResponse])
def get_orders_by_user(user_id: int, db: Session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to view orders")
    
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this user")
    
    # Convert Order objects to OrderDataResponse objects
    order_data_responses = [OrderDataResponse.from_orm(order) for order in orders]

    # Return the list of order_data_responses
    return order_data_responses

@order_router.get("/order/{order_id}", response_model=OrderDataResponse)
def get_order(order_id: int, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to search orders")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order 

@order_router.get("/order/{order_id}/item", response_model=OrderDataResponse)
def get_order_by_order_id(order_id: str, db: Session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to search orders")

    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order 

# Actualizar una orden
@order_router.put("/order/update/{order_id}")
def update_order_status(order_id: str, status_data: OrderStatusUpdate, db: Session = Depends(GetDB), token: str = Depends(oauth2_scheme)):  
    print("Recibido status_data:", status_data)  # Agrega un log para depuración
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])

    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to update order status")

    # Buscar la orden usando el order_id
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Actualizar el estado de la orden
    order.state_order = status_data.state_order
    db.commit()
    db.refresh(order)

    return {"message": "Order status updated successfully", "order_id": order.order_id, "new_status": order.state_order}

# Eliminar una orden
@order_router.delete("/order/delete/{order_id}")
def delete_order(order_id: int,db : session=Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to search products")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}


@order_router.get("/orders/confirmed", response_model=Page[OrderDataResponse])
def get_confirmed_orders(db: Session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view orders")

    # Filtrar órdenes con el estado "Orden confirmada"
    confirmed_orders = db.query(Order).filter(Order.state_order == "Orden confirmada").all()

    if not confirmed_orders:
        raise HTTPException(status_code=404, detail="No confirmed orders found")

    # Retornar datos paginados
    return paginate(confirmed_orders)

@order_router.get("/orders/send", response_model=Page[OrderDataResponse])
def get_confirmed_orders(db: Session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view orders")

    # Filtrar órdenes con el estado "Orden confirmada"
    confirmed_orders = db.query(Order).filter(Order.state_order == "Orden enviada").all()

    if not confirmed_orders:
        raise HTTPException(status_code=404, detail="No confirmed orders found")

    # Retornar datos paginados
    return paginate(confirmed_orders)
