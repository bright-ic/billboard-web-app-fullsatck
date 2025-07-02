/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router, Request, Response } from 'express';
const router = Router();

import { ROUTE_DASHBOARD, ROUTE_LOGIN, ROUTE_REGISTER, ROUTE_TRANSACTIONS} from '../lib/route-constants';
import DashboardController from '../controllers/dashboard';

router.get(ROUTE_DASHBOARD, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.index(req, res);
});

router.get(ROUTE_LOGIN, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.login(req, res);
});

router.get(ROUTE_REGISTER, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.register(req, res);
});

router.get(ROUTE_TRANSACTIONS, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.transactions(req, res);
});



export default router;