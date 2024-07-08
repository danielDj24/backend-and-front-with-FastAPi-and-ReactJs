from sqlalchemy import Column, String, Integer
from config.database import Base

class ConfigSite(Base):
    __tablename__ = 'configsite'
    id = Column(Integer, primary_key=True, index=True)
    primary_color = Column(String(500), index= True)
    secondary_color = Column(String(500), index= True)
    facebook_link = Column(String(500), index= True)
    youtube_link = Column(String(500), index= True)
    whatsapp_link = Column(String(500), index= True)
    twitter_link = Column(String(500), index= True)
    contact_email = Column(String(500), index= True)
    contact_phone = Column(String(500), index= True)
    address = Column(String(500), index = True)
    logo_site = Column(String(500), index=True, nullable=True)
    fav_icon = Column(String(500), index=True, nullable=True )


class Banners(Base):
    __tablename__ = 'banners'
    id = Column(Integer, primary_key=True, index=True)
    link_url = Column(String(500), index = True, nullable=True)
    position = Column(Integer, default = 1)
    image = Column(String(500), index = True, nullable=True)


