"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
require("winston-mongodb");
require('dotenv').config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
// const { MongoDB }: { MongoDB: MongoDBTransportInstance } = require("winston-mongodb");
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const transports = [
    new winston_1.default.transports.Console(),
    new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),
    new winston_1.default.transports.File({ filename: 'logs/all.log' }),
    new winston_1.default.transports.MongoDB({
        level: 'info',
        db: process.env.MONGODB_URL,
        options: {
            useUnifiedTopology: true
        },
        collection: 'info',
    }),
    new winston_1.default.transports.MongoDB({
        level: 'error',
        db: process.env.MONGODB_URL,
        options: {
            useUnifiedTopology: true
        },
        collection: 'errors',
    }),
];
const Logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
});
exports.default = Logger;
