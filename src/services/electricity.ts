import _, { isObject, result } from "lodash";
import BaseService from "./base";
import { Request } from 'express';
import {
    REDIS_URL, API_PROVIDER_FELA_MP, REDIS_KEY_API_TOKEN, REDIS_KEY_FELA_MP_API_TOKEN_FIELD_NAME,
    IS_DEV,
    ELECTRICITY_MINIMUM_VENDING_AMOUNT,
    FELA_MP_MERCHANT_ID
} from "../lib/contants";
import FelaMP from "../api/fela-mp-api";
import TokenHandler from "./token-handler";
import errorMessages from "../lib/error-messages";
import { PromiseServiceResponse, DiscoType, ObjectType, SupportedMeterTypes, RequestHeaderConfigType, ValidateMeterPayloadType, MeterValidationResponseDataType, PurchasePowerPayloadType, PurchasePowerResponseDataType, EnergyArearsType } from "../types";
import validatePost from "../lib/validate";
import TransactionsModel from "../models/transactions";

/**
 * Handles Electricty Purchase and everything relating to it
 */
class ElectricityService extends BaseService {

    static api_provider_service: FelaMP;
    static token_handler: TokenHandler;

    constructor(req?: Request | null) {
        super(req);
        if(!ElectricityService.api_provider_service)  {
            ElectricityService.api_provider_service = new FelaMP();
        }
        if(!ElectricityService.token_handler)  {
            ElectricityService.token_handler = new TokenHandler();
        }
    }

