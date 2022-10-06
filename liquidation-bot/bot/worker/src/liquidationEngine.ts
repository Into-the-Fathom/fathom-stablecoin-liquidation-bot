import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { LogLevel } from "../../helpers/config/config";
import { SmartContractFactory } from "../config/SmartContractFactory";
import { Web3Utils } from "../utils/Web3Utils";

export class LiquidationEngine{
    
    private readonly bookKeeperContract:any;
    public readonly liquidationEngineContract:any;
    private readonly networkId:number = 51;

    constructor(){
        try {
            this.networkId = parseInt(process.env.NETWORK_ID!)
            this.bookKeeperContract = Web3Utils.getContractInstance(SmartContractFactory.BookKeeper(this.networkId),this.networkId)
            this.liquidationEngineContract = Web3Utils.getContractInstance(SmartContractFactory.LiquidationEngine(this.networkId),this.networkId)
        } catch(exception) {
            console.error(exception);
        }
    }

    public async setupLiquidationEngine(){
        console.log(LogLevel.info(`Setting up liquidation engine for ${process.env.LIQUIDATOR_ADDRESS}...`));

        try {
            if(this.bookKeeperContract == undefined || 
                this.liquidationEngineContract == undefined) {
                console.error(LogLevel.error("Error setting up liquidation engine."))
                return;
            }

            await this.bookKeeperContract.methods.whitelist(SmartContractFactory.LiquidationEngine(this.networkId).address).send({from: process.env.LIQUIDATOR_ADDRESS, gas:1000000, gaslimit:30000});
            await this.bookKeeperContract.methods.whitelist(SmartContractFactory.FixedSpreadLiquidationStrategy(this.networkId).address).send({from: process.env.LIQUIDATOR_ADDRESS,gas:1000000, gaslimit:30000});

            console.log(LogLevel.info(`Minting stablecoing to liquidator...`));

            //Mint coins from deployer to signger, which is liquidation bot...
            //TODO: Need to revisit this post MVP demo... ideally this setup shouldn't be on BOT
            await this.bookKeeperContract.methods.mintUnbackedStablecoin(SmartContractFactory.SystemDebtEngine(this.networkId).address, process.env.LIQUIDATOR_ADDRESS, "3000000000000000000000000").send({from: process.env.LIQUIDATOR_ADDRESS});
        }catch(error){
            console.error(error);
        }
    }
}