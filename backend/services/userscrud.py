from sqlalchemy.orm import session
from models.users import User
from schemas.users import UserData

"""Obtener todos los usuarios"""
def GetUsers(db: session):
    return db.query(User).all()


"""Obtener usuarios por id"""
def GetUserID(db: session, id: int):
    return db.query(User).filter(User.id == id).first()


"""Obtener usuarios por nombre"""
def get_user_by_name(db: session, identifier: str):
    return db.query(User).filter((User.username == identifier) | (User.email == identifier)).first()

"""Crear nuevo usuario"""
def create_user(db:session,user: UserData):
    new_user = User(username =user.username,email=user.email,    password = user.password)
    db.add(new_user)
    db.commit()
    db.flush(new_user)

    return new_user
