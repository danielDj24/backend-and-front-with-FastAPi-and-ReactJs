"""Coneccion a la base de datos"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy import inspect

load_dotenv()

DB_NAME = os.getenv('DB_NAME')
DB_HOST = os.getenv('DB_HOST')
DB_DIALECT = os.getenv('DB_DIALECT')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_USER = os.getenv('DB_USER')

URL_CONNECTION = '{}://{}:{}@{}/{}'.format(DB_DIALECT,DB_USER,DB_PASSWORD,DB_HOST,DB_NAME)

engine = create_engine(URL_CONNECTION)

localsession = sessionmaker(autoflush=False, autocommit = False, bind= engine)

Base = declarative_base()

from models.configsite import ConfigSite

def table_exists(engine, table_name):
    inspector = inspect(engine)
    return inspector.has_table(table_name)

# Crear las tablas solo si no existen
if not table_exists(engine, 'configsite'):
    Base.metadata.create_all(bind=engine)


