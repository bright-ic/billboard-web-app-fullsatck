/**
 * Contact Page and Static Pages
 * @type {e | (() => Express)}
 */

import { Router, Request, Response } from 'express';
const router = Router();

import { ROUTE_CONTACT} from '../lib/route-constants';
import ContactController from '../controllers/contact';


router.get(ROUTE_CONTACT, async (req: Request, res: Response) => {
	const contactController = new ContactController(req);
	return contactController.contact(req, res);
});




export default router;
