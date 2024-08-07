from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BlogData(BaseModel):
    categorie : Optional[str] = None
    title :  Optional[str] = None
    notice_content : Optional[str] = None
    date : datetime

class BlogDataCreateData(BlogData):
    pass

class BlogDataResponse(BlogData):
    id : int
    img_notice : Optional[str] = None

    class Config: 
        from_attributes = True 