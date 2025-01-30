/**
 * services Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router, Request, Response } from 'express';
const router = Router();

import { ROUTE_SERVICES} from '../lib/route-constants';
import ServicesController from '../controllers/services';


router.get(ROUTE_SERVICES, async (req: Request, res: Response) => {
	const servicesController = new ServicesController(req);
	return servicesController.services(req, res);
});




export default router;
