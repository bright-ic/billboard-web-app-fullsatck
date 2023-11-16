import axios from 'axios';
import { ObjectType, RequestHeaderConfigType, StandardApiResponse, StandardApiResponseWithoutPromise } from '../types';
import { isObject } from '../lib/utils';


class APIRequest {

    static buildRequestConfig(Token?: string) {
        const header_config: RequestHeaderConfigType = {
            headers: {}
        }
        if(Token) {
            header_config.headers.Authorization = `Bearer ${Token}`;
        }
        return header_config;
    }

    static get = async (url:string, config:ObjectType = {}): StandardApiResponse => {
        const use_config = isObject(config) && Object.keys(config).length > 0 ? true : false;
        try {
            let result = await (use_config ? axios.get(url, config) : axios.get(url, config));
            return await APIRequest.processResponse(result);
        } catch(e) {
            return await APIRequest.getError(e);
        }
    }

    static post = async (url:string, data:ObjectType, config:ObjectType = {}): StandardApiResponse =>  {
        const use_config = isObject(config) && Object.keys(config).length > 0 ? true : false;
        try {
            let result = await (use_config ? axios.post(url,data, config) : axios.post(url,data));
            return await APIRequest.processResponse(result);
        } catch(e) {
            return await APIRequest.getError(e);
        }
    }

    static put = async (url:string, data:ObjectType, config:ObjectType={}): StandardApiResponse => {
        const use_config = isObject(config) && Object.keys(config).length > 0 ? true : false;
        try {
            let result = await (use_config ? axios.put(url,data, config) : axios.put(url,data));
            return await APIRequest.processResponse(result);
        } catch(e) {
            return await APIRequest.getError(e);
        }
    }

    static patch = async (url:string, data:ObjectType, config:ObjectType={}): StandardApiResponse => {
        const use_config = isObject(config) && Object.keys(config).length > 0 ? true : false;
        try {
            let result = await (use_config ? axios.patch(url,data, config) : axios.patch(url,data));
            return await APIRequest.processResponse(result);
        } catch(e) {
            return await APIRequest.getError(e);
        }
    }

    static request = async (config:ObjectType={}): StandardApiResponse => {
        try {
            let result = await axios.request(config);;
            return await APIRequest.processResponse(result);
        } catch(e) {
            return await APIRequest.getError(e);
        }
    }

    static delete = async (url:string, config:ObjectType={}): StandardApiResponse => {
        const use_config = isObject(config) && Object.keys(config).length > 0 ? true : false;
        try {
            let result = await (use_config ? axios.delete(url,config) : axios.delete(url));
            return await APIRequest.processResponse(result);
        } catch(e) {
            return await APIRequest.getError(e);
        }
    }

    static head = async (url:string, config:ObjectType={}): StandardApiResponse => {
        const use_config = isObject(config) && Object.keys(config).length > 0 ? true : false;
        try {
            let result = await (use_config ? axios.head(url,config) : axios.head(url));
            return await APIRequest.processResponse(result);
        } catch(e) {
            return await APIRequest.getError(e);
        }
    }

    static options = async (url:string, config:ObjectType={}): StandardApiResponse => {
        const use_config = isObject(config) && Object.keys(config).length > 0 ? true : false;
        try {
            let result = await (use_config ? axios.options(url,config) : axios.options(url));
            return await APIRequest.processResponse(result);
        } catch(e) {
            return await APIRequest.getError(e);
        }
    }

    static processResponse = async (result: ObjectType): StandardApiResponse => {
        const response_data: {success:boolean, data: any, raw?:any} = {success: false, data: null, raw:null};
        if(result && isObject(result) && result.status >=200 && result.status <= 204) {
            response_data.success = true;
        }
        response_data.data = result.data || null;
        response_data.raw = result;
        return response_data;
    }

    static getError = async (error:any): StandardApiResponse => {
        const response_data: {success:boolean, data: any, raw?:any} = {success: false, data: null, raw:null};
        if(error) {
            if (error.response) {
                response_data.data = error.response.data || {error: "Sorry, something went wrong"};
                response_data.raw = error.response;
            } else if (error.request) { //network error
                response_data.data = {error: "A network error ocurred. Make sure the address is correct or check your internet connection and try again"};
                response_data.raw = error.response;
            } else {
                response_data.data = {error: error.message};
            }
        } else {
            response_data.data = {error: error.message};
        }
        return response_data;

    }
}

export default APIRequest;