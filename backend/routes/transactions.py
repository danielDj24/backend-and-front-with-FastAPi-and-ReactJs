from fastapi import APIRouter, HTTPException,Depends
from config.pays import *
from schemas.transactions import TransactionDataResponse, TransactionCreateData
from utils.functions_payu import encode_signature, save_transaction_data, get_transaction_data
from services.dbconnection import GetDB
from sqlalchemy.orm import session
import httpx

transactions_routes = APIRouter()

@transactions_routes.post("/payu/transaction/")
async def create_transaction(transaction: TransactionCreateData, db :session = Depends(GetDB)):
    try:
        transaction_id = save_transaction_data(transaction, db)
        
        # Obtén los datos de la transacción
        transaction_data = get_transaction_data(transaction_id, db)
        
        # Calcula la firma usando los datos de la transacción
        signature = encode_signature(transaction_data)

        payload = {
            "merchantId": payu_merchant_id,
            "referenceCode": transaction.reference_code,
            "accountId": payu_account_id,
            "description": transaction.description,
            "currency": transaction.currency,
            "amount": transaction.amount,
            "tax": transaction.tax,
            "taxReturnBase": transaction.tax_return_base,
            "signature": signature,
            "buyerEmail": transaction.buyer_email,
            "telephone": transaction.telephone,
            "buyerFullName": transaction.buyer_full_name,
            "payerEmail": transaction.payer_email,
            "payerPhone": transaction.payer_phone,
            "payerFullName": transaction.payer_full_name,
            "payerDocument": transaction.payer_document,
            "payerDocumentType": transaction.payer_document_type,
            "paymentMethods": transaction.payment_methods,
            "pseBanks": transaction.pse_banks
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(payu_testing_url, data=payload)
        try:
            response_data = response.json()
        except ValueError:
            response_data = {}
        print("PayU Response JSON:", response_data)
        
        # Verifica la respuesta de PayU
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Error processing transaction with PayU")

        return {"message": "Transaction created and sent to PayU", "payload": payload, "transaction_id": transaction_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
