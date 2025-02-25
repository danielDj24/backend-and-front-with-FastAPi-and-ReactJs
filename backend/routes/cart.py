from datetime import timedelta
from datetime import datetime 

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from routes.auth import oauth2_scheme
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

"""ORM"""

from models.orders import Order, OrderItem  
from schemas.orders import OrderDataResponse
from models.products import Product
from models.cart import Cart,CartItem
from schemas.cart import CarItemCreate, CartItemDataResponse, CartItemBase, CartCreate, CartDataResponse, CartBase
from sqlalchemy.orm import joinedload

cart_routes = APIRouter()
background_tasks = BackgroundTasks();

"""obtener los productos del carrito"""
@cart_routes.get("/cart/{current_user}", response_model=CartDataResponse)
def get_cart(current_user : int, db : session = Depends(GetDB), token : str=Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to get items cart")
    query = db.query(Cart).options(
        joinedload(Cart.cart_items),
        joinedload(Cart.user)
    ).filter(Cart.user_id == current_user)
    
    cart = query.first()
    if not cart :
        raise HTTPException(status_code=404, detail="cart not found")
    
    # Calculate the total value dynamically
    total_value = db.query(func.sum(CartItem.total_price)).filter(CartItem.cart_id == cart.id).scalar() or 0.0
    cart.total_value = total_value
    
    return cart    

"""reserva por 48horas"""
def release_product_reservation(product_id: int, quantity: int, db: session):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        product.reserved_quantity -= quantity
        db.add(product)
        db.commit()

"""agregar productos al carrito"""
@cart_routes.post("/cart/items/{current_user}", response_model=CartItemDataResponse)
def add_item_cart(current_user: int, item_data: CarItemCreate, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to add items to cart")
    
    # Recuperar el carrito del usuario
    cart = db.query(Cart).filter(Cart.user_id == current_user).first()
    
    if not cart:
        cart = Cart(user_id=current_user, created_at=datetime.utcnow(), total_value=0.0)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # Verificar si el producto existe
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verificar si hay suficiente cantidad disponible
    available_quantity = product.quantity - product.reserved_quantity
    if item_data.quantity > available_quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")

    # Actualizar el campo quantity del producto
    product.quantity -= item_data.quantity  # Resta del total disponible
    product.reserved_quantity += item_data.quantity  # Incrementa la cantidad reservada
    db.add(product)  # Guarda los cambios del producto
    
    # Recuperar o crear el ítem del carrito
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_data.product_id
    ).first()
    
    if existing_item:
        existing_item.quantity += item_data.quantity  # Suma a la cantidad existente
        existing_item.total_price = existing_item.quantity * product.price_product  # Actualiza el precio total
        new_item = existing_item
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            total_price=item_data.quantity * product.price_product  # Precio total según cantidad
        )
        db.add(new_item)

    # Actualizar el total del carrito
    cart.total_value = db.query(func.sum(CartItem.total_price)).filter(CartItem.cart_id == cart.id).scalar() or 0.0

    try:
        # Agregar tarea en segundo plano para liberar la reserva después de 48 horas
        background_tasks.add_task(release_product_reservation, product.id, item_data.quantity, db)

        db.commit()  # Realiza el commit aquí después de todos los cambios
        db.refresh(cart)
        return new_item
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    

"""actualizar producto en la lista del carrito de compra"""
@cart_routes.put("/cart/items/{item_id}", response_model=CartItemDataResponse)
def update_item_quantity(item_id: int, item_data: CartItemBase, current_user: int, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to update items in cart")
    
    query = db.query(CartItem).join(Cart).filter(CartItem.id == item_id, Cart.user_id == current_user)
    item = query.first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found in the cart")

    product = db.query(Product).filter(Product.id == item.product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Calcular la diferencia en la cantidad solicitada
    quantity_diff = item_data.quantity - item.quantity

    # Verificar si hay suficiente stock si la cantidad está aumentando
    if quantity_diff > 0:
        available_stock = product.quantity - product.reserved_quantity
        if quantity_diff > available_stock:
            raise HTTPException(status_code=400, detail="Not enough stock available")
        # Aumentar la cantidad reservada en el stock
        product.reserved_quantity += quantity_diff
    else:
        # Devolver la diferencia al stock
        product.reserved_quantity += quantity_diff  # Aquí quantity_diff es negativo

    item.quantity = item_data.quantity
    item.total_price = item_data.quantity * product.price_product
    
    # Actualizar el valor total del carrito
    cart = db.query(Cart).filter(Cart.id == item.cart_id).first()
    cart.total_value = db.query(func.sum(CartItem.total_price)).filter(CartItem.cart_id == cart.id).scalar()

    db.commit()
    db.refresh(item)
    return item

"""eliminar un elemento del carrito de compra"""
@cart_routes.delete("/cart/items/delete/{item_id}", response_model=dict)
def delete_item_from_cart(item_id: int, current_user: int, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete items from cart")
    
    # Obtener el item del carrito del usuario actual
    item = db.query(CartItem).join(Cart).filter(CartItem.id == item_id, Cart.user_id == current_user).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found in the cart")

    product = db.query(Product).filter(Product.id == item.product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.reserved_quantity -= item.quantity  
    if product.reserved_quantity < 0:
        product.reserved_quantity = 0  

    product.quantity += item.quantity  

    db.add(product)

    db.delete(item)

    cart = db.query(Cart).filter(Cart.id == item.cart_id).first()
    cart.total_value = db.query(func.sum(CartItem.total_price)).filter(CartItem.cart_id == cart.id).scalar()

    db.commit()  
    return {"detail": "Item deleted successfully"}

"""ruta para manejar la orden"""
@cart_routes.post("/cart/checkout/{current_user}", response_model=OrderDataResponse)
def checkout_cart(current_user: int, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to checkout")
    
    # Obtener el carrito del usuario
    cart = db.query(Cart).filter(Cart.user_id == current_user).first()
    
    if not cart or not cart.cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Crear un nuevo pedido
    new_order = Order(
        user_id=current_user,
        total_value=cart.total_value,
        created_at=datetime.utcnow()
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Mover los productos del carrito al pedido
    for item in cart.cart_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            total_price=item.total_price
        )
        db.add(order_item)
        
        # Reducir el stock real del producto
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.reserved_quantity -= item.quantity  # Liberar la reserva
            product.quantity -= item.quantity  # Reducir el stock
            db.add(product)
    
    # Vaciar el carrito
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    cart.total_value = 0.0
    db.add(cart)
    
    # Confirmar todos los cambios
    db.commit()
    db.refresh(new_order)
    
    return new_order
