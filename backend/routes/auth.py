import os
from fastapi import APIRouter,Depends,Form
from schemas.email import ResetPasswordRequest,ContactForm,EmailRequest,NotifyOrderRequest
from schemas.users import UserID, pwd_context
from services.userscrud import get_user_by_name,delete_users_by_id, activate_user, activate_user_preferencial,GetUserID,GetUsers, update_user_password
from sqlalchemy.orm import session
from fastapi.exceptions import HTTPException
from typing import List
from services.dbconnection import GetDB

from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from utils.functions_jwt import encode_token, decode_token, blacklist, encode_reset_password_token,decode_reset_password_token
from utils.functions_send_email import send_email
from models.users import User
from schemas.email import ContactForm
from dotenv import load_dotenv
from fastapi import UploadFile, File, Form
from fastapi.responses import JSONResponse

from sqlalchemy.orm import Session
from fastapi import Depends
from models.orders import Order, OrderItem

load_dotenv()

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
    token = encode_token({"id": user.id,"username" : user.username, "email" : user.email, "role": user.role, "preferencial_client": user.preferencial_client}) 
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
    

"""obtener los datos del usuario"""
@auth_routes.get("/user/{user_id}", response_model=UserID)
def get_user_by_id(user_id: int, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])

    # Verificar que el usuario tenga permisos para ver la información
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to view user data")
    
    # Buscar el usuario por su ID
    user_data = db.query(User).filter(User.id == user_id).first()

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_data


