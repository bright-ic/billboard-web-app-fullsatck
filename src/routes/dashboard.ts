/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router, Request, Response } from 'express';
const router = Router();

import {ROUTE_ADMIN, ROUTE_DASHBOARD, ROUTE_ELECTRIC, ROUTE_LOGIN, ROUTE_PAYMENTS, ROUTE_RECONCILE, ROUTE_REGISTER, ROUTE_SUPPORT_TICKETS, ROUTE_TRANSACTIONS, ROUTE_USERS, ROUTE_USERS_TRANSACTIONS} from '../lib/route-constants';
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

router.get(ROUTE_ELECTRIC, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.electricity(req, res);
});
router.get(ROUTE_RECONCILE, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.reconcile(req, res);
});
router.get(ROUTE_ADMIN, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.admin(req, res);
});
router.get(ROUTE_USERS, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.users(req, res);
});
router.get(ROUTE_USERS_TRANSACTIONS, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.users_transactions(req, res);
});
router.get(ROUTE_SUPPORT_TICKETS, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.support_tickets(req, res);
});
router.get(ROUTE_PAYMENTS, async (req: Request, res: Response) => {
    const dashboardController = new DashboardController(req);
    return dashboardController.payments(req, res);
});


export default router;