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

class PaymentService extends BaseService {

    async getRecordByTransactionRef(trans_ref: string) {
        try {
            if(_.isEmpty(trans_ref) || !_.isString(trans_ref)) {
                return BaseService.sendFailedResponse({transaction_reference: "Transaction refrennce required"});
            }
            const payment_model = new PaymentsModel();
            let record = await payment_model.findOne({transaction_reference: trans_ref});
            if(!_.has(record, "_id")) {
                record = null;
            }
            return BaseService.sendSuccessResponse(record);
        } catch(e) {
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }
}

export default PaymentService;