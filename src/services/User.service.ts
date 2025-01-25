import bcrypt from 'bcrypt';
import User from '../models/User';
import CustomerModel from '../models/Customer';
import BaseService from "./base";
import validatePost from "../lib/validate";
import { Customer, UserInterface } from '../interfaces';
import { DynamicObject, RoleEnum } from '../types/Types';
import errorMessages from '../lib/error-messages';
import {StandardServiceResponse} from "../types/index"
import { getPaginatedRecords } from '../lib/utils';

class UserService extends BaseService {

    static createAdminUser = async (postData: UserInterface): Promise<StandardServiceResponse> => {
        try {
            const validation_messages: DynamicObject = {
                "valid_name": "Your :attribute cannot contain numbers",
                "required": "Your :attribute is required"
            };
            let validation_rules: DynamicObject = {
                firstName: 'no_html|required|string|valid_name',
                lastName: 'no_html|required|string|valid_name',
                password: 'no_html|required|string',
                comparedPassword: 'no_html|required|string',
                email: 'no_html|required|email'
            };
            const validationResponse = await validatePost(postData, validation_rules, validation_messages);
            if(!validationResponse.success){
              return BaseService.sendFailedResponse(validationResponse.data);
            }
            const SanitizeData = BaseService.sanitizeRequestData(postData);
            const { firstName, lastName, email, password, comparedPassword } = SanitizeData;
            
            if(comparedPassword !== password) {
                return BaseService.sendFailedResponse({password: "Password mis-match"});
            }

            // check if user with email exist
            const checkUser = await User.findOne({email});
            if(checkUser && checkUser._id) {
                return BaseService.sendFailedResponse({email: 'A user with the provided email already exist'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({firstName, lastName,  email, password: hashedPassword, role: RoleEnum.Admin });
            const result = await newUser.save();
            if(!result) {
                return BaseService.sendFailedResponse({user: "Sorry, an error occurred while trying to create your admin user"})
            }
            const newUserRecord = await User.findOne({email});
            return  BaseService.sendSuccessResponse({user: newUserRecord?.toJSON(), message: "Admin account was created successfully"});
        } catch (err) {
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    static adminLogin = async (postData: UserInterface): Promise<StandardServiceResponse> => {
        try {
            const validation_messages: DynamicObject = {
                "required": "Your :attribute is required"
            };
            let validation_rules: DynamicObject = {
                password: 'no_html|required|string',
                email: 'no_html|required|email'
            };
            const validationResponse = await validatePost(postData, validation_rules, validation_messages);
            if(!validationResponse.success){
              return BaseService.sendFailedResponse(validationResponse.data);
            }
            const SanitizeData = BaseService.sanitizeRequestData(postData);
            const { email, password } = SanitizeData;

            const user = await User.findOne({ email });
            if (!user) {
                return BaseService.sendFailedResponse({email: 'Invalid login combination provided. Please try again later'});
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return BaseService.sendFailedResponse({email: 'Invalid login combination provided. Please try again later'});
            }
            return  BaseService.sendSuccessResponse(user?.toJSON());
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    static getAdmins = async (reqQuery: {page: number, limit: number} & DynamicObject): Promise<StandardServiceResponse> => {
        try {
            const { page = 1, limit = 10 } = reqQuery;

            return await getPaginatedRecords(User, { role: RoleEnum.Admin }, reqQuery);
        } catch (err) {
            console.log(err);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    static createCustomer = async (postData: Customer): Promise<StandardServiceResponse> => {
        try {
            const validation_messages: DynamicObject = {
                "valid_name": "Your :attribute cannot contain numbers",
                "required": "Your :attribute is required"
            };
            let validation_rules: DynamicObject = {
                firstName: 'no_html|required|string|valid_name',
                lastName: 'no_html|required|string|valid_name',
                email: 'no_html|required|email'
            };
            const validationResponse = await validatePost(postData, validation_rules, validation_messages);
            if(!validationResponse.success){
              return BaseService.sendFailedResponse(validationResponse.data);
            }
            const SanitizeData = BaseService.sanitizeRequestData(postData);
            const { firstName, lastName, email } = SanitizeData;

            // check if user with email exist
            const checkCustomer = await CustomerModel.findOne({email});
            if(checkCustomer && checkCustomer._id) {
                return BaseService.sendSuccessResponse(checkCustomer);
            }

            const newUser = new User({firstName, lastName,  email });
            const result = await newUser.save();
            if(!result) {
                return BaseService.sendFailedResponse({customer: "Sorry, an error occurred while trying to create your customer record"})
            }
            const newCustomer = await CustomerModel.findOne({email});
            return  BaseService.sendSuccessResponse({user: newCustomer?.toJSON(), message: "Customer account was created successfully"});
        } catch (err) {
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }
}

export default UserService;