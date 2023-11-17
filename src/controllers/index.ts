
/**
 * All home controller actions
 * Only service calls should be made here
 */
import _ from 'lodash';
import BaseController from './base';
import { Request, Response } from "express";
import { ROUTE_HOME } from '../lib/route-constants';
import ElectricityService from '../services/electricity';
import { ObjectType } from '../types';

class IndexController extends BaseController {

	constructor(req:Request) {
		super(req);
	}

	async index(req:Request, res:Response) {
		const view_data:ObjectType = {};
		view_data.discos = [];
		try {
			const electricityService = new ElectricityService();
			const discos_res = await electricityService.getDiscos();
			if(discos_res.success && discos_res.data) {
				view_data.discos = discos_res.data;
			}
		} catch(e) {
			console.log(e);
		}

		try {
			res.render('index', this.setTemplateParameters(req, {
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
