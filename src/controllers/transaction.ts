
/**
 * All home controller actions
 * Only service calls should be made here
 */
import _ from 'lodash';
import BaseController from './base';
import { Request, Response } from "express";
import { ROUTE_HOME, ROUTE_TRANSACTION_RECEIPT } from '../lib/route-constants';
import TransactionService from '../services/transactions';
import PaymentService from '../services/payment';
import ElectricityService from '../services/electricity';
import { ObjectType, PurchasePowerPayloadType } from '../types';
import {empty} from "../lib/utility_js";
import { STATUS_PAYMENT_FAILED_VERIFICATION, STATUS_SUCCESS, TRANSACTION_STATUS_FAILED, TRANSACTION_STATUS_INITIALIZED, TRANSACTION_STATUS_SUCCESS, TRANSACTION_STATUS_TOKEN_GENERATION_FAILED, TRANSACTION_STATUS_TOKEN_GENERATION_PENDING } from '../lib/contants';

class TransactionController extends BaseController {
/**
 *
 *
 * @param {Request} req
 * @param {Response} res
 * @return {*} 
 * @memberof TransactionController
 */
async receipt(req:Request, res:Response) {
		const view_data:ObjectType = {};
		try {
			if(!req.query.tx_ref) {
				return res.redirect(ROUTE_HOME);
			}
			const tx_ref:any = req.query.tx_ref;
			const transactionService = new TransactionService();
			const paymentService = new PaymentService();
			const electricityService = new ElectricityService();
			// const verified_payment:boolean = req.query.verified_payment && req.query.verified_payment === "no" ? false : true;
			//TODO:
			/**
			 * Get transaction detail from db
			 * Get payment detail from db
			 * Check if payment is completed and verified $verified_payment
			 * Check if transaction is completed or not
			 * If payment is not verified, try to verify payment and proceed with electricity vending after successfull verifcation
			 * If payment is verified,
			 * 		Check transaction,
			 * 			If transaction is not completed, proceed with electricity vending
			 * 			If transaction is completed and token generated, return the transaction detail and token details generated
			 * 			If transaction is completed and token was not generated, proceed to requery to generate token and return the token details generated
			 * 		
			*/
			const trx_rec = await transactionService.getRecordByTransactionRef(tx_ref);
			const pay_rec = await paymentService.getRecordByTransactionRef(tx_ref);
			let transaction_record = trx_rec.success && trx_rec.data && trx_rec.data._id ? trx_rec.data : {};
			const payment_record = pay_rec.success && pay_rec.data && pay_rec.data._id ? pay_rec.data : {};
			let fetch_updated_trans_rec = false;
			
			if(payment_record && payment_record.status === STATUS_SUCCESS) {
				// Payment has been completed and verified
				if(transaction_record && ( transaction_record.status === TRANSACTION_STATUS_INITIALIZED || transaction_record.status === TRANSACTION_STATUS_FAILED)) {
					// go ahead and send vending request to the api
					//Done: Make a vending api request call
					const powerPayload: PurchasePowerPayloadType = {
						disco: transaction_record.disco || "",
						customer_meter_number: transaction_record.customer_meter_number || "",
						account_type: transaction_record.account_type || "",
						amount: transaction_record.amount,
						transaction_reference: transaction_record.transaction_reference || "",
						gift_email: transaction_record.gift_email,
						gift_phone_number: transaction_record.gift_phone_number
					}
					if(_.has(transaction_record, 'disco') && _.toLower(_.toString(transaction_record.disco)) === "phed") {
						powerPayload.customer_number = transaction_record.customer_number;
						powerPayload.customer_name = transaction_record.customer_name;
					}
					const vend_response = await electricityService.vendPower(powerPayload);
					if(vend_response.success) {
						view_data.vend_details = vend_response.data;
						fetch_updated_trans_rec = true;
					} else {
						view_data.errors = vend_response.data;
					}
				} else if(transaction_record && _.includes([TRANSACTION_STATUS_TOKEN_GENERATION_FAILED, TRANSACTION_STATUS_TOKEN_GENERATION_PENDING], transaction_record.status)) {
					//Done: Make a requery api call here
					const vend_response = await electricityService.requery(tx_ref);
					if(vend_response.success) {
						view_data.vend_details = vend_response.data;
						fetch_updated_trans_rec = true;
					} else {
						view_data.errors = vend_response.data;
					}
				} else if(transaction_record && transaction_record.status === TRANSACTION_STATUS_SUCCESS) {
					view_data.transaction_rec = transaction_record;
					view_data.vend_details = !empty(transaction_record.vend_details) ? transaction_record.vend_details : {};
				}
			} else if(payment_record && payment_record.status === STATUS_PAYMENT_FAILED_VERIFICATION) {
				view_data.pending_payment_verification = "Your payment is pending verification, please reload the page in few minutes time.<br/><br/>If error persist after 30mins of transaction, please contact us for rectification.";
				view_data.pending_payment_verification = true;
			} else {
				view_data.errors = {error: 'Sorry, an unexpected error occurred. <br/>If your account was charged, please contact us for immediate rectification'};
			}

			if(fetch_updated_trans_rec) {
				const trx_rec_updated = await transactionService.getRecordByTransactionRef(tx_ref);
				transaction_record = trx_rec_updated.success && trx_rec_updated.data && trx_rec_updated.data._id ? trx_rec_updated.data : transaction_record;
				view_data.transaction_rec = transaction_record;
			}
			
		} catch(e) {
			console.log(e);
		}

		try {
			res.render('transaction/receipt', this.setTemplateParameters(req, {
				selected_page: 'transaction_receipt_page',
				...view_data
			}));
		} catch (e) {
			console.log(e)
			let error = 'An error occurred processing your request. Please check your request and try again';
            req.flash('error', error);
			return res.redirect(ROUTE_HOME);
		}
	}

	async payment_complete(req:Request, res:Response) {
		const tx_ref = req.query.tx_ref || "";
		try {
			if (req.query.status === 'successful') {
				const transactionService = new TransactionService();
				const {success, data} = await transactionService.verifyPayment({...req.query});
				let redirect_url = `${ROUTE_TRANSACTION_RECEIPT}?tx_ref=${tx_ref}`;
				if(!success) {
					if(!_.has(data, "verified_payment")) {
						req.flash('error', data.message || "Sorry, we could not verify your payment. Please contact us if you were debited and the your payment is not reversed after 30mins");
						return res.redirect(ROUTE_HOME);
					}
					redirect_url = `${redirect_url}&verified_payment=no`;
				}
				return res.redirect(redirect_url);
			}
			return res.redirect(`${ROUTE_HOME}?tx_ref=${tx_ref}`);
		} catch (e) {
			console.log(e)
			let error = 'An error occurred processing your request. Please check your request and try again';
            req.flash('error', error);
			return res.redirect(ROUTE_HOME);
		}
	}

}

export default TransactionController;
