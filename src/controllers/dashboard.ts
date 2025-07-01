/**
 * All home controller actions
 * Only service calls should be made here
 */
import _ from 'lodash';
import BaseController from './base';
import { Request, Response } from "express";
import { ObjectType } from '../types';

class DashboardController extends BaseController {
  
    async index(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/index', this.setTemplateParameters(req, {
                page_styles: ['css/dashboard.css'],
                page_title: 'Dashboard',
                selected_page: 'dashboard_page',
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }
    async login(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/login', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'Login',
                selected_page: 'login_page',
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }
}

export default DashboardController;