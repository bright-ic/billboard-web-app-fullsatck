import { Response } from "express";
import { SessionData } from "express-session";


export interface UserInterface {
    id: string,
    email: string,
    [Key: string]: any
}

export interface ValidatorErrors {
    [key: string]: string | string[];
}

export interface SanitizeData {
    [key: string]: any;
}


export interface ISessionData extends SessionData {
    flash:{[key:string] : () => any}
    user: UserInterface
  }