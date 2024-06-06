from fastapi import FastAPI
from config.database import engine
from models.users import Base
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import auth_routes
from routes.registration import registration_router
from routes.configsiteroutes import config_routes
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount("/resources", StaticFiles(directory="resources"), name="resources")

app.include_router(auth_routes, prefix="/api")
app.include_router(registration_router, prefix="/api")
app.include_router(config_routes, prefix="/api")

"""ruta del front"""
origin = ['*']

"""Middlewares para la conexion con el front"""
app.add_middleware(
    CORSMiddleware, allow_origins = origin, 
    allow_methods = ['*'], 
    allow_headers= ['*'],
    allow_credentials = True )




