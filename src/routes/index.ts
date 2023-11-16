/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router } from 'express';
const router = Router();

import { ROUTE_HOME} from '../lib/route-constants';
import IndexController from '../controllers/index';


router.get(ROUTE_HOME, async (req: any, res: any) => {
	const indexController = new IndexController(req);
	return indexController.index(req, res);
});


export default router;