from fastapi import APIRouter,Depends
from schemas.users import UserID, pwd_context
from services.userscrud import get_user_by_name,delete_users_by_id, activate_user, GetUserID,GetUsers
from sqlalchemy.orm import session
from fastapi.exceptions import HTTPException
from typing import List
from services.dbconnection import GetDB

from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from utils.functions_jwt import encode_token, decode_token, blacklist


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

auth_routes = APIRouter()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@auth_routes.post("/token")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],db: session = Depends(GetDB)):
    user = get_user_by_name(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password):  
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code = 400, detail= "User is not active")
    token = encode_token({"id": user.id,"username" : user.username, "email" : user.email, "role": user.role}) 
    return {"access_token" : token, "role": user.role} 

"""obtener toda la informacion de los usuarios"""
@auth_routes.get("/users", response_model=List[UserID])
def get_users(db: session = Depends(GetDB),token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])

    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to get users")
    
    return GetUsers(db)

"""eliminar usuarios"""
@auth_routes.delete("/users/{user_id}")
def delete_user(user_id: int, db: session = Depends(GetDB),token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete users")
    delete_users_by_id(db, user_id)
    return {"detail": "User deleted successfully"}
    

"""activar usuarios"""
@auth_routes.patch("/user/active/{user_id}")
def active_user(user_id :int,token: str = Depends(oauth2_scheme), db : session = Depends(GetDB)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete users")
    user = activate_user(db, user_id)
    return {"detail": "User activated successfully", "user": user}


@auth_routes.post("/logout")
def logout(token: Annotated[str, Depends(oauth2_scheme)]):
    blacklist.add(token)  # Agregar el token a la lista negra
    return {"detail": "Successfully logged out"}

