/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router, Request, Response } from 'express';
const router = Router();

import { ROUTE_TEAM} from '../lib/route-constants';
import {TeamController} from '../controllers/team';


router.get(ROUTE_TEAM, async (req: Request, res: Response) => {
	const teamController = new TeamController(req);
	return teamController.viewTeam(req, res);
});




export default router;
