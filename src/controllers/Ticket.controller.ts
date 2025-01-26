import { Request, Response } from 'express';
import User from '../models/User';
import BaseController from './base';
import AuthService from '../services/User.service';
import errorMessages from '../lib/error-messages';
import TicketService from '../services/Ticket.service';
import { DynamicObject } from '../types/Types';


class TicketController extends BaseController {
    postSupportTicket = async (req: Request, res: Response) => {
        try {
            const result = await TicketService.createTicket(req.body);
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    patchSupportTicket = async (req: Request, res: Response) => {
        try {
            const result = await TicketService.updateTicket(req.body?.id, req.body?.status);
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    getAllSupportTickets = async (req: Request, res: Response) => {
        try {
            const query: any | DynamicObject = req.query;
            const result = await TicketService.getTickets(query);
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    getSupportTicket = async (req: Request, res: Response) => {
        try {
            const query: any | DynamicObject = req.query;
            const result = await TicketService.getTicket(query.id);
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    deleteSupportTicket = async (req: Request, res: Response) => {
        try {
            const result = await TicketService.deleteTicket(req.body?.id);
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }
}

export default  TicketController;