
export type StandardApiResponse = Promise<{success: boolean, data: any, raw?:any}>;
export type StandardApiResponseWithoutPromise = {success: boolean, data?: any, errors?: any, raw?:any};
export type StandardServiceResponse = (data: any) => {success: boolean, data: any};
export type PromiseServiceResponse = Promise<{success: boolean, data: any}>;
export type ObjectType = {
    [key: string]: any
}
export type SupportedMeterTypes = { code: string, title: string };
export type DiscoType = {
    disco: string,
    code: string,
    title: string,
    supported_meter_types: SupportedMeterTypes[],
    index: number
}
export type RequestHeaderConfigType = {
    headers: {
        Authorization?:string,
        [key:string]: any
    }
}
export type ValidateMeterPayloadType = {
    disco: string,
    account_type: string,
    meter_number: string
}
export type MeterValidationResponseDataType = {
    name: string,
    address: string,
    email: string,
    arrear?: string | number,
    metre_no?: string,
    bsc_name?: string,
    ibc_name?: string,
    cons_type?: string, 
    current_amount?: number | string,
    number?:string,
    phone?: string | null,
    tarrif_code?: string,
    total_bill?: string | number,
    phoneNumber: string,
    util: string,
    minimumAmount: number | string,
    [key: string]: any
}
export type PurchasePowerPayloadType = {
    disco: string,
    customer_meter_number: string, 
    account_type: string,
    merchant_id: string, 
    amount: number | string,
    transaction_reference: string,
    gift_phone_number?: string
    gift_email?: string
}
export type EnergyArearsType = {
    HEAD: string,
    AMOUNT: string | number
}
export type PurchasePowerResponseDataType = {
    meter_no: string,
    receipt_no: string, 
    payment_datetime: string,
    amount: number | string,
    token: string,
    reward_token: string,
    energy_units: string | number,
    tariff: string | number,
    transactionReference: string,
    //For BEDC
    raw?: {
        meter_no: string,
        payment_datetime: string,
        amount: string | number,
        token: string,
        reward_token: string,
        energy_units: string | number,
        transaction_reference: string,
        reciept_no: string,
        account_type: string,
        status: string,
        name: string,
        address: string,
        arrears: string | number,
        phone_number: string,
        tariff_index: string | number,
        tariff: number | string,
        kct1: any,
        kct2: any,
        vat: string | number,
        non_energy_charge: string | number,
        transactionReference: string,
        [key: string]: any
    },
    additional_meter_token?: string,
    message?: string,
    commissionInfo?: {
        merchant_id: string,
        vendAmount: number | string,
        service: string,
        service_provider: string,
        commissionRate: string | number,
        commissionGained: string | number,
        discountedAmount: string | number,
        [key: string]: any
    }
    // For PHED Accounts having Arrear only
    customer_no?: string,
    energy_value?: string,
    energy_value_amount?: string | number, 
    details?: EnergyArearsType[],
    transaction_reference?: string,

    // For Internal Use
    energy_arears_amount?: string | number,
    energy_arears_title?: string,
    customer_name?: string,
    custome_phone?: string,
    customer_adrress?: string,
    gift_email?: string,
    gift_phone?: string,
    actual_vend_amount?: string | number,
    vat?: string | number,

    [key: string]: any
}