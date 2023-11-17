import {SignInPayloadType} from "../jwt.types";
import {UserInterface} from "../../interfaces/index";
import { Session, SessionData } from "express-session";

export {}

declare module 'express-session' {
	export interface SessionData {
		flash: {[key: string] : () => any}
		user: any
	}
}


declare global {

  namespace Express {
    export interface Request {
		new_token?: string;
		decoded_jwt_data?: SignInPayloadType;
		user?: UserInterface,
		session: Session & Partial<SessionData>,
		status: number,
		flash(message?: string): { [key: string]: string[] };
        flash(event: string, message: string | string[]): any;
    }
    export interface Response {
        new_token?: string;
    }
  }
  
}