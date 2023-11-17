/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router } from 'express';
const router = Router();

import { ROUTE_TRANSACTION_RECEIPT} from '../lib/route-constants';
import ElectricityController from '../controllers/transaction';


router.get(ROUTE_TRANSACTION_RECEIPT, async (req: any, res: any) => {
	const electricityController = new ElectricityController(req);
	return electricityController.receipt(req, res);
});


export default router;