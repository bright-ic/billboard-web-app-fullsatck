/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router } from 'express';
const router = Router();

import { ROUTE_ELECTRICITY_VALIDATE_METER} from '../lib/route-constants';
import ElectricityController from '../controllers/electricity';


router.post(ROUTE_ELECTRICITY_VALIDATE_METER, async (req: any, res: any) => {
	const electricityController = new ElectricityController(req);
	return electricityController.postValidateMeter(req, res);
});


export default router;