    /**
     * Method that fetches all supported electricity discos
     *
     * @return {PromiseServiceResponse} - {success: boolean, data: any}
     * @memberof ElectricityService
     */
    async getDiscos(): PromiseServiceResponse {
        try {
            const api_token: string | null = await ElectricityService.token_handler.getApiToken(API_PROVIDER_FELA_MP);
            if(!api_token || api_token.trim() === "") {
                return BaseService.sendFailedResponse({token: 'Sorry, we could not fetch all supported discos due to authentication issues that occurred. Please try again later'})
            }
            const {success, data} = await ElectricityService.api_provider_service.getDiscos(api_token);
            if(!success) {
                return BaseService.sendFailedResponse(data?data: {discos: 'Sorry, we could not fetch all supported discos due to something that went wrong. Please try again later'});
            }
            return BaseService.sendSuccessResponse(data);
        } catch(e) {
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }

    /**
     * Fetch meter details or validate meter number
     *
     * @param {ValidateMeterPayloadType} data - Represents payload data
     * @return {object} {success: boolean, data: any} 
     * @memberof ElectricityService
     */
    async getMeterDetail(data: ValidateMeterPayloadType, internal_app_data:ObjectType={}): PromiseServiceResponse {
        try {
            if(!isObject(data)) {
               return BaseService.sendFailedResponse({payload: 'Missing required param in request'});
            }
            const api_token: string | null = await ElectricityService.token_handler.getApiToken(API_PROVIDER_FELA_MP);
            if(!api_token || api_token.trim() === "") {
                return BaseService.sendFailedResponse({token: 'Sorry, we could not fetch all supported discos due to authentication issues that occurred. Please try again later'})
            }
            const validate_messages = {
                'required': ':attribute is required',
                'string': ':attribute must be a string',
            }
            const validate_rules = {
                'disco': 'string|required',
                'meter_number': 'string|required',
                'account_type': 'string|required'
            }
            const validated_post = await validatePost(data, validate_rules, validate_messages);
            if(!validated_post.success) {
                return BaseService.sendFailedResponse(validated_post.data);
            }

            const payload: ValidateMeterPayloadType = {
                disco: data.disco,
                meter_number: data.meter_number,
                account_type: data.account_type
            }
            const {success, data: response_data}  = await ElectricityService.api_provider_service.getMeterDetails(payload, api_token);
            if(!success) {
                return BaseService.sendFailedResponse(response_data?response_data: {discos: 'Sorry, we could not fetch meter details due to something that went wrong. Please try again later'});
            }
            const validated_meter: MeterValidationResponseDataType = response_data;
            if(!(_.has(validated_meter,'minimumAmount') && parseFloat(_.toString(validated_meter.minimumAmount)) >= ELECTRICITY_MINIMUM_VENDING_AMOUNT)) {
                validated_meter.minimumAmount = ELECTRICITY_MINIMUM_VENDING_AMOUNT;
            }

            /*
            * For our internal vending applications (web | mobile)
            */
            if(!_.isEmpty(internal_app_data) && isObject(internal_app_data)) {
                if(internal_app_data.generate_reference) {
                    const transactionModel = new TransactionsModel();
                    validated_meter.transaction_reference = transactionModel.generateReference(true, payload);
                }
            }
            return BaseService.sendSuccessResponse(validated_meter);

        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    /**
     * Pay for power and generate electricity token
     *
     * @param {PurchasePowerPayloadType} data - Represents payload data
     * @return {*} 
     * @memberof ElectricityService
     */
    async purchasePower(data:PurchasePowerPayloadType): PromiseServiceResponse {
        try {
            if(_.isEmpty(data) || !isObject(data)) {
                return BaseService.sendFailedResponse({payload: 'Missing required param in request'});
            }
            if(_.isEmpty(FELA_MP_MERCHANT_ID) || !_.isString(FELA_MP_MERCHANT_ID)) {
                return BaseService.sendFailedResponse({error: 'Sorry, we could not process your request due to invalid configuration'});
            }
            const api_token: string | null = await ElectricityService.token_handler.getApiToken(API_PROVIDER_FELA_MP);
            if(!api_token || api_token.trim() === "") {
                return BaseService.sendFailedResponse({token: 'Sorry, we could not fetch all supported discos due to authentication issues that occurred. Please try again later'})
            }
            if(_.has(data, "amount") && typeof data.amount === "string") {
                data.amount = parseFloat(data.amount);
            }

            const validate_messages = {
                'required': ':attribute is required'
            }
            const validate_rules: ObjectType = {
                disco: 'no_html|string|required',
                customer_meter_number: 'no_html|string|required', 
                account_type: 'no_html|string|required',
                amount: 'no_html|required',
                transaction_reference: 'no_html|string|required'
            }
            if(_.has(data, 'gift_phone_number')) {
                validate_rules.gift_phone_number = 'string';
            }
            const validated_post = await validatePost(data, validate_rules, validate_messages);
            if(!validated_post.success) {
                return BaseService.sendFailedResponse(validated_post.data);
            }
            if(parseFloat(_.toString(data.amount)) < ELECTRICITY_MINIMUM_VENDING_AMOUNT) {
                return BaseService.sendFailedResponse({amount: 'The Amount must be at least NGN '+ELECTRICITY_MINIMUM_VENDING_AMOUNT});
            }

            const payload: PurchasePowerPayloadType = {
                disco: data.disco,
                customer_meter_number: data.customer_meter_number,
                account_type: data.account_type,
                merchant_id: FELA_MP_MERCHANT_ID,
                amount: _.toString(data.amount),
                transaction_reference: data.transaction_reference
            }
            if(_.has(data, "gift_phone_number")) {
                payload.gift_phone_number = data.gift_phone_number;
            }
            const {success, data: response_data}  = await ElectricityService.api_provider_service.purchasePower(payload, api_token);
            if(!success) {
                return BaseService.sendFailedResponse(response_data?response_data: {discos: 'Sorry, we could not process your request to purchase electricty/power due to something that went wrong. Please try again later'});
            }
            const purchased_power_data: PurchasePowerResponseDataType = this.prepareElectricityPurchasedData(response_data, payload);
            
            return BaseService.sendSuccessResponse(purchased_power_data);
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    /**
     * Refetch token | requery
     * Retry to fetch token or records of previous electricity purchase transaction
     *
     * @param {string} transaction_reference - Represents the transaction reference number/id
     * @return {*} 
     * @memberof ElectricityService
     */
    async getPurchaseTransaction(transaction_reference:string): PromiseServiceResponse {
        try {
            if(_.isEmpty(transaction_reference) || !_.isString(transaction_reference)) {
                return BaseService.sendFailedResponse({transaction_reference:`Missing or invalid required param transaction id/reference `});
            }

            const api_token: string | null = await ElectricityService.token_handler.getApiToken(API_PROVIDER_FELA_MP);
            if(!api_token || api_token.trim() === "") {
                return BaseService.sendFailedResponse({token: 'Sorry, we could not fetch all supported discos due to authentication issues that occurred. Please try again later'})
            }

            const {success, data: response_data}  = await ElectricityService.api_provider_service.getTransactionDetail(transaction_reference, api_token);
            if(!success) {
                return BaseService.sendFailedResponse(response_data?response_data: {discos: 'Sorry, we could not process your request to fetch transaction detail due to something that went wrong. Please try again later'});
            }

            const purchased_power_data: PurchasePowerResponseDataType = this.prepareElectricityPurchasedData(response_data, {});
            
            return BaseService.sendSuccessResponse(purchased_power_data);
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    prepareElectricityPurchasedData(data:PurchasePowerResponseDataType, payload: PurchasePowerPayloadType|ObjectType): PurchasePowerResponseDataType {
        const returned_data: PurchasePowerResponseDataType = {
            meter_no: data.meter_no || "",
            receipt_no: data.receipt_no || "", 
            payment_datetime: data.payment_datetime || "",
            amount: data.amount || "",
            energy_value_amount: data.energy_value_amount || "",
            energy_value: data.energy_value || "",
            token: data.token || "",
            reward_token: data.reward_token || "",
            energy_units: data.energy_units || "",
            tariff: data.tariff || "",
            transactionReference: data.transactionReference || "",
            vat: data.vat || "",
            account_type: data.account_type || payload.account_type,
            actual_vend_amount: payload.amount, // this is the actual amount user wants to vend before vat and other deductions
            customer_name: data.name || "",
            custome_phone: data.customer_no || "",
            customer_adrress: data.address || "",
            gift_email: payload.gift_email || "",
            gift_phone: payload.gift_phone_number || "",
        };
        // For BEDC
        if(_.toUpper(payload.disco) === "BEDC" && data.raw) {
            returned_data.meter_no = data.raw.meter_no ? data.raw.meter_no : returned_data.meter_no;
            returned_data.receipt_no = data.raw.reciept_no ? data.raw.reciept_no : returned_data.reciept_no;
            returned_data.payment_datetime = data.raw.payment_datetime ? data.raw.payment_datetime : returned_data.payment_datetime;
            returned_data.amount = data.raw.amount ? data.raw.amount : returned_data.amount;
            returned_data.token = data.raw.token ? data.raw.token : returned_data.token;
            returned_data.reward_token = data.raw.reward_token ? data.raw.reward_token : returned_data.reward_token;
            returned_data.energy_units = data.raw.energy_units ? data.raw.energy_units : returned_data.energy_units;
            returned_data.tariff = data.raw.tariff ? data.raw.tariff : returned_data.tariff;
            returned_data.transaction_reference = data.raw.transaction_reference ? data.raw.transaction_reference : returned_data.transactionReference;
            returned_data.transactionReference = data.raw.transactionReference ? data.raw.transactionReference : returned_data.transactionReference;
            returned_data.vat = data.raw.vat ? data.raw.vat : returned_data.vat;
            returned_data.account_type = data.raw.account_type ? data.raw.account_type : returned_data.account_type;
            returned_data.custome_phone = data.raw.phone_number ? data.raw.phone_number : returned_data.custome_phone;
            returned_data.customer_adrress = data.raw.address ? data.raw.address : returned_data.address;
            returned_data.customer_name = data.raw.name ? data.raw.name : returned_data.customer_name;
            returned_data.raw = data.raw;
        }
        // For PHED
        if(_.toUpper(payload.disco) === "PHED") {
            returned_data.energy_value = data.energy_value ? data.energy_value : "";
            returned_data.energy_value_amount = data.energy_value_amount ? data.energy_value_amount : "";
            // Capture amount used to pay for arrears and energy value
            if(data.details && _.isArray(data.details))  {
                data.details.forEach((energy_detail:EnergyArearsType) => {
                    if(energy_detail.HEAD.toLowerCase().indexOf('arrears') > -1 && energy_detail.AMOUNT) {
                        returned_data.energy_arears_amount = energy_detail.AMOUNT;
                        returned_data.energy_arears_title= energy_detail.HEAD;
                    } else if(energy_detail.HEAD.toLowerCase().indexOf('energy value') > -1) {
                        returned_data.energy_value_amount = energy_detail.AMOUNT || returned_data.energy_value_amount;
                        returned_data.energy_value= energy_detail.HEAD;
                    }
                });
            }
        }

        return returned_data;

    }

}

export default ElectricityService;