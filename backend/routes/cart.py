import os
from typing import Optional
from datetime import datetime 

from fastapi_pagination import Page, paginate
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from routes.auth import oauth2_scheme
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

"""ORM"""
from models.products import Product
from models.cart import Cart,CartItem
from schemas.cart import CarItemCreate, CartItemDataResponse, CartItemBase, CartCreate, CartDataResponse, CartBase
from sqlalchemy.orm import joinedload

cart_routes = APIRouter()

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

"""agregar productos al carrito"""
@cart_routes.post("/cart/items/{current_user}", response_model=CartItemDataResponse)
def add_item_cart(current_user : int ,item_data : CarItemCreate,db : session = Depends(GetDB), token : str=Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to add items cart")
    
    query = db.query(Cart).filter(Cart.user_id == current_user).first()
    if not query:
        cart = Cart(user_id=current_user, created_at=datetime.utcnow(), total_value=0.0)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    else:
        cart = query
    # Check if the product exists
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Retrieve or create the cart item
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_data.product_id
    ).first()
    
    if existing_item:
        existing_item.quantity = item_data.quantity
        existing_item.total_price = existing_item.quantity * product.price_product  # Calculate total price
        new_item = existing_item
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            total_price=item_data.quantity * product.price_product  # Calculate total price based on quantity
        )
        db.add(new_item)
    
    # Update the total value of the cart
    cart.total_value = db.query(func.sum(CartItem.total_price)).filter(CartItem.cart_id == cart.id).scalar() or 0.0
    
    try:
        db.commit()
        db.refresh(cart)
        return new_item
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    

"""actualizar producto en la lista del carrito de compra"""
@cart_routes.put("/cart/items/{item_id}", response_model=CartItemDataResponse)
def update_item_quantity(item_id : int, item_data : CartItemBase, current_user : int, db: session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to add items cart")
    
    query = db.query(CartItem).join(Cart).filter(CartItem.id == item_id, Cart.user_id == current_user)
    item = query.first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Not item found in the cart")
    
    item.quantity = item_data.quantity
    item.total_price = item_data.quantity * Product.price_product
    
    cart = db.query(Cart).filter(Cart.id == item.cart_id).first()
    cart.total_value = db.query(func.sum(CartItem.total_price)).filter(CartItem.cart_id == cart.id).scalar()
    
    db.commit()
    db.refresh(item)
    return item

"""eliminar un elemento del carrito de compra"""
@cart_routes.delete("/cart/items/delete/{item_id}", response_model=dict)
def delete_item_from_cart(item_id : int, current_user : int, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        
        raise HTTPException(status_code=403, detail="Not authorized to add items cart")
    
    item = db.query(CartItem).join(Cart).filter(CartItem.id == item_id, Cart.user_id == current_user).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found in the cart")
    db.delete(item)

    # Update the cart's total value
    cart = db.query(Cart).filter(Cart.id == item.cart_id).first()
    cart.total_value = db.query(func.sum(CartItem.total_price)).filter(CartItem.cart_id == cart.id).scalar()

    db.commit()
    return {"detail": "Item deleted successfully"}