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
    print(f"Generated token: {token}")
    return token

def decode_token(token : Annotated[str, Depends(oauth2_scheme)]) -> str:
    try:
        decoded_token = jwt.decode(token, getenv("SECRET_KEYS"), algorithms=["HS256"])
        return decoded_token
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")