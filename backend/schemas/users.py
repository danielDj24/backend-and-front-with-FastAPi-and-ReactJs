from pydantic import BaseModel,EmailStr
from typing import Optional
from passlib.context import CryptContext

#instancia para el hashing
pwd_context = CryptContext(schemes = ["bcrypt"], deprecated = "auto")

"""Esquemas para los datos en registro y validacion de usuarios"""

class UserData(BaseModel):
    username : str
    email : EmailStr
    password : str
    phone : Optional[str] = None
    address : Optional[str] = None
    name_company :Optional[str] = None
    nit_company : Optional[str] = None
    rut_company : Optional[str] = None
    """campo para permitir el ingreso de los usuarios"""
    is_active:  Optional[bool] = False
    role :  Optional[str] = "client"
    preferencial_client: Optional[bool] = False

    def hash_password(self):
        self.password = pwd_context.hash(self.password) 

class UserID(UserData):
    id : int
    