"""activar usuarios"""
@auth_routes.patch("/user/active/{user_id}")
def active_user(user_id :int,token: str = Depends(oauth2_scheme), db : session = Depends(GetDB)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete users")
    user = activate_user(db, user_id)
    return {"detail": "User activated successfully", "user": user}

@auth_routes.patch("/user/preferencial/{user_id}")
def active_user_preferencial(user_id :int,token: str = Depends(oauth2_scheme), db : session = Depends(GetDB)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update users")
    user = activate_user_preferencial(db, user_id)
    return {"detail": "User Preferencial activated", "user": user}
    

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


@auth_routes.post("/contact")
async def contact_form_submission(request: ContactForm):
    subject = f"Nuevo Mensaje de Contacto de {request.name}"
    body = f"""
    <html>
    <body>
        <h2>Solicitud de mensaje</h2>
        <p>Has recibido un nuevo mensaje de contacto:</p>
        <p><strong>Compañia:</strong> {request.company}</p>
        <p><strong>Nombre:</strong> {request.name}</p>
        <P><strong>Apellido:</strong> {request.last_name}</p>
        <p><strong>Email:</strong> {request.email}</p>
        <p><strong>Mensaje:</strong> {request.message}</p>
    </body>
    </html>
    """
    
    recipient_email = os.getenv("FROM_EMAIL")  

    send_email(subject, body, recipient_email)

    return {"message": "Formulario enviado correctamente"}

@auth_routes.post("/send-confirmation")
async def send_confirmation_email(request: EmailRequest, db: Session = Depends(GetDB)):
    order_id = request.order_id
    client_email = request.client_email
    client_name = request.client_name

    # Consultar la orden desde la base de datos
    order = db.query(Order).filter(Order.order_id == order_id).first()

    if not order:
        return {"message": "Orden no encontrada"}

    # Generar el cuerpo del correo
    subject = "Confirmación de Orden"
    
    # Tabla con los detalles de los productos
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

    table_rows = ""
    for item in order_items:
        table_rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{item.product_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{item.product_brand}</td>
        </tr>
        """

    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">¡Hola {client_name}!</h2>
            <p style="color: #555;">Tu orden con ID <strong>{order_id}</strong> ha sido confirmada por nuestro equipo.</p>
            <p style="color: #555;">Gracias por confiar en nosotros. A continuación, te mostramos los detalles de tu compra:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #f4f4f4; border-bottom: 1px solid #ddd;">
                        <th style="padding: 8px; text-align: left; color: #333;">Producto</th>
                        <th style="padding: 8px; text-align: left; color: #333;">Cantidad</th>
                        <th style="padding: 8px; text-align: left; color: #333;">Marca</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>

            <p style="color: #555; margin-top: 20px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p style="color: #555;">Gracias por tu compra,</p>
            <p style="color: #555;">El equipo de soporte</p>

            <hr style="margin: 20px 0; border: 1px solid #ddd;" />
            <p style="color: #555; font-size: 12px; text-align: center;">Este es un correo automático, por favor no lo respondas. Todos los derechos reservados a Frames S.A.S.</p>
        </div>
    </body>
    </html>
    """

    # Enviar el correo al cliente
    send_email(subject, body, client_email)

    return {"message": "Correo de confirmación enviado al cliente"}

from pydantic import BaseModel

class NotifyOrderRequest(BaseModel):
    order_id: str
    client_name: str
    client_email: str

@auth_routes.post("/notify-order")
async def notify_internal_order(
    data: NotifyOrderRequest,
    db: Session = Depends(GetDB)
):
    try:
        # Extraer los datos
        order_id = data.order_id
        client_name = data.client_name
        client_email = data.client_email

        # Obtener la orden con los productos asociados desde la base de datos
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if not order:
            return JSONResponse(status_code=404, content={"error": "Orden no encontrada"})

        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        if not order_items:
            return JSONResponse(status_code=404, content={"error": "No se encontraron productos para esta orden"})

        # Crear el cuerpo del correo
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #333;">Nueva Orden Recibida</h2>
                <p style="color: #555;">Se ha recibido una nueva orden con el ID: <strong>{order.order_id}</strong>.</p>
                <p style="color: #555;">Realizada por: <strong>{client_name}</strong> ({client_email})</p>

                <h3 style="color: #333;">Productos de la Orden</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Producto</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Cantidad</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Marca</th>
                        </tr>
                    </thead>
                    <tbody>
        """

        for item in order_items:
            body += f"""
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">{item.product_name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{item.product_brand}</td>
            </tr>
            """

        body += """
                    </tbody>
                </table>
                <hr style="margin: 20px 0; border: 1px solid #ddd;" />
            </div>
        </body>
        </html>
        """

        # Enviar el correo interno
        internal_email = os.getenv("FROM_EMAIL")  # Asegúrate de tener esta variable en tu .env
        send_email(subject=f"Nueva Orden Recibida - {order_id}", body=body, to_email=internal_email)

        return {"message": "Notificación interna enviada"}

    except Exception as e:
        print(f"[ERROR] Error en endpoint /notify-order: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@auth_routes.post("/send-document")
async def send_document(
    file: UploadFile = File(...),
    email: str = Form(...),
):
    try:
        file_bytes = await file.read()
        filename = file.filename
        print(f"[DEBUG] Archivo recibido: {filename}, tamaño: {len(file_bytes)} bytes")

        subject = "Factura de compra"
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #333; text-align: center;">Factura de compra</h2>
                <p style="color: #555; text-align: center;">Estimado/a cliente,</p>
                <p style="color: #555;">Gracias por tu compra. Aquí está la factura de tus productos.</p>

                <p style="color: #555; margin-top: 20px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <p style="color: #555;">Gracias por tu compra,</p>
                <p style="color: #555;">El equipo de soporte</p>

                <hr style="margin: 20px 0; border: 1px solid #ddd;" />
                <p style="color: #555; font-size: 12px; text-align: center;">Este es un correo automático, por favor no lo respondas. Todos los derechos reservados a Frames S.A.S.</p>
            </div>
        </body>
        </html>
        """
        # Ahora se envía al correo del usuario
        send_email(subject, body, email, attachments=[(filename, file_bytes)])

        return JSONResponse(content={"message": "Documento enviado correctamente"})
    except Exception as e:
        print(f"[ERROR] Error en endpoint /send-document: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


