from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header
from routes.registration import GetDB
from models.configsite import ConfigSite
from schemas.configsite import COnfigSiteCreateData,ConfigSiteDataResponse
from sqlalchemy.orm import session
from sqlalchemy import desc
import os




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