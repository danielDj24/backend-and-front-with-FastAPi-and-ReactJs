import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde un archivo .env
load_dotenv()

def send_email(subject: str, body: str, to_email: str):
    from_email = os.getenv('FROM_EMAIL')
    password = os.getenv('PASSWORD')
    smtp_server = os.getenv('SMTP_SERVER')
    smtp_port = os.getenv('SMTP_PORT')

    if smtp_port is None:
        raise ValueError("SMTP_PORT is not set in environment variables")

    smtp_port = int(smtp_port)

    # Crear el mensaje
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        # Conectar al servidor SMTP y enviar el correo
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(from_email, password)  # Iniciar sesión
            server.sendmail(from_email, to_email, msg.as_string())  # Enviar el correo
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {e}")
