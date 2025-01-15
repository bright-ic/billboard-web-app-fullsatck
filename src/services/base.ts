
import { isObject as _isObject, each, isArray, isString as _isString, forEach, includes, isEmpty, isUndefined } from 'lodash';
import { SanitizeData, ValidatorErrors } from '../interfaces';
import {StandardServiceResponse} from "../types/index"
import { Request } from 'express';


/**
 * All base functions for the service
 */
class BaseService {
    public generic_error_message: string = "Unfortunately, we couldn't process your request at the moment. Please check your request and try again!";

	constructor(req?: Request | null) {}

	/**
     * uniform expectation of failed response data
     * @param data
     * @return mixed
     */
    static sendFailedResponse: StandardServiceResponse = (data: any) => {
        const returnData = { success: false, data: null };
        if (!isUndefined(data)) {
            returnData.data = data;
        }
        return returnData;
    }

    /**
     * uniform expectation of successful response data
     * @param data
     * @return mixed
     */
    static sendSuccessResponse: StandardServiceResponse = (data: any) => {
        const returnData = { success: true, data: null };
        if (!isUndefined(data)) {
            returnData.data = data;
        }
        return returnData;
    }

	/**
	 * convert mongoose errors to errors that can be displayed
	 * @param validator_errors
	 * @return {any}
	 */
	static flattenValidatorErrors(validator_errors: ValidatorErrors): ValidatorErrors {
		let returnErrors: ValidatorErrors = {};
		if (_isObject(validator_errors)) {
			each(validator_errors, (errorVal: any, errorKey: any) => {
				if (isArray(errorVal)) {
					returnErrors[errorKey] = errorVal[0];
				} else if (_isString(errorVal)) {
					returnErrors[errorKey] = errorVal;
				}
			});
		}
		return JSON.parse(JSON.stringify(returnErrors));
	}

	/**
	 *
	 * @param {*} data
	 * @returns
	 */
	static sanitizeRequestData(data: Record<string, any>): Record<string, any>{
		if (!isEmpty(data)) {
			forEach(data, (d: any, key: any) => {
				data[key] = this.recursivelySanitize(d);
			});
		}
		return data;
	}

	/**
	 *
	 * @param {*} data
	 * @returns
	 */
	static recursivelySanitize(data: SanitizeData | string): SanitizeData | string{
		if (_isString(data)) {
			data = data.trim();
		}
		else if (_isObject(data)) {
			forEach(data, (d, key) => {
				if (_isString(d) && includes(d, "%") !== false) {
					(data as SanitizeData)[key] = decodeURI(d);
				}
				if (_isObject(d)) {
					(data as SanitizeData)[key] = this.recursivelySanitize(d as SanitizeData);
				}
			});
		}
		return data;
	}
}

export default BaseService;
