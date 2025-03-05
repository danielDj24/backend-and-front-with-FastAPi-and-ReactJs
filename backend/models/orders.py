from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime,String
from sqlalchemy.orm import relationship
from config.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(String, nullable=False, unique=True)
    total_value = Column(Float, nullable=False, default=0.0)
    state_order = Column(String, nullable=False, default="En proceso")
    created_at = Column(DateTime, default=datetime.utcnow)

    order_items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False, default=0.0)
    product_name = Column(String, nullable=True, index=True)
    product_color = Column(String, nullable=True, index=True)
    product_brand = Column(String, nullable=True, index=True)
    product_picture = Column(String, nullable=True, index=True)

    order = relationship("Order", back_populates="order_items")
