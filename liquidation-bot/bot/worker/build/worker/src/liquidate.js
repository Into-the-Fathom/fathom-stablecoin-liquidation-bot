"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Liquidator = void 0;
const MaxUint256 = require("@ethersproject/constants");
const queue_fifo_1 = __importDefault(require("queue-fifo"));
const Web3EventsUtils_1 = require("../../shared/web3/Web3EventsUtils");
const SmartContractFactory_1 = require("../../shared/web3/SmartContractFactory");
const Web3Utils_1 = require("../../shared/web3/Web3Utils");
const Logger_1 = __importDefault(require("../../shared/utils/Logger"));
class Liquidator {
    constructor() {
        this.fetchHandle = null;
        this.networkId = 51;
        this.liquidationInterval = 5000;
        this.networkId = parseInt(process.env.NETWORK_ID);
        this.liquidationInterval = parseInt(process.env.LIQUIDATION_INTERVAL);
        this.liquidationEngineContract = Web3Utils_1.Web3Utils.getContractInstance(SmartContractFactory_1.SmartContractFactory.LiquidationEngine(this.networkId), this.networkId);
        this.badPositionsQueue = new queue_fifo_1.default();
        if (this.fetchHandle !== null)
            clearInterval(this.fetchHandle);
        //TODO: Check if we can do it in better way
        this.fetchHandle = setInterval(this.checkAndLiquidate.bind(this), this.liquidationInterval);
        let options = {
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        //Listen for liquidation complete event
        this.fixedSpreadLiquidationStrategyContract = Web3EventsUtils_1.Web3EventsUtils.getContractInstance(SmartContractFactory_1.SmartContractFactory.FixedSpreadLiquidationStrategy(this.networkId), this.networkId);
        this.fixedSpreadLiquidationStrategyContract.events.LogFixedSpreadLiquidate(options).
            on('data', (event) => {
            Logger_1.default.info(`** Liquidation Complete for ${JSON.stringify(event)} **`);
        }).
            on('error', (err) => {
            Logger_1.default.error(`Error connecting LogFixedSpreadLiquidate Event: ${err}`);
        });
    }
    addLiquidationPosition(position) {
        this.badPositionsQueue.enqueue(position);
    }
    removeLiquidationPosition(position) {
        this.badPositionsQueue.dequeue();
    }
    async checkAndLiquidate() {
        if (this.badPositionsQueue.isEmpty())
            return;
        let position = this.badPositionsQueue.dequeue();
        if (position != undefined) {
            try {
                Logger_1.default.info(`Performing liquidation on position ${position.positionAddress}`);
                //TODO: Find the collatral pool id and replace it as first parameter
                await this.liquidationEngineContract.methods.liquidate(position.collatralPool, position.positionAddress, position.debtShare, MaxUint256.MaxUint256, process.env.LIQUIDATOR_ADDRESS, "0x00").send({ from: process.env.LIQUIDATOR_ADDRESS });
            }
            catch (exception) {
                Logger_1.default.error(`Error liquidating position ${position.positionAddress} : ${JSON.stringify(exception)}`);
            }
        }
    }
}
exports.Liquidator = Liquidator;
