import {COLLECTION_PAYMENTS} from "../lib/contants";
import BaseModel from "./base";

class PaymentsModel extends BaseModel {
    constructor(db:string="") {
        super(COLLECTION_PAYMENTS, db);
    }
}

export default PaymentsModel;