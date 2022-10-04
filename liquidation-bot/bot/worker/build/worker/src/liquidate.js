"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Liquidate = void 0;
const ethers_1 = require("ethers");
const MaxUint256 = require("@ethersproject/constants");
const addresses_js_1 = require("../../helpers/utils/addresses.js");
const config_1 = require("../../helpers/config/config");
const queue_fifo_1 = __importDefault(require("queue-fifo"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: path_1.default.resolve(__dirname, '../../../../.env') });
class Liquidate {
    constructor(_liquidationEngineAbiContract) {
        //    private arrPositions:Position[];
        this.fetchHandle = null;
        // this.arrPositions = [];
        this.badPositionsQueue = new queue_fifo_1.default();
        this.liquidationEngineAbiContract = _liquidationEngineAbiContract;
        if (this.fetchHandle !== null)
            clearInterval(this.fetchHandle);
        //TODO: Check if we can do it in better way
        this.fetchHandle = setInterval(this.checkAndLiquidate.bind(this), 5 * 1000);
        const eventFilter = {
            address: addresses_js_1.fixedSpreadLiquidationStrategyAddress,
            topics: [
                ethers_1.utils.id("LogFixedSpreadLiquidate(bytes32,uint256,uint256,address,uint256,uint256,address,address,uint256,uint256,uint256,uint256)"),
            ]
        };
        config_1.provider.on(eventFilter, (log, event) => {
            let topics = log.topics;
            let topic = topics[2].replace('0x000000000000000000000000', '0x');
            console.log(config_1.LogLevel.keyEvent('============================================================================'));
            console.log(config_1.LogLevel.keyEvent(`** Liquidation Complete for ${topic} **`));
            console.log(config_1.LogLevel.keyEvent('============================================================================'));
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
                console.log(config_1.LogLevel.keyEvent(`Performing liquidation on position ${position.address}`));
                await this.liquidationEngineAbiContract.liquidate(config_1.COLLATERAL_POOL_ID, position.address, position.debtShare, MaxUint256.MaxUint256, process.env.LIQUIDATOR_ADDRESS, "0x00");
            }
            catch (exception) {
                console.log(config_1.LogLevel.error(exception));
            }
        }
    }
}
exports.Liquidate = Liquidate;
