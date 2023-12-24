/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router } from 'express';
const router = Router();

import { ROUTE_PAYMENT_COMPLATE_CALLBACK_URL, ROUTE_TRANSACTION_RECEIPT} from '../lib/route-constants';
import TransactionController from '../controllers/transaction';


router.get(ROUTE_TRANSACTION_RECEIPT, async (req: any, res: any) => {
	const transactionController = new TransactionController(req);
	return transactionController.receipt(req, res);
});

router.get(ROUTE_PAYMENT_COMPLATE_CALLBACK_URL, async (req: any, res: any) => {
	const transactionController = new TransactionController(req);
	return transactionController.payment_complete(req, res);
});


export default router;