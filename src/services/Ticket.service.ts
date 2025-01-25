
import UserModel from '../models/User';
import TicketModel, {ITicket} from '../models/Ticket';
import BaseService from "./base";
import validatePost from "../lib/validate";
import { Customer, UserInterface, CreateTicketPayload, CreateTicketDocument } from '../interfaces';
import { DynamicObject, RoleEnum } from '../types/Types';
import errorMessages from '../lib/error-messages';
import {StandardServiceResponse} from "../types/index"
import UserService from './User.service';
import { ICustomer } from '../models/Customer';
import mongoose from 'mongoose';
import mongodb from "mongodb";
import { getPaginatedRecords, validMongoId } from '../lib/utils';

class TicketService extends BaseService {

    static createTicket = async (postData: CreateTicketPayload): Promise<StandardServiceResponse> => {
        try {
            const validation_messages: DynamicObject = {
                "required": "Your :attribute is required"
            };
            let validation_rules: DynamicObject = {
                firstName: 'no_html|required|string|valid_name',
                lastName: 'no_html|required|string|valid_name',
                subject: 'no_html|required|string',
                description: 'no_html|required|string',
                email: 'no_html|required|string|email',
                reason: 'no_html|string'
            };
            const validationResponse = await validatePost(postData, validation_rules, validation_messages);
            if(!validationResponse.success){
              return BaseService.sendFailedResponse(validationResponse.data);
            }
            const SanitizeData = BaseService.sanitizeRequestData(postData);
            const { reason, subject, description, email, firstName, lastName } = SanitizeData;
            let customer: ICustomer | null = null;
            let findCustomer = await UserModel.findOne({email});
            if(!findCustomer || !findCustomer._id) {
                const createCustomer = await UserService.createCustomer({email, firstName, lastName});
                if(createCustomer.success && createCustomer.data?.user?.email) {
                    customer = createCustomer.data.user;
                }
            } else {
                customer = findCustomer.toJSON();
            }
            if(!customer || !customer.id) {
                return BaseService.sendFailedResponse({customer: "Sorry, an error occurred while processing your request"})
            }
            const ticketDoc: CreateTicketDocument = {
                status: 'open',
                subject,
                description,
                user: new mongoose.Schema.Types.ObjectId(customer.id.toString())
            }
            if(reason) {
                ticketDoc.reason = reason;
            }
            const ticket = await TicketModel.create(ticketDoc);
            return BaseService.sendSuccessResponse({ticket: ticket.toJSON(), message: "Ticket was successfully created"})
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    static updateTicket = async (id: string, status: "open" | "closed"): Promise<StandardServiceResponse> => {
        try {
            if(!(typeof id === "string" && id.trim() === "" && validMongoId(id))) {
                return BaseService.sendFailedResponse({id: 'Missing or invalid  required param "id"'})
            }
            if(!(typeof status === "string" && status.trim() === "" && ['closed', 'open'].includes(status.trim().toLowerCase()))) {
                return BaseService.sendFailedResponse({id: 'Missing or invalid  required param "status"'})
            }
            const ticket: ITicket | null = await TicketModel.findById(new mongoose.Schema.Types.ObjectId(id));
            if(!ticket || !ticket._id) {
                return BaseService.sendFailedResponse({ticket: "Ticket with id not found"})
            }
            const result = await TicketModel.updateOne({_id: ticket._id},
                {$set: {status}}
            );
            if(!result) {
                return BaseService.sendFailedResponse({error: `Failed to ${status === "closed" ? "close":"open"} ticket. Try again later`})
            }
            ticket.status = status;
            return BaseService.sendSuccessResponse({ticket: ticket.toJSON(), message: "Ticket was successfully updated"})
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    static deleteTicket = async (id: string): Promise<StandardServiceResponse> => {
        try {
            if(!(typeof id === "string" && id.trim() === "" && validMongoId(id))) {
                return BaseService.sendFailedResponse({id: 'Missing or invalid  required param "id"'})
            }
            const ticket: ITicket | null = await TicketModel.findById(id);
            if(!ticket || !ticket._id) {
                return BaseService.sendFailedResponse({ticket: "Ticket with id not found"})
            }
            const result = await TicketModel.findByIdAndDelete(id);
            if(!result) {
                return BaseService.sendFailedResponse({error: "Failed to delete ticket. Try again later"})
            }
            return BaseService.sendSuccessResponse({message: "Ticket was successfully deleted"})
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    static getTickets = async (reqQuery: {page: number, limit: number} & DynamicObject): Promise<StandardServiceResponse> => {
        try {
            const { page = 1, limit = 10, status } = reqQuery;
            const query: DynamicObject = {};
            if(status) {
                if(!(typeof status === "string" && status.trim() === "" && ['closed', 'open'].includes(status.trim().toLowerCase()))) {
                    return BaseService.sendFailedResponse({status: 'Invalid status field value supplied in request data'})
                }
                query.status = status;
            }

            return await getPaginatedRecords(TicketModel, query, {page, limit});
        } catch (err) {
            console.log(err);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }
}

export default TicketService;