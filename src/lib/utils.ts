import * as _ from "lodash";
import { Request } from 'express';
import { ObjectType, StandardServiceResponse } from "../types";
import mongoose from "mongoose";
import { DynamicObject } from "../types/Types";

export function get_ip_address (req: Request) {
    let ip: any = null;
    if (req) {
        if (req.headers['x-forwarded-for']) {
            ip = (<string>req.headers['x-forwarded-for']).split(",")[0];
        } else if (req.socket && req.socket.remoteAddress) {
            ip = req.socket.remoteAddress;
        } else {
            ip = req.ip;
        }
    }
    return ip;
};

export function isObject (data: any) {
    return (typeof data === "object" && Object.prototype.toString.call(data) === "[object Object]") ? true : false;
}

export const randomNumberWithInterval = (min:number, max:number) => Math.floor(Math.random() * (max - min + 1) + min);

export const generateRandomCodes = (amount:number=1, min_length:number = 10, max_length:number = 16, characters:string = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789") => {
    const string = [];
    for (let j = 0; j < amount; j++) {
        let first_string = '';
        const random_string_length = randomNumberWithInterval(min_length, max_length);
        for (let i = 0; i < random_string_length; i++) {
            first_string += characters[randomNumberWithInterval(0, characters.length - 1)];
        }
        string.push(first_string);
    }
    return string;
}

export const uniqid = (prefix:string = "", more_entropy:boolean = false) => {
    const sec = Date.now() * 1000 + Math.random() * 1000;
    const id = sec.toString(16).replace(/\./g, "").padEnd(13, "0");
    return `${prefix}${id}${more_entropy ? `.${Math.trunc(Math.random() * 100000000)}` : ""}`;
};

/**
 * Reindex a result set/array by a given key
 * @param {array} array Array to be searched
 * @param {string} key Field to search
 * Useful for taking database result sets and indexing them by id or unique_hash
 *
 */
export const reindex = (array:ObjectType[], key = 'id') => {
    const indexed_array:ObjectType = {};
    if ((_.isArray(array) || _.isObject(array)) && !_.isEmpty(array)) {
        _.forEach(array, item => {
            if (isObject(item) && _.has(item, key)) {
                indexed_array[item[key]] = item;
            }
        })
        return indexed_array;
    } else {
        return false;
    }
}

export const validMongoId = (id: any) => {
    try {
        if(mongoose.Types.ObjectId.isValid(id)) {
            return true;
        }
    } catch(e)  {}
    return false;
}

export const getPaginatedRecords = async (Model: any, query: DynamicObject={}, options: {page: number, limit: number}={page:1, limit:10}): Promise<StandardServiceResponse> => {
    try {
        if(Model) {
            return {success: false, data: 'Invalid collection'};
        }
        const { page = 1, limit = 10 } = options;

        const records = await Model.find(query)
            .skip((+page - 1) * +limit)
            .limit(+limit);
    
        const totalRecords = await Model.countDocuments(query);
            
        return {
            success: true,
            data: {
                records: records,
                totalRecords: totalRecords,
                totalPages: Math.ceil(totalRecords / +limit),
                page: +page,
            }
        };
    } catch (err) {
        console.log(err);
        return {success: false, data: 'Internal server error occurred'};
    }
}