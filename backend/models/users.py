from sqlalchemy import Column, String, Integer, Text, Boolean
from config.database import Base

"""modelos dentro de la base de datos"""
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(500),index=True, unique=True)
    email = Column(String(500),index=True, unique=True)
    password = Column(String(500), index=True)
    phone = Column(String(500), index=True)
    name_company = Column(String(100), index=True)
    address = Column(String(500), index=True)
    nit_company = Column(String(500), index=True)
    rut_company = Column(Text)
    is_active = Column(Boolean, default=True)
    role = Column(String(50))
    preferencial_client = Column(Boolean, default=False)


