
import IoRedis, { RedisKey } from 'ioredis';
import {REDIS_URL} from "../lib/contants";

export type REDIS_CONNECTION = IoRedis;

class Redis {
  static connection: REDIS_CONNECTION;

  constructor(env_url:string=''){
    if(!Redis.connection) {
      const redis_url: string = env_url ? env_url : REDIS_URL;
      Redis.connection = new IoRedis(redis_url);
    }
  }
  async get(key:RedisKey) {
    return Redis.connection.get(key);
  }
  async del(key: any) {
    return Redis.connection.del(key);
  }
  async hgetall(key:any) {
    return Redis.connection.hgetall(key);
  }
  async hget(key:RedisKey, field:any) {
    return Redis.connection.hget(key, field);
  }
  async hmget(key:any, values:any) {
    return Redis.connection.hmget(key, values)
  }
  async hset(key:string, field:string, data:any) {
    return Redis.connection.hset(key, field, data);
  }
  async rpush(key:any, data:any) {
    return Redis.connection.rpush(key, data);
  }
  async lpop(key:any) {
    return Redis.connection.lpop(key);
  }
  async hdel(key:any, value:any) {
    return Redis.connection.hdel(key, value);
  }
  async set(key:RedisKey, value:any, timestring='EX', ttl=0) {
    return Redis.connection.set(key, value, 'EX', ttl)
  }
  get_connection() {
    return Redis.connection;
  }
  disconnect() {
    return Redis.connection.disconnect();
  }
}

export default Redis;
