from fastapi import APIRouter, Header,Depends
from utils.functions_jwt import WriteToken, ValidateToken
from fastapi.responses import JSONResponse
from models.users import User
from schemas.users import UserData
from services.userscrud import get_user_by_name  
from sqlalchemy.orm import session
from config.database import localsession

auth_routes = APIRouter()

"""inicio de sesion a la base de datos"""
def GetDB():
    db = localsession()
    try:
        yield db    
    finally:
        db.close()


@auth_routes.post("/login")
def Login(user : UserData, db: session = Depends(GetDB)): 
    db_user = get_user_by_name(db=db,username = user.username)
    if db_user and db_user.password == user.password:
        user_dict = {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
        }
        return WriteToken(user_dict) 
    else:
        return JSONResponse(content={"message":"User not found"}, status_code = 404)

@auth_routes.post("/verify/token")
def verify_token(Authorization : str = Header(None)):
    token = Authorization.split(" ")[1]
    
    return ValidateToken(token, output= True)