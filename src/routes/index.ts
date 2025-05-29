/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router, Request, Response } from 'express';
const router = Router();

import { ROUTE_HOME} from '../lib/route-constants';
import IndexController from '../controllers/index';


router.get(ROUTE_HOME, async (req: Request, res: Response) => {
	const indexController = new IndexController(req);
	return indexController.index(req, res);
});



export default router;