from sqlalchemy import Column, String, Integer, DateTime,Text
from config.database import Base
from datetime import datetime


class Blog(Base):
    __tablename__ = 'blog'
    id = Column(Integer, primary_key = True, index = True)
    categorie = Column(String(300), index = True)
    title = Column(String(300), index = True)
    notice_content = Column(Text, index = True)
    img_notice = Column(String(500), index = True)
    date = Column(DateTime, default=datetime.utcnow, index=True)