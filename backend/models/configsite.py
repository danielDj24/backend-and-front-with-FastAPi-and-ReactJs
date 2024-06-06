from sqlalchemy import Column, String, Integer,Text,LargeBinary
from config.database import Base

class ConfigSite(Base):
    __tablename__ = 'configsite'
    id = Column(Integer, primary_key=True, index=True)
    primary_color = Column(String(30), index= True)
    secondary_color = Column(String(30), index= True)
    facebook_link = Column(String(30), index= True)
    youtube_link = Column(String(30), index= True)
    whatsapp_link = Column(String(30), index= True)
    twitter_link = Column(String(30), index= True)
    contact_email = Column(String(30), index= True)
    contact_phone = Column(String(30), index= True)
    menu = Column(Text)
    logo_site = Column(String(), index=True, nullable=True)