
from fastapi import APIRouter,Depends,Form
from schemas.email import ResetPasswordRequest
from schemas.users import UserID, pwd_context
from services.userscrud import get_user_by_name,delete_users_by_id, activate_user, GetUserID,GetUsers, update_user_password
from sqlalchemy.orm import session
from fastapi.exceptions import HTTPException
from typing import List
from services.dbconnection import GetDB

from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from utils.functions_jwt import encode_token, decode_token, blacklist, encode_reset_password_token,decode_reset_password_token
from utils.functions_send_email import send_email
from fastapi.responses import HTMLResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

auth_routes = APIRouter()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@auth_routes.post("/token")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],db: session = Depends(GetDB)):
    user = get_user_by_name(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password):  
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code = 400, detail= "User is not active")
    token = encode_token({"id": user.id,"username" : user.username, "email" : user.email, "role": user.role}) 
    return {"access_token" : token, "role": user.role} 

"""obtener toda la informacion de los usuarios"""
@auth_routes.get("/users", response_model=List[UserID])
def get_users(db: session = Depends(GetDB),token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])

    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to get users")
    
    return GetUsers(db)

"""eliminar usuarios"""
@auth_routes.delete("/users/{user_id}")
def delete_user(user_id: int, db: session = Depends(GetDB),token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete users")
    delete_users_by_id(db, user_id)
    return {"detail": "User deleted successfully"}
    

"""activar usuarios"""
@auth_routes.patch("/user/active/{user_id}")
def active_user(user_id :int,token: str = Depends(oauth2_scheme), db : session = Depends(GetDB)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete users")
    user = activate_user(db, user_id)
    return {"detail": "User activated successfully", "user": user}


@auth_routes.post("/logout")
def logout(token: Annotated[str, Depends(oauth2_scheme)]):
    blacklist.add(token)  # Agregar el token a la lista negra
    return {"detail": "Successfully logged out"}

#restablecer contraseña
@auth_routes.post("/reset-password/send-email")
async def reset_password(request: ResetPasswordRequest, db: session = Depends(GetDB)):
    user = get_user_by_name(db, request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generar un token de restablecimiento de contraseña
    reset_token = encode_reset_password_token(user.id)

    # Preparar el contenido del correo
    subject = "Restablecimiento de Contraseña"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Solicitud de Restablecimiento de Contraseña</h2>
            <p style="color: #555;">Hola <strong>{user.username}</strong>,</p>
            <p style="color: #555;">Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p style="color: #555;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p style="color: #555;">Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
            <a href="http://localhost:3000/reset-password/{reset_token}" style="display: inline-block; background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
            
            <hr style="margin: 20px 0; border: 1px solid #ddd;" />
            
            <p style="color: #555;">Por favor, no contestar este mensaje. Todos los derechos reservados a Frames S.A.S.</p>
            
            <p style="color: #555;">Gracias,</p>
            <p style="color: #555;">El equipo de soporte</p>
            <a  href="http://framesgo.com/>framesgo.com</a>
        </div>
    </body>
    </html>
    """

    recipient_email = request.email


    # Enviar el correo
    send_email(subject, body, recipient_email)  # <-- Corregido: Ahora se pasa el 'recipient_email'

    return {"message": "Correo de restablecimiento de contraseña enviado exitosamente"}


@auth_routes.post("/reset-password")
async def post_reset_password(
    token: str = Form(...),
    new_password: str = Form(...),
    db: session = Depends(GetDB)
):
    user_id = decode_reset_password_token(token)
    if not user_id:
        raise HTTPException(status_code=404, detail="Token inválido o expirado")

    user = GetUserID(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Actualizar la contraseña del usuario
    update_user_password(db, user, new_password)

    return {"message": "Contraseña restablecida correctamente"}

