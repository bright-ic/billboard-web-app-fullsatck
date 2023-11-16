/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router } from 'express';
const router = Router();

import { ROUTE_GET_ELECTRICITY_DISCOS, ROUTE_ELECTRICITY_METER_DETAIL, ROUTE_ELECTRICITY_PURCHASE, ROUTE_ELECTRICITY_PURCHASE_TRANSACTION} from '../lib/route-constants';
import ElectricityController from '../controllers/electricity';


router.get(ROUTE_GET_ELECTRICITY_DISCOS, async (req: any, res: any) => {
	const electricityController = new ElectricityController(req);
	return electricityController.getDiscos(req, res);
});

router.post(ROUTE_ELECTRICITY_METER_DETAIL, async (req: any, res: any) => {
	const electricityController = new ElectricityController(req);
	return electricityController.postFetchMeterDetail(req, res);
});

router.post(ROUTE_ELECTRICITY_PURCHASE, async (req: any, res: any) => {
	const electricityController = new ElectricityController(req);
	return electricityController.postPurchasePower(req, res);
});

router.get(ROUTE_ELECTRICITY_PURCHASE_TRANSACTION, async (req: any, res: any) => {
	const electricityController = new ElectricityController(req);
	return electricityController.getPurchasTransaction(req, res);
});


export default router;