
import _ , { has, isObject as _isObject, each, isString, isEmpty } from 'lodash';
import { Request, Response } from 'express';
import { SessionData } from 'express-session';
import { IS_LIVE } from '../lib/contants';

/**
 * Base functionality for all routes/controllers to inherit in other controllers/routes
 */
class BaseController {
	live_domain: string
	is_live: boolean
	is_dev: boolean
	is_local: boolean

	constructor(req:Request) {
		this.live_domain = process.env.LIVE_DOMAIN || "";
		this.is_live = false;
		this.is_dev = true;
		this.is_local = false;

		if (process.env.NODE_ENV && process.env.NODE_ENV === "production") {
			this.is_live = true;
			this.is_dev = false;
			this.is_local = false;
		} else {
			this.is_live = false;
			this.is_dev = true;
			if (process.env.NODE_ENV && process.env.NODE_ENV === "local") {
				this.is_local = true;
			} else {
				this.is_local = false;
			}
		}
	}

	/**
	 * merges data with utils render function
	 * set template data, merge local data with global data
	 * Note: global variable names should start with "_" to avoid duplicate names
	 * @param req
	 * @param localData
	 * @return {{}}
	 */
	setTemplateParameters(req: Request, localData: any) {
		// if there is no local template data to merge with global data
		if (typeof localData === 'undefined') {
			localData = {};
		}

		if (this.is_dev) {
			localData.TEMPLATE_VERSION = new Date().getTime();
		} else {
			localData.TEMPLATE_VERSION = process.env. TEMPLATE_VERSION || '2023.00';
		}
		if (!localData.page_title) {
			localData.page_title = "";
    	}
		localData.is_live = IS_LIVE;
		if (!_.isEmpty(req.originalUrl)) {
			localData.request_url = req.originalUrl;
		}

		return this.render(req, localData);
	}

	render(req:Request, _obj:any) {
		const obj:{[key: string]: any} = {}
		// Handles flash messages
		// Adds flash messages to object variables
		if(req && has(req, 'session') && req.session.flash) {
			let msgObj
			while (msgObj = req.session.flash.shift()) {
				if(!has(obj, '_flash')) {
					obj._flash = {};
				}
				obj._flash[msgObj.type] = msgObj.message
			}
		}
		// leaving to ensure no breaking issues with old config
		for (const attr in _obj) {
			if (_obj[attr]) obj[attr] = _obj[attr]
		}

		obj['_server_date'] = new Date();

		return obj
	}

	/**
	 * standard fail response object
	 * @param res
	 * @param data
	 */
	static sendFailResponse (res: Response, errors: any, status?: number) {
		const return_data:{[key: string]: any} = {success: false, errors};
		if(res.new_token) {
			return_data.new_token = res.new_token;
		}
		status = typeof status === "number" && status ? status : 400;
		res.status(status).send(return_data);
	}

	/**
	 * standard success response object
	 * @param res
	 * @param data
	 */
	static sendSuccessResponse(res:Response, data: any, status?: number ) {
		const return_data:{[key: string]: any} = {success: true, data};
		if(res.new_token) {
			return_data.new_token = res.new_token;
		}
		status = typeof status === "number" && status ? status : 201;
		res.status(status).send(return_data);
	}

	/**
	 * check for server error error
	 * @param errorData
	 */
	static hasServerError(errorData:any) {
		let hasServerError = false;
		if (_isObject(errorData)) {
			each(errorData, (errorData, errorKey) => {
				// error keys starting with _ are server errors except for _id
				if (isString(errorKey) && errorKey.substr(0, 1) === '_' && errorKey !== '_id') {
					hasServerError = true;
				}
			});
		}
		return hasServerError;
	}

	static setUserSession(req:Request, session_data:SessionData) {
		if (req && req.session && session_data) {
			try {
				req.session.user = session_data;
				req.session.save();
			} catch(e) {}
		}
	}

	static getRequestType(req:Request) {
        try {
            if(!isEmpty(req) && _isObject(req)) {
                if(req.xhr) return "json";
                switch(req.accepts(['json', 'html', 'text/plain'])) {
                    case "json":
                        return "json";
                    case "html":
                        return "html";
                    case "text/plain":
                        return "text/plain";
                    default:
                        return null;
                }
            }
            return null;
        } catch(err) {
            return null;
        }
    }

	logout(req: Request) {
		try {
			if(req) {
				req.session.user = null;
				delete req.session.user;
				req.session.save();
			}
		} catch(e) {
			console.log(e);
		}
		return true;
	}
}

export default BaseController;
