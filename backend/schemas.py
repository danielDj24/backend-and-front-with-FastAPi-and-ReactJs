from pydantic import BaseModel

"""Esquemas para los datos"""

class UserData(BaseModel):
    name : str
    password : str

class UserID(UserData):
    id : int
