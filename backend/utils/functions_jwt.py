from datetime import datetime,timedelta
from os import getenv
from jose import jwt
from typing import Annotated
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = '/api/token')


def ExpirateDate(days: int):
    date = datetime.now()
    new_date = date + timedelta(days)
    return(new_date)


def encode_token(payload:dict)-> str:
    expiration = datetime.now() + timedelta(days=1)  
    token = jwt.encode({"exp": expiration, **payload}, getenv("SECRET_KEYS"), algorithm="HS256")
    return token

"""logout"""
blacklist = set()  # Aquí almacenaremos los tokens revocados

def decode_token(token : Annotated[str, Depends(oauth2_scheme)]) -> str:
    if token in blacklist:
        raise HTTPException(status_code=401, detail="Token has been revoked")
    try:
        decoded_token = jwt.decode(token, getenv("SECRET_KEYS"), algorithms=["HS256"])
        return decoded_token
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    

def encode_reset_password_token(user_id: int) -> str:
    expiration = datetime.now() + timedelta(hours=1)  # El token expirará en 1 hora
    token = jwt.encode({"exp": expiration, "user_id": user_id}, getenv("SECRET_KEYS"), algorithm="HS256")
    return token

def decode_reset_password_token(token: str) -> int:
    try:
        payload = jwt.decode(token, getenv("SECRET_KEYS"), algorithms=["HS256"])
        return payload.get("user_id")  # Extraer el user_id del token
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="El token ha expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Token inválido")
