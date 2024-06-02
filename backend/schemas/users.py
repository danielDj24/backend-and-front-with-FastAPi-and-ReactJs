from pydantic import BaseModel,EmailStr

"""Esquemas para los datos"""

class UserData(BaseModel):
    username : str
    email :EmailStr
    password : str

class UserID(UserData):
    id : int
    
