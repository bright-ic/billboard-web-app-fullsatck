import {COLLECTION_TRANSACTIONS, TRANSACTION_STATUS_INITIALIZED} from "../lib/contants";
import { generateRandomCodes, uniqid } from "../lib/utils";
import { ObjectType } from "../types";
import BaseModel from "./base";

class TransactionsModel extends BaseModel {
    constructor(db:string="") {
        super(COLLECTION_TRANSACTIONS, db);
    }

    async generateReference(add_ref_to_db:boolean=false, doc:ObjectType={}) {
        let transaction_reference:string = "";
        try {
            let count:number = 0;
            do {
                let random_ref:string[] = generateRandomCodes(1,12, 12);
                let trans_ref = random_ref.length > 0 && random_ref[0] ? random_ref[0] : uniqid();
                if(count > 6 && random_ref[0]) {
                    trans_ref = uniqid();
                } 
                if(trans_ref) {
                    const exist = await this.findByKeyValue('transaction_reference', trans_ref);
                    if(!exist) {
                        transaction_reference = trans_ref;
                    }
                }
                count++;
            } while (transaction_reference === "" && count < 10)

            if(add_ref_to_db && transaction_reference.trim() !== "") {
                const add_doc = {
                    ...doc,
                    transaction_reference: transaction_reference,
                    status: TRANSACTION_STATUS_INITIALIZED
                };
                this.insertOne(add_doc).then().catch();
            }
        } catch(e) {

        }
        return transaction_reference;
    }
}

export default TransactionsModel;