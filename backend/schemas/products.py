from pydantic import BaseModel
from typing import Optional
from schemas.brands import BrandDataResponse

class ShapeData(BaseModel):
    name_shape : Optional[str] = None
    
class ShapeCreateData(ShapeData):
    pass
    
class ShapeResponseData(ShapeData):
    id : int
    shape_picture : Optional[str] = None 
    
    class config:
        from_attributes : True
    

class DiscountData(BaseModel):
    discount_percentage : Optional[float] = None
    description : Optional[str] = None
    

class DiscountCreateData(DiscountData):
    pass

class DiscountResponseData(DiscountData):
    id : int

    class config:
        from_attributes : True


class ProductsData(BaseModel):
    name_product :  Optional[str] = None
    frame_material : Optional[str] = None
    color :  Optional[str] = None
    size : Optional[str] = None
    gender :  Optional[str] = None
    quantity : Optional[int] = None
    price_product :  Optional[int] = None
    


class ProductsCreateData(ProductsData):
    shape_id: Optional[int] = None
    brand_id: Optional[int] = None
    discount_id: Optional[int] = None

class ProductsDataResponse(ProductsData):
    id: int
    shape: Optional[ShapeResponseData] = None
    brand: Optional[BrandDataResponse] = None
    discount: Optional[DiscountResponseData] = None
    center_picture: Optional[str] = None
    side_picture: Optional[str] = None

    class Config:
        from_attributes  = True
        

class ProductsDataDeleteResponse(ProductsData):
    id: int
    shape_id: Optional[int] = None
    brand_id: Optional[int] = None
    discount_id: Optional[int] = None
    center_picture: Optional[str] = None
    side_picture: Optional[str] = None
