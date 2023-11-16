
/**
 * All home controller actions
 * Only service calls should be made here
 */
import _ from 'lodash';
import BaseController from './base';
import { Request, Response } from "express";

class IndexController extends BaseController {

	constructor(req:Request) {
		super(req);
	}

	async index(req:Request, res:Response) {
		try {
			return BaseController.sendSuccessResponse(res, {message: 'Api success'})
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			return BaseController.sendFailResponse(res, error);
		}
	}

	async error404(req:Request, res:Response) {
		return BaseController.sendFailResponse(res, '404: Resource not found', 404);
    }

	async error500(req:Request, res:Response) {
		return BaseController.sendFailResponse(res, '500: An Internal server error', 500);
    }

}

export default IndexController;
