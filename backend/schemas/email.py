from pydantic import BaseModel, EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ContactForm(BaseModel):
    company: str
    name: str
    last_name: str
    email: EmailStr
    message: str

class EmailRequest(BaseModel):
    order_id: str
    client_email: str
    client_name: str

class NotifyOrderRequest(BaseModel):
    order_id: str
    client_name: str
    client_email: str