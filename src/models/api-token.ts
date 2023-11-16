import {COLLECTION_API_TOKENS} from "../lib/contants";
import BaseModel from "./base";

class ApiTokenModel extends BaseModel {
    constructor(db:string="") {
        super(COLLECTION_API_TOKENS, db);
    }
}

export default ApiTokenModel;