import os
from fastapi import APIRouter, HTTPException,Depends, File, UploadFile
from schemas.users import UserData,UserID
from sqlalchemy.orm import session
from services import userscrud
from sqlalchemy.orm import session
from models.users import User
from services.dbconnection import GetDB

registration_router = APIRouter()

"""ruta de registro con los datos iniciales"""

@registration_router.post('/register/', response_model=UserID)
def create_ser(user: UserData, db:session=Depends(GetDB)):
    try:
        user.hash_password()

        check_name = userscrud.get_user_by_name(db=db, identifier=user.username)
        if check_name:
            if not check_name.phone or not check_name.address or not check_name.name_company or not check_name.nit_company:
                return check_name
            else:
                raise HTTPException(status_code=400, detail='El nombre de usuario ya existe y ha completado los datos adicionales')
        
        check_email = userscrud.get_user_by_email(db=db, identifier=user.email)
        if check_email:
            raise HTTPException(status_code=400, detail='El correo electrónico ya existe')
        if user.role == "admin":
            user.is_active = True
        
        new_user = userscrud.create_user(db=db, user=user, is_active=user.is_active)
        return new_user 
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))
    
"""ruta de registro con los datos extra para la validacion de los datos ingresados por el usuario"""

@registration_router.post('/register/verify/data', response_model=UserID)
def validate_user(user_data: UserData, db: session = Depends(GetDB)):
    user = userscrud.get_user_by_name(db=db, identifier=user_data.username)
    if not user:
        raise HTTPException(status_code=400, detail='User does not exist')

    if user_data.phone:
        user.phone = user_data.phone
    if user_data.address:
        user.address = user_data.address
    if user_data.name_company:
        user.name_company = user_data.name_company
    if user_data.nit_company:
        user.nit_company = user_data.nit_company
    db.commit()
    db.refresh(user)
    return user

"""ruta para subir el rut por parte de los usuarios"""

@registration_router.post('/register/upload/rut_company/{user_id}', response_model=UserID)
async def upload_rut_company(user_id: int, file: UploadFile = File(...), db: session=Depends(GetDB)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    # Verificar el tipo MIME
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail='Only PDF files are allowed')
    # Guardar el archivo en el sistema de archivos
    uploads_dir = "media/rut_company"
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, f"{user_id}_{file.filename}")
    
    with open(file_path, "wb") as file_object:
        file_object.write(await file.read())
    user.rut_company = file_path
    db.commit()
    db.refresh(user)    
    return user