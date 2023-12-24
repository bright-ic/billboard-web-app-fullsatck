import _ from "lodash";
import BaseService from "./base";
import errorMessages from "../lib/error-messages";
import validatePost from "../lib/validate";
import { MeterValidationResponseDataType, ValidateMeterPayloadType, ValidateMeterRequestDataType, PurchasePowerPayloadType, ObjectType } from "../types";
import {BILLBOARD_API_KEY, FLW_PUBLIC_KEY, FLW_SECRET_KEY, PAYMENT_PROVIDER_FLUTTERWAVE, STATUS_FAILED, STATUS_PAYMENT_FAILED_VERIFICATION, STATUS_SUCCESS, TRANSACTION_STATUS_INITIALIZED } from "../lib/contants";
import APIRequest from "../api/api-request";
import { ROUTE_API_GET_DISCOS, ROUTE_API_VALIDATE_METER, ROUTE_PAYMENT_COMPLATE_CALLBACK_URL, ROUTE_TRANSACTION_RECEIPT } from "../lib/route-constants";
import { isObject } from "../lib/utils";
import TransactionsModel from "../models/transactions";
import Flutterwave from 'flutterwave-node-v3';
import PaymentsModel from "../models/payments";
const flw = new Flutterwave(FLW_PUBLIC_KEY, FLW_SECRET_KEY);

class TransactionService extends BaseService {

