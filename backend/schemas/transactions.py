from pydantic import BaseModel
from typing import List, Optional

class Transaction(BaseModel):
    reference_code: str
    description: str
    currency: str
    amount: float
    tax: float
    tax_return_base: float
    signature: Optional[str]
    buyer_email: str
    telephone: str
    buyer_full_name: str
    payer_email: str
    payer_phone: str
    payer_full_name: str
    payer_document: str
    payer_document_type: str
    payment_methods: str    
    pse_banks: str

class TransactionCreateData(Transaction):
    pass

class TransactionDataResponse(Transaction):
    id: int
    class Config:
        from_attributes  = True
    