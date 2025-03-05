from datetime import datetime, timedelta, timezone
import hashlib

def generate_signature(reference, amount, currency, secret_key):
    signature_concact = f"{reference}{amount}{currency}{secret_key}"

    # Generar el hash SHA-256
    m = hashlib.sha256()
    m.update(signature_concact.encode('utf-8'))  
    return m.hexdigest()