"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidationEngine = void 0;
const Logger_1 = __importDefault(require("../../shared/utils/Logger"));
const SmartContractFactory_1 = require("../../shared/web3/SmartContractFactory");
const Web3Utils_1 = require("../../shared/web3/Web3Utils");
class LiquidationEngine {
    constructor() {
        this.networkId = 51;
        try {
            this.networkId = parseInt(process.env.NETWORK_ID);
            this.bookKeeperContract = Web3Utils_1.Web3Utils.getContractInstance(SmartContractFactory_1.SmartContractFactory.BookKeeper(this.networkId), this.networkId);
            this.liquidationEngineContract = Web3Utils_1.Web3Utils.getContractInstance(SmartContractFactory_1.SmartContractFactory.LiquidationEngine(this.networkId), this.networkId);
        }
        catch (exception) {
            console.error(exception);
        }
    }
    async setupLiquidationEngine() {
        Logger_1.default.info(`Setting up liquidation engine for ${process.env.LIQUIDATOR_ADDRESS}`);
        try {
            if (this.bookKeeperContract == undefined ||
                this.liquidationEngineContract == undefined) {
                Logger_1.default.error('Error setting up liquidation engine.');
                return;
            }
            await this.bookKeeperContract.methods.whitelist(SmartContractFactory_1.SmartContractFactory.LiquidationEngine(this.networkId).address).send({ from: process.env.LIQUIDATOR_ADDRESS });
            await this.bookKeeperContract.methods.whitelist(SmartContractFactory_1.SmartContractFactory.FixedSpreadLiquidationStrategy(this.networkId).address).send({ from: process.env.LIQUIDATOR_ADDRESS });
            Logger_1.default.info(`Minting stablecoing to liquidator...`);
            //Mint coins from deployer to signger, which is liquidation bot...
            //TODO: Need to revisit this post MVP demo... ideally this setup shouldn't be on BOT
            await this.bookKeeperContract.methods.mintUnbackedStablecoin(SmartContractFactory_1.SmartContractFactory.SystemDebtEngine(this.networkId).address, process.env.LIQUIDATOR_ADDRESS, "3000000000000000000000000000000000000000000000000").send({ from: process.env.LIQUIDATOR_ADDRESS });
        }
        catch (error) {
            Logger_1.default.error(`Error in setupLiquidationEngine: ${error}`);
        }
    }
}
exports.LiquidationEngine = LiquidationEngine;
