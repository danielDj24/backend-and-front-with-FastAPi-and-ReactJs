import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from routes.auth import oauth2_scheme


"""ORM"""
from models.brands import Brand
from schemas.brands import BrandDataCreateData,BrandDataResponse


brands_router = APIRouter()

@brands_router.get("/uploaded/brands",response_model = List[BrandDataResponse])
def get_brands(db: session = Depends(GetDB)):
    brands = db.query(Brand).all()
    if not brands:
        raise HTTPException(status_code=404, detail="No banners found")
    return  brands

@brands_router.post("/create/brands", response_model=BrandDataResponse)
def create_brand(brand_data : BrandDataCreateData, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create brad")
    
    brand = Brand(
        name = brand_data.name
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand

@brands_router.post("/brands/upload/{brand_id}/brand_logo", response_model=BrandDataResponse)
def upload_logo_brand(brand_id : int, file: UploadFile = File(...), db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create brad")
    
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    uploads_dir = "media/logos/brands"
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, file.filename)
    with open(file_path, "wb") as file_object:
        file_object.write(file.file.read())

    brand.brand_logo = file_path
    db.commit()
    db.refresh(brand)
    
    return brand

@brands_router.delete("/brands/delete/{brand_id}", response_model = BrandDataResponse)
def delete_brand(brand_id : int ,db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create brad")
    
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    try:
        if brand.brand_logo:
            if os.path.exists(brand.brand_logo):
                os.remove(brand.brand_logo)
    except Exception as e:
        # Manejar la excepción de archivo no encontrado de manera más genérica
        print(f"Error deleting image: {str(e)}")
    db.delete(brand)
    db.commit()
    
    return brand

