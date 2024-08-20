from sqlalchemy import Column, Integer, String, Float
from config.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference_code = Column(String(255), index=True, unique=True)
    description = Column(String(255))
    currency = Column(String(255))
    amount = Column(Float)
    tax = Column(Float)
    tax_return_base = Column(Float)
    signature = Column(String(255))
    buyer_email = Column(String(255))
    telephone = Column(String(255))
    buyer_full_name = Column(String(255))
    payer_email = Column(String(255))
    payer_phone = Column(String(255))
    payer_full_name = Column(String(255))
    payer_document = Column(String(255))
    payer_document_type = Column(String(255))
    payment_methods = Column(String(255))
    pse_banks = Column(String(255))
