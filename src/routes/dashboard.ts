/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router, Request, Response } from 'express';
const router = Router();

import { ROUTE_DASHBOARD, ROUTE_LOGIN} from '../lib/route-constants';
import DashboardController from '../controllers/dashboard';

router.get(ROUTE_DASHBOARD, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.index(req, res);
});

router.get(ROUTE_LOGIN, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.login(req, res);
});



export default router;