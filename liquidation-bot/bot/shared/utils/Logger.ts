import path from 'path';
import winston from 'winston'
import "winston-mongodb";
import {MongoDBConnectionOptions } from 'winston-mongodb';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// const { MongoDB }: { MongoDB: MongoDBTransportInstance } = require("winston-mongodb");


const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
//   new winston.transports.MongoDB({
//       level: 'info',
//       db: process.env.MONGODB_URL,
//       options: {
//           useUnifiedTopology: true
//       },
//       collection: 'position_manager_info',
//   } as MongoDBConnectionOptions),
//   new winston.transports.MongoDB({
//     level: 'error',
//     db: process.env.MONGODB_URL,
//     options: {
//         useUnifiedTopology: true
//     },
//     collection: 'position_manager_errors',
// } as MongoDBConnectionOptions),
]

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

export default Logger