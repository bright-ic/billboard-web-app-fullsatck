import _, { result } from "lodash";
import BaseService from "./base";
import RedisService from "./redis";
import { Request } from 'express';
import {
    REDIS_URL, API_PROVIDER_FELA_MP, REDIS_KEY_API_TOKEN, REDIS_KEY_FELA_MP_API_TOKEN_FIELD_NAME,
    IS_DEV
} from "../lib/contants";
import ApiTokenModel from "../models/api-token";
import FelaMP from "../api/fela-mp-api";

export type RedisTokenType = {token: string, expires: number};
const token_expiration_timeout: number = 60 * 55 * 1000; // 55 mins in mini secs
/**
 * Handles api token generation requests for third party APIs
 */
class TokenHandler extends BaseService {

    redis: RedisService;

    constructor(req?: Request | null) {
        super(req);
        this.redis = new RedisService(REDIS_URL);
    }

    async getApiToken(api_provider:string = API_PROVIDER_FELA_MP): Promise<string | null> {
        let provider: string = '';
        let redis_api_token_field_name: string = '';
        switch(api_provider) {
            case API_PROVIDER_FELA_MP:
                provider = API_PROVIDER_FELA_MP;
                redis_api_token_field_name = REDIS_KEY_FELA_MP_API_TOKEN_FIELD_NAME;
                break;
            default:
                provider = API_PROVIDER_FELA_MP;
                redis_api_token_field_name = REDIS_KEY_FELA_MP_API_TOKEN_FIELD_NAME;
        }
        if(_.isEmpty(provider)) {
            return null;
        }
        let api_token: string | null = null;
        let token_data: RedisTokenType = {token: '', expires: 0};
        if(!_.isEmpty(REDIS_KEY_API_TOKEN) && !_.isEmpty(redis_api_token_field_name)) {
            // Get token from redis cache
            let existing_token: string | null = await this.redis.hget(REDIS_KEY_API_TOKEN, redis_api_token_field_name);
            if(existing_token) {
                token_data = JSON.parse(existing_token);
            }
        }
        const api_token_model = new ApiTokenModel();
        let token_record_id: string = '';
        if(_.isEmpty(token_data)) {
            // try getting token from db collection
            const token_result = await api_token_model.findByKeyValue('provider', redis_api_token_field_name);
            if(token_result && _.has(token_result, "_id")) {
                token_record_id = _.toString(token_result._id);
                if(_.has(token_result,"token")) {
                    token_data = {token: token_result.token, expires: token_result.expires || 0};
                }
            }
        }
        const current_timestamp = new Date().getTime();
        if(token_data && token_data.token && token_data.expires > current_timestamp) {
            return token_data.token || "";
        }
        const token_api_provider_service = new FelaMP(); // default
        // Fetch new api token from provider
        if(provider === API_PROVIDER_FELA_MP) {
            // const token_api_provider_service = new FelaMP(); // already the default
            
        }
        const api_token_response = await token_api_provider_service.getApiToken();
        if(api_token_response.success && api_token_response.data) {
            api_token = api_token_response.data;
            const insert_doc = {
                provider: redis_api_token_field_name,
                token: api_token,
                expires: (new Date().getTime() + token_expiration_timeout)
            }
            const redis_insert_doc = {...insert_doc};
            let upsert_result: any;
            if(!_.isEmpty(token_record_id)) {
                upsert_result = api_token_model.updateOne({_id: ApiTokenModel.toObjectId(token_record_id)}, insert_doc)
            } else {
                upsert_result = api_token_model.insertOne(insert_doc);
            }
            if(upsert_result && !_.has(upsert_result, '_db_error')) {
                this.redis.hset(REDIS_KEY_API_TOKEN, redis_api_token_field_name, JSON.stringify(redis_insert_doc)).then().catch();
            }
        }
        
        return api_token || "";
    }

}

export default TokenHandler;