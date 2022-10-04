"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLLATERAL_POOL_ID = exports.LogLevel = exports.liquidatorWallet = exports.provider = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const dotenv_1 = require("dotenv");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)({ path: path_1.default.resolve(__dirname, '../../../../.env') });
const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
exports.provider = provider;
const liquidatorWallet = new ethers_1.ethers.Wallet(process.env.LIQUIDATOR_PRIVATE_KEY, provider);
exports.liquidatorWallet = liquidatorWallet;
const LogLevel = {
    info: chalk_1.default.bold.yellow,
    debug: chalk_1.default.black,
    error: chalk_1.default.bold.red,
    keyEvent: chalk_1.default.bold.green
};
exports.LogLevel = LogLevel;
const COLLATERAL_POOL_ID = (0, utils_1.formatBytes32String)("USDT");
exports.COLLATERAL_POOL_ID = COLLATERAL_POOL_ID;
