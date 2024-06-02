from fastapi import FastAPI
from sqlalchemy.orm import session
from config.database import engine, localsession
from models.users import Base
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import auth_routes
Base.metadata.create_all(bind=engine)
from routes.registration import registration_router

app = FastAPI()
app.include_router(auth_routes, prefix="/api")
app.include_router(registration_router)

"""ruta del front"""
origin = [
    '172.18.0.4:3000'
]

"""Middlewares para la conexion con el front"""
app.add_middleware(
    CORSMiddleware, allow_origins = origin, 
    allow_methods = ['*'], 
    allow_headers= ['*'],
    allow_credentials = True )




