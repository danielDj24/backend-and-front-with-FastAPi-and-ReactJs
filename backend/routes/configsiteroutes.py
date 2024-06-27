from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from routes.registration import GetDB
from models.configsite import ConfigSite, Banners
from schemas.configsite import COnfigSiteCreateData,ConfigSiteDataResponse, BannersCreateData, BannersDataResponse


from sqlalchemy.orm import session
from sqlalchemy import desc
import os

from typing import List



config_routes = APIRouter()

@config_routes.get("/config", response_model=ConfigSiteDataResponse)
def get_config(db: session = Depends(GetDB)):
    config = db.query(ConfigSite).order_by(desc(ConfigSite.id)).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    return config

# Crear o actualizar configuración
@config_routes.post("/create/config", response_model=ConfigSiteDataResponse)
def create_or_update_config_site(config_data: COnfigSiteCreateData, db: session = Depends(GetDB)):
    config = db.query(ConfigSite).order_by(desc(ConfigSite.id)).first()
    if config:
        for key, value in config_data.dict().items():
            setattr(config, key, value)
        db.commit()
        db.refresh(config)
    else:
        new_config = ConfigSite(**config_data.dict())
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        config = new_config
    return config

@config_routes.delete("/config/{config_id}", response_model=ConfigSiteDataResponse)
def delete_config(config_id: int, db: session = Depends(GetDB)):
    config = db.query(ConfigSite).filter(ConfigSite.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    if config.logo_site:
        if os.path.exists(config.logo_site):
            os.remove(config.logo_site)
        else:
            raise HTTPException(status_code=404, detail="Logo file not found")
    db.delete(config)
    db.commit()
    
    return config

@config_routes.post("/config/{config_id}/logo", response_model=ConfigSiteDataResponse)
def upload_logo(config_id: int, file: UploadFile = File(...), db:session = Depends(GetDB)):
    config = db.query(ConfigSite).filter(ConfigSite.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    # Guardar el archivo en el sistema de archivos
    uploads_dir = "resources"
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, file.filename)
    with open(file_path, "wb") as file_object:
        file_object.write(file.file.read())

    # Actualizar la ruta del logo en la base de datos
    config.logo_site = file_path
    db.commit()
    db.refresh(config)
    
    return config

"""control de banners"""

@config_routes.post("/config/banners/upload", response_model=BannersDataResponse)
def create_banners(banner_data: BannersCreateData,  db: session = Depends(GetDB)):
    # Crear el banner en la base de datos
    banner = Banners(
        link_url=banner_data.link_url,
        position=banner_data.position,
    )
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner

@config_routes.post("/config/banners/{banner_id}/banner", response_model=BannersDataResponse)
def upload_banner_image(banner_id: int, file: UploadFile = File(...), db: session = Depends(GetDB)):
    banner = db.query(Banners).filter(Banners.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    uploads_dir = "resources/banners"
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, file.filename)
    with open(file_path, "wb") as file_object:
        file_object.write(file.file.read())

    banner.image = file_path
    db.commit()
    db.refresh(banner)
    
    return banner

@config_routes.get("config/banners", response_model= List[BannersDataResponse])
def get_banners(db: session = Depends(GetDB)):
    banners = db.query(Banners).all()
    if not banners:
        raise HTTPException(status_code=404, detail="No banners found")
    return  banners

@config_routes.delete("/config/banners/{banner_id}", response_model=BannersDataResponse)
def delete_banner(banner_id: int, db: session = Depends(GetDB)):
    banner = db.query(Banners).filter(Banners.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    if banner.image:
        if os.path.exists(banner.image):
            os.remove(banner.image)
        else:
            raise HTTPException(status_code=404, detail="Image file not found")
    db.delete(banner)
    db.commit()
    
    return banner