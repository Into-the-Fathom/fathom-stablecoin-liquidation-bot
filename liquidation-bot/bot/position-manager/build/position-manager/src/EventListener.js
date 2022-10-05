"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventListener = void 0;
const config_1 = require("../../helpers/config/config");
const SmartContractFactory_1 = require("./config/SmartContractFactory");
const Web3EventsUtils_1 = require("./utils/Web3EventsUtils");
class EventListener {
    constructor(_consumer) {
        this.networkId = 51;
        this.consumer = _consumer;
        process.env.NETWORK_ID ?? this.networkId === process.env.NETWORK_ID;
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
            console.log(config_1.LogLevel.keyEvent('================================'));
            console.log(config_1.LogLevel.keyEvent(`Price update event occuered.`));
            console.log(config_1.LogLevel.keyEvent('================================'));
            if (this.consumer != undefined)
                this.consumer();
        }).
            on('error', (err) => {
            console.log(config_1.LogLevel.error(err));
        });
        //Listen for New Position Opened
        this.positionManagerContract = Web3EventsUtils_1.Web3EventsUtils.getContractInstance(SmartContractFactory_1.SmartContractFactory.PositionManager(this.networkId), this.networkId);
        this.positionManagerContract.events.LogNewPosition(options).
            on('data', (event) => {
            console.log(config_1.LogLevel.keyEvent('================================'));
            console.log(config_1.LogLevel.keyEvent(`New position opened.`));
            console.log(config_1.LogLevel.keyEvent('================================'));
            if (this.consumer != undefined)
                this.consumer();
        }).
            on('error', (err) => {
            console.log(config_1.LogLevel.error(err));
        });
    }
}
exports.EventListener = EventListener;
