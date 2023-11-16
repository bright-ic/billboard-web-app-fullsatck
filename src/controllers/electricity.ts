
/**
 * All home controller actions
 * Only service calls should be made here
 */
import _ from 'lodash';
import BaseController from './base';
import { Request, Response } from "express";
import ElectricityService from '../services/electricity';

class ElectrictyController extends BaseController {

	constructor(req:Request) {
		super(req);
	}

	async getDiscos(req:Request, res:Response) {
		try {
            const electricity_service = new ElectricityService(req);
            const {success, data} = await electricity_service.getDiscos();
            if(!success) {
                return BaseController.sendFailResponse(res, data);
            }
			return BaseController.sendSuccessResponse(res, data)
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			return BaseController.sendFailResponse(res, error);
		}
	}

	async postFetchMeterDetail(req:Request, res:Response) {
		try {
            const electricity_service = new ElectricityService(req);
            const {success, data} = await electricity_service.getMeterDetail({...req.body});
            if(!success) {
                return BaseController.sendFailResponse(res, data);
            }
			return BaseController.sendSuccessResponse(res, data)
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			return BaseController.sendFailResponse(res, error);
		}
	}

	async postPurchasePower(req:Request, res:Response) {
		try {
			const post_data = {...req.body};
            const electricity_service = new ElectricityService(req);
            const {success, data} = await electricity_service.purchasePower(post_data);
            if(!success) {
                return BaseController.sendFailResponse(res, data);
            }
			return BaseController.sendSuccessResponse(res, data)
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			return BaseController.sendFailResponse(res, error);
		}
	}

	async getPurchasTransaction(req:Request, res:Response) {
		try {
			const transaction_ref:any = req.query.transaction_reference || "";
            const electricity_service = new ElectricityService(req);
            const {success, data} = await electricity_service.getPurchaseTransaction(transaction_ref);
            if(!success) {
                return BaseController.sendFailResponse(res, data);
            }
			return BaseController.sendSuccessResponse(res, data)
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			return BaseController.sendFailResponse(res, error);
		}
	}

}

export default ElectrictyController;
