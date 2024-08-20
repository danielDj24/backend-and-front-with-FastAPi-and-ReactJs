import hashlib
from fastapi import HTTPException,Depends
from config.pays import *
from schemas.transactions import Transaction, TransactionCreateData
from models.transactions import Transaction 
from services.dbconnection import GetDB
from sqlalchemy.orm import session


def save_transaction_data(transaction: TransactionCreateData, db: session) -> int:
    db_transaction = Transaction(
        reference_code=transaction.reference_code,
        description=transaction.description,
        currency=transaction.currency,
        amount=transaction.amount,
        tax=transaction.tax,
        tax_return_base=transaction.tax_return_base,
        signature=transaction.signature,
        buyer_email=transaction.buyer_email,
        telephone=transaction.telephone,
        buyer_full_name=transaction.buyer_full_name,
        payer_email=transaction.payer_email,
        payer_phone=transaction.payer_phone,
        payer_full_name=transaction.payer_full_name,
        payer_document=transaction.payer_document,
        payer_document_type=transaction.payer_document_type,
        payment_methods=transaction.payment_methods,
        pse_banks=transaction.pse_banks
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction.id

def get_transaction_data(transaction_id: int, db: session) -> Transaction:
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()

def encode_signature(transaction_data) -> str:
    api_key = payu_api_key
    merchant_id = payu_merchant_id
    reference_code = transaction_data.reference_code
    currency = transaction_data.currency
    amount = transaction_data.amount
    pay_methods = transaction_data.payment_methods  
    pse_banks = transaction_data.pse_banks
    
    signature_string = f"{api_key}~{merchant_id}~{reference_code}~{amount}~{currency}~{pay_methods}~{pse_banks}"
    signature = hashlib.md5(signature_string.encode('utf-8')).hexdigest()
    
    return signature