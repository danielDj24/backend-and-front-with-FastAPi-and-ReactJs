from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List

from services.userscrud import GetUserID
from utils.functions_jwt import decode_token

from services.dbconnection import GetDB
from sqlalchemy.orm import session

"""ORM"""
from models.blog import Blog
from schemas.blog import BlogDataCreateData,BlogDataResponse,BlogData

blog_routes = APIRouter()

@blog_routes.get("/data/notice", response_model=List[BlogDataResponse])
def all_notices(db : session = Depends(GetDB)):
    blog = db.query(Blog).all()
    if not blog:
        raise HTTPException(status_code=404, detail="Notices not found")
    return  blog

@blog_routes.get("/data/notice/{categorie}", response_model=List[BlogDataResponse])
def get_notices_by_categorie(categorie : str ,db : session = Depends(GetDB)):
    notices = db.query(Blog).filter(Blog.categorie == categorie).all()
    if not notices:
        raise HTTPException(status_code = 404, detail = "Not notices found by categorie")
    return notices 

