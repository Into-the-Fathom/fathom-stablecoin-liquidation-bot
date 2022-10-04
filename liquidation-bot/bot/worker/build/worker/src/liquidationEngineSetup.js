"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidationEngine = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const addresses_js_1 = require("../../helpers/utils/addresses.js");
const config_1 = require("../../helpers/config/config");
class LiquidationEngine {
    constructor() {
        let bookKeeperAbi = [
            'function whitelist(address toBeWhitelistedAddress) external',
            'function mintUnbackedStablecoin(address from,address to,uint256 value) external;'
        ];
        let liquidationEngineAbi = [
            'function liquidate(bytes32 _collateralPoolId,address _positionAddress,uint256 _debtShareToBeLiquidated,uint256 _maxDebtShareToBeLiquidated,address _collateralRecipient,bytes calldata _data) external',
        ];
        try {
            this.bookKeeperContract = new ethers_1.ethers.Contract(addresses_js_1.bookKeeperAddress, bookKeeperAbi, config_1.liquidatorWallet);
            this.liquidationEngineAbiContract = new ethers_1.ethers.Contract(addresses_js_1.liquidationEngineContractAddress, liquidationEngineAbi, config_1.liquidatorWallet);
        }
        catch (exception) {
            console.error(exception);
        }
    }
    async setupLiquidationEngine() {
        console.log(config_1.LogLevel.info(`Setting up liquidation engine...`));
        if (this.bookKeeperContract == undefined ||
            this.liquidationEngineAbiContract == undefined) {
            console.error(config_1.LogLevel.error("Error setting up liquidation engine."));
            return;
        }
        await this.bookKeeperContract.whitelist(this.liquidationEngineAbiContract.address);
        await this.bookKeeperContract.whitelist(addresses_js_1.fixedSpreadLiquidationStrategyAddress);
        //Mint coins from deployer to signger, which is liquidation bot...
        console.log(config_1.LogLevel.info(`Minting stablecoing to liquidator...`));
        await this.bookKeeperContract.mintUnbackedStablecoin(addresses_js_1.deployerAddress, process.env.LIQUIDATOR_ADDRESS, (0, utils_1.parseUnits)("3000", 45));
    }
}
exports.LiquidationEngine = LiquidationEngine;
