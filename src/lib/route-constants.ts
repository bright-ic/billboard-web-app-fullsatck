import { BILLBOARD_API_BASE_DOMAIN } from "./contants";

export const ROUTE_HOME = '/';
export const ROUTE_TRANSACTION_RECEIPT = '/transaction/receipt';
export const ROUTE_PAYMENT_COMPLATE_CALLBACK_URL = '/transaction/payment-complete';
export const ROUTE_ELECTRICITY_VALIDATE_METER= '/electricity/validate-meter';

// API ROUTES
export const API_VERSION = '/api/v1';
export const ROUTE_API_GET_DISCOS = `${BILLBOARD_API_BASE_DOMAIN}${API_VERSION}/electricity/get-discos`;
export const ROUTE_API_VALIDATE_METER = `${BILLBOARD_API_BASE_DOMAIN}${API_VERSION}/electricity/get-meter`;
export const ROUTE_API_ELECTRICITY_PURCHASE = `${BILLBOARD_API_BASE_DOMAIN}${API_VERSION}/electricity/purchase`;
export const ROUTE_API_ELECTRICITY_PURCHASE_REQUERY = `${BILLBOARD_API_BASE_DOMAIN}${API_VERSION}/electricity/get-purchase-transaction`;