"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventListener = void 0;
const SmartContractFactory_1 = require("../../shared/web3/SmartContractFactory");
const Logger_1 = __importDefault(require("../../shared/utils/Logger"));
const Web3EventsUtils_1 = require("../../shared/web3/Web3EventsUtils");
class EventListener {
    constructor(_consumer) {
        this.networkId = 51;
        this.consumer = _consumer;
        this.networkId = parseInt(process.env.NETWORK_ID);
        this.setupEventListner();
    }
    setupEventListner() {
        let options = {
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        //Listen for price update
        this.priceOracleContract = Web3EventsUtils_1.Web3EventsUtils.getContractInstance(SmartContractFactory_1.SmartContractFactory.PriceOracle(this.networkId), this.networkId);
        this.priceOracleContract.events.LogSetPrice(options).
            on('data', (event) => {
            //TODO: Check from previous price, if lesser then only call refetch the positions
            Logger_1.default.info(`Price update event occuered.`);
            if (this.consumer != undefined)
                this.consumer();
        }).
            on('error', (err) => {
            Logger_1.default.error(`Error connecting LogSetPrice Event ${err}`);
        });
        //Listen for New Position Opened
        this.positionManagerContract = Web3EventsUtils_1.Web3EventsUtils.getContractInstance(SmartContractFactory_1.SmartContractFactory.PositionManager(this.networkId), this.networkId);
        this.positionManagerContract.events.LogNewPosition(options).
            on('data', (event) => {
            Logger_1.default.info(`New position opened.`);
            if (this.consumer != undefined)
                this.consumer();
        }).
            on('error', (err) => {
            Logger_1.default.error(`Error connecting LogNewPosition Event ${err}`);
        });
    }
}
exports.EventListener = EventListener;
