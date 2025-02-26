from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi_pagination import Page, paginate
from datetime import datetime
from models.orders import Order, OrderItem
from models.cart import Cart, CartItem
from models.products import Product
from schemas.orders import OrderBase, OrderDataResponse
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from routes.auth import oauth2_scheme
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token

order_router = APIRouter()


@order_router.post("/create/order", response_model=OrderDataResponse)
def create_order(order_data: OrderBase, db: Session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to search products")

    # Obtener el carrito del usuario
    cart = db.query(Cart).filter(Cart.user_id == order_data.user_id).first()
    if not cart or not cart.cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    try:
        # Crear la nueva orden
        new_order = Order(
            user_id=order_data.user_id,
            order_id=order_data.order_id,
            state_order=order_data.state_order,
            total_value=cart.total_value,
            created_at=datetime.utcnow(),
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        # Mover los productos del carrito al pedido
        order_items = []
        for item in cart.cart_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            if product.quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for product {item.product_id}")

            # Crear OrderItem
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                total_price=item.total_price
            )
            db.add(order_item)
            order_items.append(order_item)

            # Reducir el stock del producto
            product.reserved_quantity -= item.quantity
            product.quantity -= item.quantity
            db.add(product)

        # Vaciar el carrito
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.delete(cart)
        db.commit()

        # Crear un nuevo carrito para el usuario
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
                    "total_price": item.total_price
                }
                for item in order_items
            ]
        )

    except Exception as e:
        db.rollback()
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

# Obtener una orden por ID
@order_router.get("/order/{order_id}", response_model=OrderDataResponse)
def get_order(order_id: int, db : session=Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to search products")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# Actualizar una orden
@order_router.put("/order/update/{order_id}", response_model=OrderDataResponse)
def update_order(order_id: int, order_data: OrderBase, db : session=Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to search products")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.user_id = order_data.user_id
    order.total_value = order_data.total_value
    db.commit()
    db.refresh(order)
    return order

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
