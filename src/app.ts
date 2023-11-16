import compression from "compression"
import cookieParser from "cookie-parser"

import express, { Application } from "express"
import helmet from "helmet";
import session from 'express-session';
import connect_redis from 'connect-redis';
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || '');
const RedisStore = connect_redis(session);
import UserModel from "./models/user";

const ExpressConfig = (): Application => {
  const app = express()
  app.use(compression())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  app.use(helmet())
  app.use(cookieParser())

  app.use(session({
    store: new RedisStore({ client: redis }),
    secret: process.env.SESSION_KEY || '',
    resave: false,
    saveUninitialized: false
  }));

  try {
    new UserModel();
  } catch(e:any) {}

  return app
}

export default ExpressConfig