import _ from "lodash";
import BaseService from "./base";
import errorMessages from "../lib/error-messages";
import validatePost from "../lib/validate";
import { MeterValidationResponseDataType, ValidateMeterPayloadType, ValidateMeterRequestDataType, PurchasePowerPayloadType, ObjectType } from "../types";
import {BILLBOARD_API_KEY, FLW_SECRET_KEY, STATUS_SUCCESS, TRANSACTION_STATUS_FAILED, TRANSACTION_STATUS_INITIALIZED, TRANSACTION_STATUS_PROVIDER_ERROR, TRANSACTION_STATUS_SUCCESS, TRANSACTION_STATUS_TOKEN_GENERATION_FAILED, TRANSACTION_STATUS_TOKEN_GENERATION_PENDING } from "../lib/contants";
import APIRequest from "../api/api-request";
import { ROUTE_API_ELECTRICITY_PURCHASE, ROUTE_API_GET_DISCOS, ROUTE_API_VALIDATE_METER, ROUTE_PAYMENT_COMPLATE_CALLBACK_URL, ROUTE_TRANSACTION_RECEIPT } from "../lib/route-constants";
import { isObject } from "../lib/utils";
import TransactionsModel from "../models/transactions";
import { empty } from "../lib/utility_js";

class ElectricityService extends BaseService {

