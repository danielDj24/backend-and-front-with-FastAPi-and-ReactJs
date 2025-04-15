import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde un archivo .env
load_dotenv()

from email.mime.application import MIMEApplication

def send_email(subject: str, body: str, to_email: str, attachments: list = None):
    from_email = os.getenv('FROM_EMAIL')
    password = os.getenv('PASSWORD')
    smtp_server = os.getenv('SMTP_SERVER')
    smtp_port = os.getenv('SMTP_PORT')

    if smtp_port is None:
        raise ValueError("SMTP_PORT is not set in environment variables")

    smtp_port = int(smtp_port)

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    # Adjuntar archivos si existen
    if attachments:
        for filename, file_bytes in attachments:
            print(f"[DEBUG] Adjuntando archivo: {filename}, tamaño: {len(file_bytes)} bytes")
            part = MIMEApplication(file_bytes, Name=filename)
            part['Content-Disposition'] = f'attachment; filename="{filename}"'
            msg.attach(part)

    try:
        print(f"[DEBUG] Enviando email a: {to_email}")
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(from_email, password)
            server.sendmail(from_email, to_email, msg.as_string())
        print("[DEBUG] Email enviado correctamente")
    except Exception as e:
        print(f"[ERROR] Fallo al enviar email: {e}")
