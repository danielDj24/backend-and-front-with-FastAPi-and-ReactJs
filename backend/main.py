from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import session
import crud 
from database import engine, localsession
from schemas import UserData, UserID
from models import Base
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

"""ruta del front"""
origin = [
    '172.18.0.4:3000'
]

"""Middlewares para la conexion con el front"""
app.add_middleware(
    CORSMiddleware, allow_origins = origin, 
    allow_methods = ['*'], 
    allow_headers= ['*'],
    allow_credentials = True )


"""inicio de sesion a la base de datos"""
def GetDB():
    db = localsession()
    try:
        yield db
    finally:
        db.close()


@app.get('/')
def Root():
    return('Hi my name is FASTAPI')

"""ruta para obtener la base de datos"""
@app.get('/api/users/',response_model=list[UserID])
def GetUsers(db: session = Depends(GetDB)):
    return crud.GetUsers(db=db)

"""ruta para filtrar la base de datos por usuario"""
@app.get('/api/users/{id:int}', response_model=UserID)
def GetUser(id, db:session=Depends(GetDB)):
    user_id = crud.GetUserID(db=db, id=id)
    if user_id: 
        return user_id
    raise HTTPException(status_code= 404, detail='User not found')

@app.post('/api/users/', response_model=UserID)
def CreateUser(user: UserData, db:session=Depends(GetDB)):
    check_name = crud.GetUSerByName(db=db, name= user.name)
    if check_name:
        raise HTTPException(status_code=400, detail=('user already exist'))
    return crud.CreateUser(db=db, user=user)

