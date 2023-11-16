import * as _ from "lodash";
import { Request } from 'express';

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