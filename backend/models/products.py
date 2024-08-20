from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from config.database import Base
from sqlalchemy.orm import relationship
from models.brands import Brand
from datetime import datetime 


class Discount(Base):
    __tablename__ = 'discounts'
    id = Column(Integer, primary_key=True, index=True)
    discount_percentage = Column(Float, nullable=True)
    description = Column(String(500), index=True)
    
    products = relationship("Product", back_populates="discount")

class Shape(Base):
    __tablename__ = 'shapes'
    id = Column(Integer, primary_key=True, index=True)
    name_shape = Column(String(500), index=True)
    shape_picture = Column(String(500), index=True)
    
    products = relationship("Product", back_populates="shape")

class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey('brands.id'))
    discount_id = Column(Integer, ForeignKey('discounts.id'), nullable=True)
    name_product = Column(String(500), index=True)
    price_product = Column(Integer, index=True)
    shape_id = Column(Integer, ForeignKey('shapes.id'), nullable=True)
    frame_material = Column(String(500), index=True)
    color = Column(String(500), index=True)
    size = Column(String(500), index=True)
    size_caliber = Column(String(500), index=True)
    size_vertical = Column(String(500), index=True)
    size_arm = Column(String(500), index=True)
    gender = Column(String(500), index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    quantity_col = Column(Integer, index=True)
    quantity_usa = Column(Integer, index=True)
    quantity = Column(Integer, index=True)
    center_picture = Column(String(500), index=True)
    side_picture = Column(String(500), index=True)
    
    brand = relationship("Brand", back_populates="products")
    discount = relationship("Discount", back_populates="products")
    shape = relationship("Shape", back_populates="products")

    cart_items = relationship("CartItem", back_populates="product")
    
Brand.products = relationship("Product", order_by=Product.id, back_populates="brand")
Discount.products = relationship("Product", order_by=Product.id, back_populates="discount")
Shape.products = relationship("Product", order_by=Product.id, back_populates="shape")