    async validateAndInitializePayment(data:ValidateMeterRequestDataType) {
        try {
            if(!isObject(data)) {
               return BaseService.sendFailedResponse(errorMessages.missing_params);
            }
            const validate_messages = {
                'required': ':attribute is required',
                'string': ':attribute must be a string',
            }
            const validate_rules: ObjectType = {
                'disco': 'string|required',
                'meter_number': 'string|required',
                'account_type': 'string|required',
                'customer_email': 'string|required|email',
                'customer_phone_number': 'string|required|valid_phone',
                'amount': 'required',
                'transaction_reference': 'string|required'
            }
            if(_.has(data, 'disco') && _.toLower(_.toString(data.disco)) === "phed") {
                validate_rules.customer_number = 'string|required';
                validate_rules.customer_name = 'string|required';
            }
            const validated_post = await validatePost(data, validate_rules, validate_messages);
            if(!validated_post.success) {
                return BaseService.sendFailedResponse(validated_post.data);
            }

            const powerPayload: PurchasePowerPayloadType = {
                disco: data.disco,
                customer_meter_number: data.meter_number,
                account_type: data.account_type,
                amount: data.amount,
                transaction_reference: data.transaction_reference || "",
                gift_email: data.customer_email,
                gift_phone_number: data.customer_phone_number
            }
            if(_.has(data, 'disco') && _.toLower(_.toString(data.disco)) === "phed") {
                powerPayload.customer_number = data.customer_number;
                powerPayload.customer_name = data.customer_name;
            }
            // Check if reference is still valid
            const transaction_model = new TransactionsModel();
            const ref_exist = await transaction_model.findOne({transaction_reference: powerPayload.transaction_reference});
            if(ref_exist && !_.isEmpty(ref_exist['_id'])) {
                // generate new reference number
                powerPayload.transaction_reference = await transaction_model.generateReference();
            }

            // Todo: generate payment link
            const payment_details = {
                tx_ref: powerPayload.transaction_reference,
                amount: parseFloat(_.toString(powerPayload.amount)),
                currency: 'NGN',
                redirect_url: ROUTE_PAYMENT_COMPLATE_CALLBACK_URL,
                customer: {
                    email: powerPayload.gift_email,
                    phonenumber: powerPayload.gift_phone_number
                },
                meta: {
                    ...powerPayload
                },
                customizations: {
                    title: "Billboard"
                }
            }
            const request_config = APIRequest.buildRequestConfig(FLW_SECRET_KEY);
            const payment_link_request_url = 'https://api.flutterwave.com/v3/payments';
            const payment_link_result = await APIRequest.post(payment_link_request_url, payment_details, request_config);
            console.log(payment_link_result.data);
            if(!payment_link_result.success) {
                return BaseService.sendFailedResponse({error: 'Sorry something went wrong while trying to initialize your payment process'})
            }
            const payment_link:string = payment_link_result.data?.data?.link || "";
            if(_.isEmpty(payment_link)) {
                return BaseService.sendFailedResponse({error: 'Sorry something went wrong while trying to initialize your payment process'});
            }

            // TODO: add powerPayload to transaction record and set status to initiated
            const add_transaction_doc = {
                ...powerPayload,
                status: TRANSACTION_STATUS_INITIALIZED
            };
            const insert_result = await transaction_model.insertOne(add_transaction_doc);
            if(!insert_result || !_.has(insert_result, "_id")) {
                return BaseService.sendFailedResponse({error: 'Sorry something went wrong while trying to initialize your payment process'});
            }

            return BaseService.sendSuccessResponse({...powerPayload, payment_link});

        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }

    async verifyPayment(data:ObjectType, payment_provider:string=PAYMENT_PROVIDER_FLUTTERWAVE) {
        try {
            if(data && data.tx_ref) {
                let verified_payment:boolean = false;
                const payment_model = new PaymentsModel();
                const transaction_model = new TransactionsModel();
                const transactionDetails = await transaction_model.findOne({transaction_reference: data.tx_ref});
                const existing_payment_record = await payment_model.findOne({transaction_reference: data.tx_ref});
                const response = await flw.Transaction.verify({id: data.transaction_id});
                if (
                    response.data.status === "successful"
                    && response.data.amount === transactionDetails.amount
                    && response.data.currency === "NGN"
                ) {
                    // Success! Confirm the customer's payment
                    verified_payment = true;
                }

                let payment_data: ObjectType = {};
                // record payment
                if(!(existing_payment_record && _.has(existing_payment_record,'_id'))) {
                    payment_data = {
                        transaction_reference: data.tx_ref,
                        transaction_id: data.transaction_id || "",
                        amount: transactionDetails.amount,
                        paid_amount: response?.data?.amount || 0,
                        currency: response?.data?.currency || "",
                        payment_provider_status: response?.data?.status || data.status || "",
                        customer_email: transactionDetails.gift_email || "",
                        customer_phone_number: transactionDetails.gift_phone_number || "",
                        payment_provider,
                        raw: transactionDetails
                    };
                }
                if(verified_payment) {
                    payment_data.status = STATUS_SUCCESS;
                } else {
                    payment_data.status = existing_payment_record && existing_payment_record.status ? existing_payment_record.status : STATUS_PAYMENT_FAILED_VERIFICATION;
                }
                let payment_insert_result:any;
                if(existing_payment_record && _.has(existing_payment_record,'_id')) {
                    payment_insert_result = await payment_model.updateOne({_id: TransactionsModel.toObjectId(_.toString(existing_payment_record._id))}, payment_data);
                    payment_insert_result = {_id: _.toString(existing_payment_record._id)};
                } else {
                    payment_insert_result = await payment_model.insertOne(payment_data);
                }
            
                if(transactionDetails && transactionDetails._id) {
                    const update_doc:ObjectType = {
                        payment_status: payment_data.status
                    }
                    if(verified_payment && payment_insert_result && _.has(payment_insert_result, '_id')) {
                        update_doc.payment_id =  payment_insert_result['_id'];
                    }
                    transaction_model.updateOne({_id: TransactionsModel.toObjectId(_.toString(transactionDetails._id))}, update_doc).then().catch();
                }
                
                if(!verified_payment) {
                    return BaseService.sendFailedResponse({
                        verified_payment,
                        message: "We are unable to verify your payment at the moment. If Your payment is not reversed within 30mins, please contact us."
                    });
                }
                return BaseService.sendSuccessResponse(verified_payment);
            }
            return BaseService.sendFailedResponse({message: 'Required param "tx_ref" missing in request data'})
            
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }

    async getRecordByTransactionRef(trans_ref: string) {
        try {
            if(_.isEmpty(trans_ref) || !_.isString(trans_ref)) {
                return BaseService.sendFailedResponse({transaction_reference: "Transaction refrennce required"});
            }
            const transaction_model = new TransactionsModel();
            let record = await transaction_model.findOne({transaction_reference: trans_ref});
            if(!_.has(record, "_id")) {
                record = null;
            }
            return BaseService.sendSuccessResponse(record);
        } catch(e) {
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }
}

export default TransactionService;