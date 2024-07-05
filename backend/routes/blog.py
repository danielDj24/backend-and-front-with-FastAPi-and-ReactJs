from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
import os

from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from routes.auth import oauth2_scheme

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

@blog_routes.get("/data/notice/{notice_id}", response_model=BlogDataResponse)
def get_notices_by_id(notice_id: int, db : session = Depends(GetDB)):
    notice = db.query(Blog).filter(Blog.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code = 404, detail = "Not notice found by id")
    
    return notice


@blog_routes.get("/data/notice/{categorie}", response_model=List[BlogDataResponse])
def get_notices_by_categorie(categorie : str ,db : session = Depends(GetDB)):
    notices = db.query(Blog).filter(Blog.categorie == categorie).all()
    if not notices:
        raise HTTPException(status_code = 404, detail = "Not notices found by categorie")
    return notices 

@blog_routes.post("/data/create/notice", response_model = BlogDataResponse)
def create_notice(notice_data : BlogDataCreateData, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create brad")
    
    notice = Blog(
        categorie = notice_data.categorie,
        title = notice_data.title,
        notice_content = notice_data.notice_content,
        date = notice_data.date,

    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice

@blog_routes.post("/data/upload/img/{notice_id}/img", response_model = BlogDataResponse)
def upload_banner_notice(notice_id: int, file: UploadFile = File(...), db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create brad")
    
    notice = db.query(Blog).filter(Blog.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Banner not found")

    uploads_dir = "media/notices/banners"
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, file.filename)
    with open(file_path, "wb") as file_object:
        file_object.write(file.file.read())

    notice.img_notice = file_path
    db.commit()
    db.refresh(notice)
    
    return notice

@blog_routes.delete("data/notice/delete/{notice_id}", response_model = BlogDataResponse)
def delete_notice(notice_id: int, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create brad")
    
    notice = db.query(Blog).filter(Blog.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="notice not found")
    try:
        if notice.img_notice:
            if os.path.exists(notice.img_notice):
                os.remove(notice.img_notice)
    except Exception as e:
        print(f"Error deleting image: {str(e)}")
    db.delete(notice)
    db.commit()
    
    return notice
