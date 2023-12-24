
/**
 * All home controller actions
 * Only service calls should be made here
 */
import _ from 'lodash';
import BaseController from './base';
import { Request, Response } from "express";
import { ROUTE_HOME, ROUTE_TRANSACTION_RECEIPT } from '../lib/route-constants';
import ElectricityService from '../services/electricity';
import TransactionService from '../services/transactions';
import { ObjectType, PurchasePowerPayloadType } from '../types';
import TransactionsModel from '../models/transactions';

class ElectricityController extends BaseController {


	async postValidateMeter(req:Request, res:Response) {
		try {
			const electricityService = new ElectricityService();
			const {success, data} = await electricityService.validateMeter({...req.body});
			if(!success) {
                return BaseController.sendFailResponse(res, data ? data : {error: "An error occurred while processing your request"});
            }
            /*
            * Generate Reference
            */
            const transactionModel = new TransactionsModel();
            data.transaction_reference = transactionModel.generateReference();

            return BaseController.sendSuccessResponse(res, data);
		} catch(e) {
			console.log(e);
            let error = 'An error occurred processing your request. Please check your request and try again';
			return BaseController.sendFailResponse(res, error);
		}
	}

    async postInitPayment(req:Request, res:Response) {
		try {
			const transactionService = new TransactionService();
			const {success, data} = await transactionService.validateAndInitializePayment({...req.body});
			if(!success) {
                return BaseController.sendFailResponse(res, data ? data : {error: "An error occurred while processing your request"});
            }
            
            if(data.payment_link) {
                data.redirect_url = data.payment_link;
            }

            return BaseController.sendSuccessResponse(res, data);
		} catch(e) {
			console.log(e);
            let error = 'An error occurred processing your request. Please check your request and try again';
			return BaseController.sendFailResponse(res, error);
		}
	}

}

export default ElectricityController;
