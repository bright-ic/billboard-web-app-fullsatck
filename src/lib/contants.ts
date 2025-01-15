
export const DATABASE = process.env.DATABASE || '';

export const COLLECTION_USERS = 'users';


export const IS_LIVE = process.env.NODE_ENV && process.env.NODE_ENV === "production";
export const IS_LOCAL = process.env.NODE_ENV && process.env.NODE_ENV === "local";
export const IS_DEV = process.env.NODE_ENV && process.env.NODE_ENV !== "production";

export const MAILGUN_API_KEY:string = process.env.MAILGUN_API_KEY || "";
export const MAILGUN_URL:string = process.env.MAILGUN_URL || "api.mailgun.net";
export const MAILGUN_DOMAIN:string = process.env.MAILGUN_DOMAIN || "";




export const REDIS_URL:string = process.env.REDIS_URL || '';