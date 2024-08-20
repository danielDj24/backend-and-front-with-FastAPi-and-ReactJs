from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from config.database import Base
from sqlalchemy.orm import relationship
from models.products import Product
from models.users import User
from datetime import datetime 

class Cart(Base):
    __tablename__= "carts"
    id =  Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    total_value = Column(Float, default=0.0, index=True)
    
    user = relationship("User", back_populates="cart")
    cart_items = relationship("CartItem", back_populates = "cart",cascade = "all,delete-orphan")
    

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey('carts.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)

    cart = relationship("Cart", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


User.cart = relationship("Cart", back_populates="user", uselist=False)
Product.cart_items = relationship("CartItem", back_populates="product")
