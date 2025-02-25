from pydantic import BaseModel
from typing import List
from datetime import datetime

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    total_price: float

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    user_id: int
    total_value: float

class OrderDataResponse(OrderBase):
    id: int
    created_at: datetime
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
