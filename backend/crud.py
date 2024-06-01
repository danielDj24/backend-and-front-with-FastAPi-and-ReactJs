from sqlalchemy.orm import session
from models import User
from schemas import UserData

"""Obtener todos los usuarios"""
def GetUsers(db: session):
    return db.query(User).all()


"""Obtener usuarios por id"""
def GetUserID(db: session, id: int):
    return db.query(User).filter(User.id == id).first()


"""Obtener usuarios por nombre"""
def GetUSerByName(db: session, name: str):
    return db.query(User).filter(User.name == name). first()

"""Crear nuevo usuario"""
def CreateUser(db:session,user: UserData):
    fake_password = user.password + '#fake'
    new_user = User(name =user.name, password = fake_password)
    db.add(new_user)
    db.commit()
    db.flush(new_user)

    return new_user

