from sqlalchemy import Column, String, Integer
from config.database import Base

class Brand(Base):
    __tablename__ = 'brands'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), unique = True, index=True)
    brand_logo = Column(String(), index=True, nullable=True )