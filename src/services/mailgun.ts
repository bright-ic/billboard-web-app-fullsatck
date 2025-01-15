import * as _ from 'lodash';
import BaseService  from "./base";
import FormData from 'form-data';
import Mailgun, {MailgunClientOptions, Interfaces, MailgunMessageData} from 'mailgun.js';
import {MAILGUN_API_KEY, MAILGUN_URL, MAILGUN_DOMAIN} from "../lib/contants";

export type returnDataType = {[key:string]: any} | null;

const MailgunClass = new Mailgun(FormData);
const clientOptions: MailgunClientOptions = { username: 'api', key:MAILGUN_API_KEY, url: MAILGUN_URL};
const mailgun: Interfaces.IMailgunClient = MailgunClass.client(clientOptions);

class MailgunService extends BaseService {

    mailgun_pass:string = '';
    mailgun_domain:string = '';
    mailgun_user:string = "api";
    mailgun: Interfaces.IMailgunClient = mailgun;

    constructor(prop=null) {
        super(prop);
    }


    async send(mailgun_domain:string = "", mg_message: MailgunMessageData) {
        let return_data:returnDataType = null;
        try {
            mailgun_domain = !_.isEmpty(mailgun_domain) ? mailgun_domain : MAILGUN_DOMAIN;
            const result: any = await this.mailgun.messages.create(mailgun_domain, mg_message);
        if (result) {
            return_data = { http_response_body: {} };
            return_data.http_response_body.id = result.id.replace(/[><]/g, '');
            return_data.http_response_body.message = result.data.message;
            return_data.http_response_code = 200;
        }
        } catch (e) {
            console.log(e);
        }

        return return_data;
    }

}

export default MailgunService;
