import {COLLECTION_USERS} from "../lib/contants";
import BaseModel from "./base";

class UserModel extends BaseModel {
    constructor(db:string="") {
        super(COLLECTION_USERS, db);
    }
}

export default UserModel;