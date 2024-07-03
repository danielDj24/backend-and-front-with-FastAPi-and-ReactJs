from sqlalchemy import Column, String, Integer
from config.database import Base


class Blog(Base):
    __tablename__ = 'blog'
    id = Column(Integer, primary_key = True, index = True)
    categorie = Column(String(300), index = True)
    notice_content = Column(String(), index = True)
    img_notice = Column(String(), index = True)