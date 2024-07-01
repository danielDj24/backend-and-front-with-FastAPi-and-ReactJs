from config.database import localsession


"""inicio de sesion a la base de datos"""

def GetDB():
    db = localsession()
    try:
        yield db    
    finally:
        db.close()