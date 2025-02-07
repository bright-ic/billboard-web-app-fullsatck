import { Response } from "express";
import { SessionData } from "express-session";
import mongoose from "mongoose";
import { RoleEnum } from "../types/Types";


export interface UserInterface {
    _id?: mongoose.Types.ObjectId;
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    password: string;
    [Key: string]: any
}

export interface Customer {
    _id?: mongoose.Types.ObjectId;
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    accessCode?: string;
    role?: 'admin' | 'user';
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

export interface CreateTicketPayload {
    firstName: string;
    lastName: string;
    email: string;
    reason?: string;
    subject: string;
    description: string;
    status?: 'open' | 'closed';
    attachments?: string[];
}
export interface CreateTicketDocument {
    reason?: string;
    subject: string;
    description: string;
    status?: 'open' | 'closed';
    attachments?: string[];
    user: mongoose.Types.ObjectId;
}

export interface CategoryDocument {
    _id?: mongoose.Types.ObjectId;
    id?: string;
    name: string;
    description: string;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    status: "ACTIVE" | "INACTIVE";
}

export interface CreateUpdateCategoryPayload {
    id?: string;
    name: string;
    description: string;
    [Key: string]: any;
    status: "ACTIVE" | "INACTIVE";
}

export interface BlogDocument {
    title: string;
    slug?: string;
    category?: mongoose.Types.ObjectId;
    content: string;
    author?: mongoose.Types.ObjectId;
    thumbnail?: string;
    updatedBy?: mongoose.Types.ObjectId;
    status: "ACTIVE" | "INACTIVE"
}

export interface BlogPostPayload {
    title: string;
    category: string;
    content: string;
    thumbnail?: string;
    status: "ACTIVE" | "INACTIVE"
}