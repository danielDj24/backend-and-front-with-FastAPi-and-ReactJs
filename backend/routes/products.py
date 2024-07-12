import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from routes.auth import oauth2_scheme

"""ORM"""
from models.products import Product, Discount, Shape
from schemas.products import ProductsCreateData, ProductsDataResponse, DiscountCreateData, DiscountResponseData, ShapeResponseData, ShapeCreateData
from models.brands import Brand
from sqlalchemy.orm import joinedload

product_routes = APIRouter()

"""rutas para manejar las formas de los lentes"""

@product_routes.post("/product/create/shape", response_model=ShapeResponseData)
def create_shape(shape_data : ShapeCreateData, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create product")
    
    shape = Shape(
        name_shape = shape_data.name_shape,
    )
    db.add(shape)
    db.commit()
    db.refresh(shape)
    return shape


"""rutas para manejar los descuentos"""
@product_routes.post("/product/create/discount", response_model=DiscountResponseData)
def create_discount(discount_data : DiscountCreateData, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create product")
    
    discount = Discount(
        discount_percentage = discount_data.discount_percentage,
        description = discount_data.description,
    )
    db.add(discount)
    db.commit()
    db.refresh(discount)
    return discount


"""rutas de los productos"""
@product_routes.get("/products", response_model=List[ProductsDataResponse])
def get_all_products(db: session = Depends(GetDB)):
    products = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.discount),
        joinedload(Product.shape)
    ).all()
    if not products:
        raise HTTPException(status_code=404, detail="No products found")
    return products


@product_routes.post("/create/product", response_model=ProductsDataResponse)
def create_product(product_data : ProductsCreateData, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create product")
    
    brand = db.query(Brand).filter(Brand.id == product_data.brand_id).first()
    if not brand:
        raise HTTPException(status_code=400, detail="Brand ID not found")

    if product_data.discount_id:
        discount = db.query(Discount).filter(Discount.id == product_data.discount_id).first()
        if not discount:
            raise HTTPException(status_code=400, detail="Discount ID not found")
    
    product = Product(
        brand_id = product_data.brand_id,
        discount_id = product_data.discount_id,
        shape_id = product_data.shape_id,
        name_product = product_data.name_product,
        frame_material = product_data.frame_material,
        color = product_data.color,
        size = product_data.size,
        gender = product_data.gender,
        quantity = product_data.quantity
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
