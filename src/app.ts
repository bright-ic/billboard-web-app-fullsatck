import compression from "compression"
import cookieParser from "cookie-parser"

import express, { Application } from "express"
import helmet, { HelmetOptions } from "helmet";
import session from 'express-session';
import connect_redis from 'connect-redis';
import Redis from './services/redis';
const redis = new Redis(process.env.REDIS_URL || '');
const RedisStore = connect_redis(session);
import path from "path";
import expressLayouts from 'express-ejs-layouts';
import flash from "flash";
import { IS_DEV } from "./lib/contants";

const ExpressConfig = (): Application => {
  const app = express()
  app.use(compression())
  app.use(express.urlencoded({ extended: true, limit: '25mb' }))
  app.use(express.json({limit: '25mb'}));

  const helmetConfig:HelmetOptions = {};
  if(IS_DEV) {
    helmetConfig.strictTransportSecurity = false;
    helmetConfig.contentSecurityPolicy = false;
  }

  app.use(helmet({...helmetConfig}))
  app.use(cookieParser())

  app.set('views', path.join(__dirname, '/views'));
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(expressLayouts);
  app.set('layout', 'layouts/main');
  app.set("layout extractScripts", true)
  app.set("layout extractStyles", true)
  app.set("layout extractMetas", true)

  app.set('view engine', 'ejs');

  app.use(session({
    store: new RedisStore({ client: redis.get_connection() }),
    secret: process.env.SESSION_KEY || '',
    resave: false,
    saveUninitialized: false
  }));

  app.use(flash());

  return app
}

export default ExpressConfig