import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import {liquidationEngineContractAddress, 
        bookKeeperAddress, 
        fixedSpreadLiquidationStrategyAddress,
        deployerAddress}
from '../../helpers/utils/addresses.js'

import { liquidatorWallet, LogLevel } from "../../helpers/config/config";


export class LiquidationEngine{
    
    private readonly bookKeeperContract;
    public readonly liquidationEngineAbiContract;

    constructor(){

        let bookKeeperAbi = [
            'function whitelist(address toBeWhitelistedAddress) external',
            'function mintUnbackedStablecoin(address from,address to,uint256 value) external;'
            ];

        let liquidationEngineAbi = [
            'function liquidate(bytes32 _collateralPoolId,address _positionAddress,uint256 _debtShareToBeLiquidated,uint256 _maxDebtShareToBeLiquidated,address _collateralRecipient,bytes calldata _data) external',
        ];

        try {
            this.bookKeeperContract = new ethers.Contract(bookKeeperAddress, bookKeeperAbi, liquidatorWallet);
            this.liquidationEngineAbiContract = new ethers.Contract(liquidationEngineContractAddress, liquidationEngineAbi, liquidatorWallet);
        } catch(exception) {
            console.error(exception);
        }
    }

    public async setupLiquidationEngine(){
        console.log(LogLevel.info(`Setting up liquidation engine...`));
        if(this.bookKeeperContract == undefined || 
            this.liquidationEngineAbiContract == undefined) {
            console.error(LogLevel.error("Error setting up liquidation engine."))
            return;
        }

        await this.bookKeeperContract.whitelist(this.liquidationEngineAbiContract.address);
        await this.bookKeeperContract.whitelist(fixedSpreadLiquidationStrategyAddress);
        //Mint coins from deployer to signger, which is liquidation bot...

        console.log(LogLevel.info(`Minting stablecoing to liquidator...`));
        await this.bookKeeperContract.mintUnbackedStablecoin(deployerAddress, process.env.LIQUIDATOR_ADDRESS, parseUnits("3000", 45))
    }
}