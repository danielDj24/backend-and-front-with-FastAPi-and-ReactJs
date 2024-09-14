import os
import json

from fastapi import APIRouter, Depends, HTTPException
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from routes.auth import oauth2_scheme

from schemas.email import EmailSchema
from utils.functions_send_email import send_email, create_email_body
from dotenv import load_dotenv

load_dotenv()

email_routes = APIRouter()

@email_routes.post("/contact")
async def submit_contact_form(form : EmailSchema, db : session = Depends(GetDB), ):
    try:
        # Preparar el contenido del correo
        subject = form.subject
        body = create_email_body(form.name, form.email, form.message)
        recipient_email = "facturacionframessas@gmail.com"
        
        # Enviar el correo
        send_email(subject, body, recipient_email)

        return {"message": "Formulario recibido exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))