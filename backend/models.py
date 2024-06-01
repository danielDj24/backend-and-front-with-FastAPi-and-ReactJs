from sqlalchemy import Column, String, Integer
from database import Base

"""modelos dentro de la base de datos"""
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30),index=True, unique=True)
    password = Column(String(30), index=True)