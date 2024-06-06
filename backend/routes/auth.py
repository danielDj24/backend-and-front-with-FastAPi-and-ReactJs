from fastapi import APIRouter, Header,Depends
from utils.functions_jwt import WriteToken, ValidateToken
from fastapi.responses import JSONResponse
from models.users import User
from schemas.users import UserData,UserID
from services.userscrud import get_user_by_name  
from sqlalchemy.orm import session
from config.database import localsession
from starlette.status import HTTP_401_UNAUTHORIZED
from fastapi import HTTPException
from typing import List


auth_routes = APIRouter()

"""inicio de sesion a la base de datos"""
def GetDB():
    db = localsession()
    try:
        yield db    
    finally:
        db.close()

@auth_routes.get("/users", response_model=List[UserID])
def get_users(db: session = Depends(GetDB)):
    users = db.query(User).all()
    return users


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
    if Authorization is None:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Authorization header missing")
    
    try:
        parts = Authorization.split(" ")
        if len(parts) != 2 or parts[0] != "Bearer":
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid authorization header format")
        token = parts[1]
    except Exception as e:
        print(f"Error processing authorization header: {e}")
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid authorization header format")

    return ValidateToken(token)

@auth_routes.delete("/users/{user_id}", status_code=200)
def delete_user(user_id: int, db: session = Depends(GetDB)):
    user_to_delete = db.query(User).filter(User.id == user_id).first()
    if user_to_delete is None:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user_to_delete)
    db.commit()
    return {"message": "User deleted successfully"}

