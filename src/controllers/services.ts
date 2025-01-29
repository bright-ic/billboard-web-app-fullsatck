/**
 * All services controller actions
 * Only service calls should be made here
 */

import _ from 'lodash';
import BaseController from './base';
import { ObjectType } from '../types';
import { Request, Response } from "express";




class ServicesController extends BaseController {

	async services(req:Request, res:Response) {
		const view_data:ObjectType = {};

		try {
			res.render('services/index', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
				selected_page: 'services_page',
				...view_data
			}));
		} catch (e) {
			console.log(e)
			let error = 'An error occurred processing your request. Please check your request and try again';
			return BaseController.sendFailResponse(res, error);
		}
	}

}

// export { servicesController };
export default ServicesController;
