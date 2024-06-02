from jwt import encode,decode
from jwt import exceptions
from datetime import datetime,timedelta
from os import getenv
from fastapi.responses import JSONResponse 

def ExpirateDate(days: int):
    date = datetime.now()
    new_date = date + timedelta(days)
    return(new_date)



def WriteToken(data:dict):
    token = encode(payload={**data, "exp": ExpirateDate(2) }, key= getenv("SECRET_KEYS"),algorithm="HS256")
    
    return token

def ValidateToken(token, ouput=False):
    try:
        if ouput:
            return decode(token, getenv("SECRET_KEYS"), algorithms=["HS256"])
        decode(token, getenv("SECRET_KEYS"), algorithms=["HS256"])
    except exceptions.DecodeError:
        return JSONResponse(content={"message": "invalid token"}, status_code=401)
    except exceptions.ExpiredSignatureError:
        return JSONResponse(content={"message": "token expired"}, status_code=401)
