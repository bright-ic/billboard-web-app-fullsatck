import { BILLBOARD_API_BASE_DOMAIN } from "./contants";

export const ROUTE_HOME = '/';
export const ROUTE_TRANSACTION_RECEIPT = '/transaction/receipt';

export const ROUTE_GET_ELECTRICITY_DISCOS = '/electricity/get-discos';
export const ROUTE_ELECTRICITY_METER_DETAIL = '/electricity/get-meter';
export const ROUTE_ELECTRICITY_PURCHASE = '/electricity/purchase';
export const ROUTE_ELECTRICITY_PURCHASE_TRANSACTION = '/electricity/purchase-transaction';

// API ROUTES
export const API_VERSION = '/api/v1';
export const ROUTE_API_GET_DISCOS = `${BILLBOARD_API_BASE_DOMAIN}${API_VERSION}/electricity/get-discos`;
export const ROUTE_API_VALIDATE_METER = `${BILLBOARD_API_BASE_DOMAIN}${API_VERSION}/electricity/get-meter`;
export const ROUTE_API_ELECTRICITY_PURCHASE = `${BILLBOARD_API_BASE_DOMAIN}${API_VERSION}/electricity/purchase`;
export const ROUTE_API_ELECTRICITY_PURCHASE_REQUERY = `${BILLBOARD_API_BASE_DOMAIN}${API_VERSION}/electricity/get-purchase-transaction`;