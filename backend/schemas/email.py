from pydantic import BaseModel, EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ContactForm(BaseModel):
    company: str
    name: str
    last_name: str
    email: EmailStr
    message: str