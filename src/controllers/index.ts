
/**
 * All home controller actions
 * Only service calls should be made here
 */
import _ from 'lodash';
import BaseController from './base';
import { Request, Response } from "express";
import { ROUTE_HOME } from '../lib/route-constants';
import { ObjectType } from '../types';

class IndexController extends BaseController {

	async index(req:Request, res:Response) {
		const view_data:ObjectType = {};

		try {
			res.render('index', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
				selected_page: 'home_page',
				...view_data
			}));
		} catch (e) {
			console.log(e)
			let error = 'An error occurred processing your request. Please check your request and try again';
			return BaseController.sendFailResponse(res, error);
		}
	}

	async error404(req:Request, res:Response) {
		try {

			res.render('error404', this.setTemplateParameters(req, {

			}));
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			req.flash('error',error);
			res.redirect(ROUTE_HOME)
		}
    }

	async error500(req:Request, res:Response) {
		try {

			res.render('error500', this.setTemplateParameters(req, {

			}));
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			req.flash('error',error);
			res.redirect(ROUTE_HOME)
		}
    }

}

export default IndexController;
