/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router, Request, Response } from 'express';
const router = Router();

import { ROUTE_TRAINING} from '../lib/route-constants';
import TrainingController from '../controllers/training';


router.get(ROUTE_TRAINING, async (req: Request, res: Response) => {
	const trainingController = new TrainingController(req);
	return trainingController.viewTraining(req, res);
});




export default router;
