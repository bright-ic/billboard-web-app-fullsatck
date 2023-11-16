
export const DATABASE = process.env.DATABASE || '';

export const COLLECTION_USERS = 'users';
export const COLLECTION_API_TOKENS = 'api_tokens';
export const COLLECTION_PAYMENTS = 'payments';
export const COLLECTION_TRANSACTIONS = 'transactions';


export const IS_LIVE = process.env.NODE_ENV && process.env.NODE_ENV === "production";
export const IS_LOCAL = process.env.NODE_ENV && process.env.NODE_ENV === "local";
export const IS_DEV = process.env.NODE_ENV && process.env.NODE_ENV !== "production";

export const MAILGUN_API_KEY:string = process.env.MAILGUN_API_KEY || "";
export const MAILGUN_URL:string = process.env.MAILGUN_URL || "api.mailgun.net";
export const MAILGUN_DOMAIN:string = process.env.MAILGUN_DOMAIN || "";


export const ELECTRICITY_MINIMUM_VENDING_AMOUNT = 500;

// API PROVIDERS
export const API_PROVIDER_API_BASE_URL_LIVE = process.env.API_PROVIDER_FELA_MP_API_BASE_URL_LIVE || '';
export const API_PROVIDER_API_BASE_URL_STAGING = process.env.API_PROVIDER_FELA_MP_API_BASE_URL_STAGING || '';

export const API_PROVIDER_FELA_MP = process.env.API_PROVIDER_FELA_MP || '';
export const FELA_MP_API_STAGING_AUTH_TOKEN = process.env.FELA_MP_API_STAGING_AUTH_TOKEN || '';
export const FELA_MP_MERCHANT_ID =  process.env.FELA_MP_MERCHANT_ID || '';
export const FELA_MP_MERCHANT_PASSWORD = process.env.FELA_MP_MERCHANT_PASSWORD || '';

export const REDIS_URL:string = process.env.REDIS_URL || '';
export const REDIS_KEY_API_TOKEN = "valid_api_tokens";
export const REDIS_KEY_FELA_MP_API_TOKEN_FIELD_NAME = "fela_mp_active_api_token";

export const TRANSACTION_STATUS_INITIALIZED = 'INITIALIZED';
export const TRANSACTION_STATUS_PAYMENT_CONFIRMATION_FAILED = 'PAYMENT-CONFIRMATION-FAILED';
export const TRANSACTION_STATUS_PAYMENT_CONFIRMATION_SUCCEEDED = 'PAYMENT-CONFIRMED-SUCCEEDED';
export const TRANSACTION_STATUS_TOKEN_GENERATION_FAILED = 'TOKEN-GENERATION-FAILED';
export const TRANSACTION_STATUS_TOKEN_GENERATION_PENDING = 'TOKEN-GENERATION-PENDING';
export const TRANSACTION_STATUS_PROVIDER_ERROR = 'PROVIDER-ERROR';
export const TRANSACTION_STATUS_SUCCESS = 'SUCCESS';
export const TRANSACTION_STATUS_FAILED = 'FAILED';