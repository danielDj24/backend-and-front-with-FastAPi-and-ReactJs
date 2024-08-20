from pydantic import BaseModel
from typing import Optional, List
from schemas.products import ProductsDataResponse
from schemas.users import UserID
from datetime import datetime

class CartItemBase(BaseModel):
    product_id :Optional[int] = None
    quantity : int 
    total_price : float
    

class CarItemCreate(CartItemBase):
    pass

class CartItemDataResponse(CartItemBase):
    id : int
    cart_id : int
    product : Optional[ProductsDataResponse] = None
    
    class Config:
        from_attributes : True
    
class CartBase(BaseModel):
    total_value: float

class CartCreate(CartBase):
    cart_items: List[CarItemCreate]

class CartDataResponse(CartBase):
    id: int
    user_id: int
    created_at: datetime
    cart_items: List[CartItemDataResponse]
    user : Optional[UserID] 

    class Config:
        from_attributes = True