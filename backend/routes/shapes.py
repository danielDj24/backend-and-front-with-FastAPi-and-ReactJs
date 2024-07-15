import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from routes.auth import oauth2_scheme


"""ORM"""
from models.products import Shape
from schemas.products import ShapeResponseData, ShapeCreateData


shapes_routes = APIRouter()
"""rutas para manejar las formas de los lentes"""


@shapes_routes.get("/product/shapes", response_model=List[ShapeResponseData])
def get_all_shapes(db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access shapes")
    shapes = db.query(Shape).all()
    if not shapes:
        return HTTPException(status_code=404, detail="shapes not found")
    return shapes

@shapes_routes.post("/product/create/shape", response_model=ShapeResponseData)
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


@shapes_routes.post("/products/shape/upload_img/{shape_id}/img", response_model = ShapeResponseData)
def upload_img_shape(shape_id: int, file: UploadFile = File(...), db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create shape")
    
    shape = db.query(Shape).filter(Shape.id == shape_id).first()
    if not shape:
        raise HTTPException(status_code=404, detail="shape not found")

    uploads_dir = "media/products/shapes/"
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, file.filename)
    with open(file_path, "wb") as file_object:
        file_object.write(file.file.read())
    shape.shape_picture = file_path
    db.commit()
    db.refresh(shape)
    return shape

@shapes_routes.delete("/products/shape/delete/{shape_id}", response_model=ShapeResponseData)
def delete_shape(shape_id: int,db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete shape")
    
    shape = db.query(Shape).filter(Shape.id == shape_id).first()
    if not shape:
        raise HTTPException(status_code=404, detail="shape not found")
    try:
        if shape.shape_picture:
            if os.path.exists(shape.shape_picture): 
                os.remove(shape.shape_picture)
    except Exception as e:
        # Manejar la excepción de archivo no encontrado de manera más genérica
        print(f"Error deleting image: {str(e)}")
    db.delete(shape)
    db.commit()
    return shape
