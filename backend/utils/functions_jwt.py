from jwt import encode,decode
from jwt import exceptions
from datetime import datetime,timedelta
from os import getenv
from fastapi.responses import JSONResponse 
import jwt


def ExpirateDate(days: int):
    date = datetime.now()
    new_date = date + timedelta(days)
    return(new_date)




def WriteToken(data:dict):
    expiration = datetime.now() + timedelta(days=1)  # Token válido por 1 hora
    token = jwt.encode({"exp": expiration, **data}, getenv("SECRET_KEYS"), algorithm="HS256")
    print(f"Generated token: {token}")
    return {"token": token}


def ValidateToken(token, ouput=False):
    try:
        decoded_token = jwt.decode(token, getenv("SECRET_KEYS"), algorithms=["HS256"])
        print(f"Decoded token: {decoded_token}")
        return JSONResponse(content={"message": "Token is valid", "token": decoded_token})
    except exceptions.DecodeError:
        return JSONResponse(content={"message": "Invalid token"}, status_code=401)
    except exceptions.ExpiredSignatureError:
        return JSONResponse(content={"message": "Token expired"}, status_code=401)
