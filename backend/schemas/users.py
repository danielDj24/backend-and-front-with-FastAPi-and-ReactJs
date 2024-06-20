from pydantic import BaseModel,EmailStr
from typing import Optional

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
class UserID(UserData):
    id : int
    
