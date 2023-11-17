import _ from "lodash";
import BaseService from "./base";
import errorMessages from "../lib/error-messages";
import validatePost from "../lib/validate";
import { MeterValidationResponseDataType, ValidateMeterPayloadType, ValidateMeterRequestDataType } from "../types";
import {BILLBOARD_API_KEY } from "../lib/contants";
import APIRequest from "../api/api-request";
import { ROUTE_API_GET_DISCOS, ROUTE_API_VALIDATE_METER } from "../lib/route-constants";
import { isObject } from "../lib/utils";

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
            const {success, data: response_data}  = await APIRequest.post(ROUTE_API_VALIDATE_METER, payload, request_config);
            if(!success) {
                return BaseService.sendFailedResponse(response_data?response_data: {discos: 'Sorry, we could not validate your meter details due to something that went wrong. Please try again later'});
            }
            const validated_meter: MeterValidationResponseDataType = response_data;
            if(validated_meter.minimumAmount && parseFloat(_.toString(validated_meter.minimumAmount)) > parseFloat(_.toString(data.amount))) {
                return BaseService.sendFailedResponse({amount: `The minimum allowed amount is NGN ${validated_meter.minimumAmount}`})
            }

            return BaseService.sendSuccessResponse(validated_meter);

        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }
}

export default ElectricityService;