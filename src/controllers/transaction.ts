
/**
 * All home controller actions
 * Only service calls should be made here
 */
import _ from 'lodash';
import BaseController from './base';
import { Request, Response } from "express";
import { ROUTE_HOME } from '../lib/route-constants';

class TransactionController extends BaseController {

    async receipt(req:Request, res:Response) {
		try {
			
			res.render('transaction/receipt', this.setTemplateParameters(req, {
				selected_page: 'transaction_receipt_page'
			}));
		} catch (e) {
			console.log(e)
			let error = 'An error occurred processing your request. Please check your request and try again';
            req.flash('error', error);
			return res.redirect(ROUTE_HOME);
		}
	}
}

export default TransactionController;
