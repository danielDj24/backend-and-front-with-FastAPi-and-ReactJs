import smtplib
import email
import imaplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()


def send_email(subject: str, body: str, to_email: str):
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

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(from_email, password)
        server.sendmail(from_email, to_email, msg.as_string())
        
def create_email_body(name: str, email: str, message: str) -> str:
    return f"""
    <html>
    <body>
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Message:</strong> {message}</p>
    </body>
    </html>
    """
    
def receive_emails():
    imap_server = os.getenv('IMAP_SERVER')
    imap_port = os.getenv('IMAP_PORT')
    email_user = os.getenv('FROM_EMAIL')
    email_pass = os.getenv('PASSWORD')

    # Conectar al servidor IMAP
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(email_user, email_pass)
    mail.select("inbox")  # Selecciona la carpeta 'inbox'

    # Buscar todos los correos en la carpeta seleccionada
    status, data = mail.search(None, 'ALL')

    # Obtener los IDs de los correos
    email_ids = data[0].split()
    emails = []

    for email_id in email_ids:
        # Obtener el correo por ID
        status, data = mail.fetch(email_id, '(RFC822)')
        msg = email.message_from_bytes(data[0][1])
        
        # Extraer información del correo
        email_subject = msg['subject']
        email_from = msg['from']
        email_body = msg.get_payload(decode=True).decode()

        emails.append({
            "subject": email_subject,
            "from": email_from,
            "body": email_body
        })

    mail.logout()
    return emails

