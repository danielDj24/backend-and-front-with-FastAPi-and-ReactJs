from pydantic import BaseModel, EmailStr


class EmailSchema(BaseModel):
    email: EmailStr
    subject: str
    message: str
    
    