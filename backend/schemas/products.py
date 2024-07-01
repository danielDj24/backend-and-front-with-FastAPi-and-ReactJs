from pydantic import BaseModel
from typing import Optional

class BrandData(BaseModel):
    name : Optional[str] = None

class BrandDataCreateData(BrandData):
    pass

class BrandDataResponse(BrandData):
    id :int 
    brand_logo : Optional[str] = None

    class Config:
        from_attributes = True