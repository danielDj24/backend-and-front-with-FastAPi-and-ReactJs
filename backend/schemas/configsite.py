from pydantic import BaseModel
from typing import Optional

class ConfigSiteData(BaseModel):
    primary_color : Optional[str] = None
    secondary_color :Optional[str] = None
    facebook_link : Optional[str] = None
    youtube_link : Optional[str] = None
    whatsapp_link : Optional[str] = None
    twitter_link : Optional[str] = None
    contact_email : Optional[str] = None
    contact_phone : Optional[str] = None
    address : Optional[str] = None
    
class COnfigSiteCreateData(ConfigSiteData):
    pass


class ConfigSiteDataResponse(ConfigSiteData):
    id : int
    logo_site : Optional[str] = None
    fav_icon : Optional[str] = None 

    class Config: 
        from_attributes = True 



"""Banners data"""
class BannersData(BaseModel):
    link_url : Optional[str] = None
    position : Optional[int] = None

class BannersCreateData(BannersData):
    pass

class BannersDataResponse(BannersData):
    id : int
    image : Optional[str] = None

    class Config: 
        from_attributes = True 