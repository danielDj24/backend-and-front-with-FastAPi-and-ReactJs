from sqlalchemy.orm import session
from models.users import User 
from schemas.users import UserData, UserID
from fastapi.exceptions import HTTPException

"""Obtener todos los usuarios"""
def GetUsers(db: session):
    return db.query(User).all()


"""Obtener usuarios por id"""
def GetUserID(db: session, id: int):
    return db.query(User).filter(User.id == id).first()


"""Obtener usuarios por nombre"""
def get_user_by_name(db: session, identifier: str):
    return db.query(User).filter((User.username == identifier) | (User.email == identifier)).first()

"""Obtener usuarios por nombre"""
def get_user_by_email(db: session, identifier: str):
    return db.query(User).filter((User.email == identifier) | (User.email == identifier)).first()

"""Crear nuevo usuario"""
def create_user(db:session,user: UserData,is_active: bool = False):
    new_user = User(username = user.username,email=user.email, password = user.password, is_active = is_active)
    db.add(new_user)
    db.commit()
    db.flush(new_user)
    return new_user


"""actualizar datos del usuario"""
def update_user(db:session, user_id: int, user_update: UserID) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.username:
        user.username = user_update.username
    if user_update.email:
        user.email = user_update.email
    db.commit()
    db.refresh(user)
    return user