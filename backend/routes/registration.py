from fastapi import APIRouter, HTTPException,Depends
from schemas.users import UserData,UserID
from sqlalchemy.orm import session
from services import userscrud
from sqlalchemy.orm import session
from config.database import localsession

registration_router = APIRouter()

"""inicio de sesion a la base de datos"""
def GetDB():
    db = localsession()
    try:
        yield db    
    finally:
        db.close()


@registration_router.post('/register/', response_model=UserID)
def create_ser(user: UserData, db:session=Depends(GetDB)):
    check_name = userscrud.get_user_by_name(db=db, username= user.username)
    if check_name:
        raise HTTPException(status_code=400, detail=('user already exist'))
    return userscrud.create_user(db=db, user=user)
