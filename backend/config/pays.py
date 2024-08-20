import os
from dotenv import load_dotenv

load_dotenv()

#vars payu
payu_api_key = os.getenv("PAYU_API_KEY")
payu_login = os.getenv("PAYU_API_LOGIN")
payu_merchant_id = os.getenv("PAYU_MERCHANT_ID")
payu_account_id = os.getenv("PAYU_ACCOUNT_ID")
payu_testing_url = os.getenv("PAYU_TESTING_URL")
payu_production_url = os.getenv("PAYU_PRODUCTION_URL")