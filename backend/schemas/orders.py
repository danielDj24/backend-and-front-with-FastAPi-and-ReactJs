from pydantic import BaseModel
from typing import List
from datetime import datetime
from typing import Optional

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    total_price: float
    product_name : Optional[str] = None
    product_color: Optional[str] = None
    product_brand : Optional[str] = None
    product_picture : Optional[str] = None
class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    user_id: int  
    order_id: str  
    state_order: str  
    total_value: float  
    order_items: List[OrderItemBase]  

class OrderDataResponse(OrderBase):
    id: int
    created_at: datetime
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    state_order: str

class PaymentData(BaseModel):
    amount: int
    reference: str
    currency : str