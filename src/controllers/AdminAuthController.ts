import { Request, Response } from 'express';
import User from '../models/User';
import BaseController from './base';
import AuthService from '../services/User.service';
import errorMessages from '../lib/error-messages';


class AdminAuthController extends BaseController {

    register = async (req: Request, res: Response) => {
       try {
            const result = await AuthService.createAdminUser(req.body);
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data);
            }
            return BaseController.sendSuccessResponse(res, result.data);
       } catch(e) {
            return BaseController.sendFailResponse(res, errorMessages.server_error);
       }
    }

    login = async (req: Request, res: Response) => {
        try {
             const result = await AuthService.adminLogin(req.body);
             if(!result.success) {
                 return BaseController.sendFailResponse(res, result.data);
             }
             if(result.data && result.data.email) {
                 BaseController.setUserSession(req, result.data);
                 User.updateOne({email: result.data.email}, {$set: {lastLogin: new Date().getTime()}}).then().catch();
             }
             return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
             return BaseController.sendFailResponse(res, errorMessages.server_error);
        }
    }
}

export default AdminAuthController;