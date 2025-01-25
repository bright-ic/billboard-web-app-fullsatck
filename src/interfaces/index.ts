import { Response } from "express";
import { SessionData } from "express-session";
import mongoose from "mongoose";


export interface UserInterface {
    _id?: mongoose.Schema.Types.ObjectId;
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    [Key: string]: any
}

export interface Customer {
    _id?: mongoose.Schema.Types.ObjectId;
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    accessCode?: string;
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