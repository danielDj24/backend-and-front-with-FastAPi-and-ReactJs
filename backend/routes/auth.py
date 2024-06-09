from fastapi import APIRouter,Depends
from models.users import User
from schemas.users import UserID
from services.userscrud import get_user_by_name  
from sqlalchemy.orm import session
from config.database import localsession
from fastapi.exceptions import HTTPException
from typing import List

from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from utils.functions_jwt import encode_token, decode_token


"""inicio de sesion a la base de datos"""
def GetDB():
    db = localsession()
    try:
        yield db    
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

auth_routes = APIRouter()


@auth_routes.post("/token")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],db: session = Depends(GetDB)):
    user = get_user_by_name(db, form_data.username)
    if not user or not user.password == form_data.password:  
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = encode_token({"username" : user.username, "email" : user.email }) 
    return {"access_token" : token }


@auth_routes.get("/users/profile")
def profile(my_user: Annotated[dict, Depends(decode_token)]):
    return my_user 


@auth_routes.get("/users", response_model=List[UserID])
def get_users(db: session = Depends(GetDB)):
    users = db.query(User).all()
    return users

