import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from routes.auth import oauth2_scheme

"""ORM"""
from models.products import  Discount
from schemas.products import  DiscountCreateData, DiscountResponseData


discount_routes = APIRouter()

"""rutas para manejar los descuentos"""
@discount_routes.get("/products/discount/all", response_model=List[DiscountResponseData])
def get_all_discounts(db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access products")
    discounts = db.query(Discount).all()
    if not discounts:
        return HTTPException(status_code=404, detail="discounts not found")
    return discounts
    

@discount_routes.post("/product/create/discount", response_model=DiscountResponseData)
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

@discount_routes.delete("/product/discount/delete/{discount_id}", response_model=DiscountResponseData)
def delete_discount(discount_id : int, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete discount")
    
    discount = db.query(Discount).filter(discount.id == discount_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="discount not found")
    db.delete(discount)
    db.commit()
    return discount