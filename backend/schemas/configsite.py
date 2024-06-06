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
    menu : str 

class COnfigSiteCreateData(ConfigSiteData):
    pass


class ConfigSiteDataResponse(ConfigSiteData):
    id : int
    logo_site : Optional[str] = None 

    class Config: 
        orm_mode = True 