    async getDiscos() {
        try {
            const request_config = APIRequest.buildRequestConfig(BILLBOARD_API_KEY);
            const {success, data: response_data}  = await APIRequest.get(ROUTE_API_GET_DISCOS, request_config);
            if(!success) {
                return BaseService.sendFailedResponse(response_data?response_data: {discos: 'Sorry, we could not fetch all supported discos due to something that went wrong. Please try again later'});
            }
            return BaseService.sendSuccessResponse(response_data.data || []);
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }

    async validateMeter(data:ValidateMeterRequestDataType) {
        try {
            if(!isObject(data)) {
               return BaseService.sendFailedResponse(errorMessages.missing_params);
            }
            const validate_messages = {
                'required': ':attribute is required',
                'string': ':attribute must be a string',
            }
            const validate_rules = {
                'disco': 'string|required',
                'meter_number': 'string|required',
                'account_type': 'string|required',
                'customer_email': 'string|required|email',
                'customer_phone_number': 'string|required|valid_phone',
                'amount': 'required'
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
            const request_config = APIRequest.buildRequestConfig(BILLBOARD_API_KEY);
            const {success: response_succes, data: response_result}  = await APIRequest.post(ROUTE_API_VALIDATE_METER, payload, request_config);
            let {success, data: response_data} = response_result;
            success = typeof success !== "boolean" ? response_succes : success;
            response_data = typeof response_data !== "object" ? response_result : response_data;
            if(typeof response_data.success === "boolean" && !response_data.success) {
                return BaseService.sendFailedResponse(response_data.errors?response_data.errors: {discos: 'Sorry, we could not validate your meter details due to something that went wrong. Please try again later'});
            } else if(!success) {
                return BaseService.sendFailedResponse(response_data?response_data : {discos: 'Sorry, we could not validate your meter details due to something that went wrong. Please try again later'});
            }
            const validated_meter: MeterValidationResponseDataType = response_data.data || response_data;
            if(validated_meter.minimumAmount && parseFloat(_.toString(validated_meter.minimumAmount)) > parseFloat(_.toString(data.amount))) {
                return BaseService.sendFailedResponse({amount: `The minimum allowed amount is NGN ${validated_meter.minimumAmount}`})
            }

            return BaseService.sendSuccessResponse(validated_meter);

        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }

    async vendPower(data:PurchasePowerPayloadType) {
        try {
            if(_.isEmpty(data) || !isObject(data)) {
                return BaseService.sendFailedResponse({payload: 'Missing required param in request'});
            }

            const validate_messages = {
                'required': ':attribute is required'
            }
            const validate_rules: ObjectType = {
                disco: 'no_html|string|required',
                customer_meter_number: 'no_html|string|required', 
                account_type: 'no_html|string|required',
                amount: 'no_html|required',
                transaction_reference: 'no_html|string|required',
                gift_email: 'no_html|string|required',
                gift_phone_number: 'no_html|string|required'
            }
            if(_.has(data, 'disco') && _.toLower(_.toString(data.disco)) === "phed") {
                validate_rules.customer_number = 'string|required';
                validate_rules.customer_name = 'string|required';
            }
            const validated_post = await validatePost(data, validate_rules, validate_messages);
            if(!validated_post.success) {
                return BaseService.sendFailedResponse(validated_post.data);
            }

            const transaction_model = new TransactionsModel();
            const transactionDetails = await transaction_model.findOne({transaction_reference: data.transaction_reference});
            if(!transactionDetails || !transactionDetails._id) {
                return BaseService.sendFailedResponse({transaction: "Sorry, we could not process your request at this moment, it looks like you skipped the payment process."});
            }

            const payload: PurchasePowerPayloadType = {
                disco: data.disco,
                customer_meter_number: data.customer_meter_number,
                account_type: data.account_type,
                amount: _.toString(data.amount),
                transaction_reference: data.transaction_reference,
                gift_email: data.gift_email,
                gift_phone_number: data.gift_phone_number
            }
            if(data.disco.toString().indexOf('phed') > -1) {
                payload.customer_number = data.customer_number;
                payload.customer_name = data.customer_name;
            }
            const request_config = APIRequest.buildRequestConfig(BILLBOARD_API_KEY);
            const {success: response_succes, data: response_result}  = await APIRequest.post(ROUTE_API_ELECTRICITY_PURCHASE, payload, request_config);
            let {success, data: response_data} = response_result;
            success = typeof success !== "boolean" ? response_succes : success;
            response_data = typeof response_data !== "object" ? response_result : response_data;
            if(!success) {
                // Update transaction status to TRANSACTION_STATUS_FAILED so that the vending can be done at another time
                if(transactionDetails && transactionDetails._id) {
                    const update_doc:ObjectType = {
                        status: TRANSACTION_STATUS_FAILED
                    }
                    
                    transaction_model.updateOne({_id: TransactionsModel.toObjectId(_.toString(transactionDetails._id))}, update_doc).then().catch();
                }
                return BaseService.sendFailedResponse(response_data?response_data: {discos: 'Sorry, we could not generate your token due to something that went wrong. Please try again later'});
            }
            // Process returned data and update the transctions record accordingly and return the appropriate response
            let new_transaction_status = TRANSACTION_STATUS_SUCCESS;
            if(_.has(response_data, "token") && _.has(response_data, "energy_arears_amount") && empty(response_data.token) && !empty(response_data.energy_arears_amount)) {
                // This means users payment was used to service arears instead of vending
                new_transaction_status = TRANSACTION_STATUS_SUCCESS;
            } else if(_.has(response_data, "token") && empty(response_data.token)) {
                // This means token generation is pending
                new_transaction_status = TRANSACTION_STATUS_TOKEN_GENERATION_PENDING;
            } else if(!_.has(response_data, "token")) {
                // This means token generation failed
                new_transaction_status = TRANSACTION_STATUS_TOKEN_GENERATION_FAILED;
            }

            const update_doc:ObjectType = {
                vend_details: {...response_data, status: new_transaction_status},
                status: new_transaction_status
            }
            
            transaction_model.updateOne({_id: TransactionsModel.toObjectId(_.toString(transactionDetails._id))}, update_doc).then().catch();
            return BaseService.sendSuccessResponse({...response_data, status: new_transaction_status});
        }catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }

    async requery(transaction_reference: string) {
        try {
            if(empty(transaction_reference) || !_.isString(transaction_reference)) {
                return BaseService.sendFailedResponse({ref: 'Transaction reference is required'});
            }
            const transaction_model = new TransactionsModel();
            const transactionDetails = await transaction_model.findOne({transaction_reference: transaction_reference});
            if(!transactionDetails || !transactionDetails._id) {
                return BaseService.sendFailedResponse({transaction: `Electricity transaction with transaction ref (${transaction_reference}) was not found`});
            }
            if(!transactionDetails.disco) {
                return BaseService.sendFailedResponse({transaction: `Sorry, an unforseen error occurred. If error persists, pkease contact us.`});
            }
            // make an api call for requery
            const request_config = APIRequest.buildRequestConfig(BILLBOARD_API_KEY);
            let url = ROUTE_API_ELECTRICITY_PURCHASE+`transaction_reference=${transaction_reference}&disco=${transactionDetails.disco}`;
            const {success: response_succes, data: response_result}  = await APIRequest.get(url, request_config);
            let {success, data: response_data} = response_result;
            success = typeof success !== "boolean" ? response_succes : success;
            response_data = typeof response_data !== "object" ? response_result : response_data;
            if(!success) {
                return BaseService.sendFailedResponse(response_data?response_data: {discos: 'Sorry, we could not fetch your token due to something that went wrong. Please try again later'});
            }
            let new_transaction_status = TRANSACTION_STATUS_SUCCESS;
            if(_.has(response_data, "token") && _.has(response_data, "energy_arears_amount") && empty(response_data.token) && !empty(response_data.energy_arears_amount)) {
                // This means users payment was used to service arears instead of vending
                new_transaction_status = TRANSACTION_STATUS_SUCCESS;
            } else if(_.has(response_data, "token") && empty(response_data.token)) {
                // This means token generation is pending
                new_transaction_status = TRANSACTION_STATUS_TOKEN_GENERATION_PENDING;
            } else if(!_.has(response_data, "token")) {
                // This means token generation failed
                new_transaction_status = TRANSACTION_STATUS_TOKEN_GENERATION_FAILED;
            }

            const existing_vend_details = !empty(transactionDetails.vend_details) ? {...transactionDetails.vend_details} : {};
            const update_doc:ObjectType = {
                vend_details: {...existing_vend_details, ...response_data}
            }
            if(empty(transactionDetails.status) || transactionDetails.status !== TRANSACTION_STATUS_SUCCESS) {
                update_doc.status = new_transaction_status;
                update_doc.vend_details.status = new_transaction_status;
            }
            
            transaction_model.updateOne({_id: TransactionsModel.toObjectId(_.toString(transactionDetails._id))}, update_doc).then().catch();
            return BaseService.sendSuccessResponse({...response_data, status: new_transaction_status});

        }catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }
}

export default ElectricityService;