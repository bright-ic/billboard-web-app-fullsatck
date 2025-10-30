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
      async register(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/register', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'Signup',
                selected_page: 'signup_page',
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }
    async transactions(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/transactions', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'transactions',
                selected_page: 'transactions_page',
                transactions: [
                    { name: 'IKEDC Electricity Purchase', transaction_type: 'electricity', txn_id: 'TRX00123',time: '5:40 PM', date: 'Jul 01, 2025',amount: '5,000.00',status: 'success' },
                    { name: 'MTN Recharge', transaction_type: 'recharge', txn_id: 'TRX00124',time: '3:10 AM', date: 'Jul 01, 2025',amount: '1,000.00',status: 'failed' },
                    { name: 'Netflix Subscription', transaction_type: 'subscription', txn_id: 'TRX00125', time: '2:00 PM', date: 'Jul 02, 2025',amount: '3,200.00',status: 'pending' }
                ],
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }
    async electricity(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/electricity', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'electricity',
                selected_page: 'electricity_page',
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }
     async reconcile(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/reconcile', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'reconcile',
                selected_page: 'reconcile_page',
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }

    async admin(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/admin', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'admin',
                selected_page: 'admin_page',
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }

    async users(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/users', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'users',
                selected_page: 'users_page',
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }

    async users_transactions(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/users_transactions', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'users_transactions',
                selected_page: 'users_transactions_page',
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }
        async support_tickets(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/support_tickets', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'support_tickets',
                selected_page: 'support_tickets_page',
                ...view_data
            }));
        } catch (e) {
            console.log(e)
            let error = 'An error occurred processing your request. Please check your request and try again';
            return BaseController.sendFailResponse(res, error);
        }
    }

        async payments(req:Request, res:Response) {
        const view_data:ObjectType = {};

        try {
            res.render('dashboard/payments', this.setTemplateParameters(req, {
                page_styles: ['/css/dashboard.css'],
                page_title: 'payments',
                selected_page: 'payments_page',
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