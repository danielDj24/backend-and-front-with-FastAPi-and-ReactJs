from fastapi import FastAPI
from config.database import engine
from models.users import Base
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination

"""Rutas de la app"""
from routes.auth import auth_routes
from routes.registration import registration_router
from routes.configsiteroutes import config_routes
from routes.brands import brands_router
from routes.blog import blog_routes
from routes.products import product_routes
from routes.shapes import shapes_routes
from routes.discounts import discount_routes
from routes.cart import cart_routes
from routes.transactions import transactions_routes

from fastapi.staticfiles import StaticFiles


Base.metadata.create_all(bind=engine)

app = FastAPI()

"""mount para los recursos a utilizar """
app.mount("/resources", StaticFiles(directory="resources"), name="resources")

"""Mount de media para los recursos por parte de los usuarios"""
app.mount("/media", StaticFiles(directory="media"), name="media")


app.include_router(auth_routes, prefix="/api")
app.include_router(registration_router, prefix="/api")
app.include_router(config_routes, prefix="/api")
app.include_router(brands_router, prefix="/api")
app.include_router(blog_routes, prefix="/api")
app.include_router(shapes_routes, prefix="/api")
app.include_router(discount_routes, prefix="/api")
app.include_router(product_routes, prefix="/api")
app.include_router(cart_routes, prefix="/api")
app.include_router(transactions_routes, prefix="/api")

add_pagination(app)

"""ruta del front"""
origin = ['*']

"""Middlewares para la conexion con el front"""
app.add_middleware(
    CORSMiddleware, allow_origins = origin, 
    allow_methods = ['*'], 
    allow_headers= ['*'],
    allow_credentials = True )




