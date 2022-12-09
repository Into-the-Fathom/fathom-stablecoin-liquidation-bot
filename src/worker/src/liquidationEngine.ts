import Logger from "../../shared/utils/Logger";
import { SmartContractFactory } from "../../shared/web3/SmartContractFactory";
import { Web3Utils } from "../../shared/web3/Web3Utils";
import { RedisClient } from "../../shared/utils/RedisClient";


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
        Logger.info(`Setting up liquidation engine for ${process.env.LIQUIDATOR_ADDRESS}`)

        try {
            await RedisClient.getInstance().setValue('initialized',0)

            if(this.bookKeeperContract == undefined || 
                this.liquidationEngineContract == undefined) {
                Logger.error('Error setting up liquidation engine.')
                return;
            }


            let web3 = Web3Utils.getWeb3Instance(this.networkId)
            let web3BatchRequest = new web3.BatchRequest()

            Logger.info(`Whitelisting LiquidationEngine...`)
            await web3BatchRequest.add(this.bookKeeperContract.methods.whitelist(SmartContractFactory.LiquidationEngine(this.networkId).address).send.request({from: process.env.LIQUIDATOR_ADDRESS},
            (error:Error, txnHash:string) => {
                if(error)
                    Logger.error(`Error whitelist LiquidationEngine: ${error} tx: ${txnHash}`)
                else
                    Logger.info(`Tx hash for whitelist LiquidationEngine: ${txnHash}`)

            }))

            Logger.info(`Whitelisting FixedSpreadLiquidationStrategy...`)
            await web3BatchRequest.add(this.bookKeeperContract.methods.whitelist(SmartContractFactory.FixedSpreadLiquidationStrategy(this.networkId).address).send.request({from: process.env.LIQUIDATOR_ADDRESS},
            (error:Error, txnHash:string) => {
                if(error)
                    Logger.error(`Error whitelist FixedSpreadLiquidationStrategy: ${error} tx: ${txnHash}`)
                else
                    Logger.info(`Tx hash for whitelist FixedSpreadLiquidationStrategy: ${txnHash}`)

            }))


            //Mint coins from deployer to signger, which is liquidation bot...
            //TODO: Need to revisit this post MVP demo... ideally this setup shouldn't be on BOT
            Logger.info(`Minting Unbacked Stablecoins...`)
            await web3BatchRequest.add(this.bookKeeperContract.methods.mintUnbackedStablecoin(SmartContractFactory.SystemDebtEngine(this.networkId).address, process.env.LIQUIDATOR_ADDRESS, "3000000000000000000000000000000000000000000000000").send.request({from: process.env.LIQUIDATOR_ADDRESS},
            (error:Error, txnHash:string) => {
                if(error)
                    Logger.error(`Error whitelist mintUnbackedStablecoin: ${error} tx: ${txnHash}`)
                else
                    Logger.info(`Tx hash for mintUnbackedStablecoin ${txnHash}`)
            }))

            await web3BatchRequest.execute()

            Logger.info(`Liquidator setup complete...`)

            await RedisClient.getInstance().setValue('initialized',1)
            
        }catch(error){
            Logger.error(`Error in setupLiquidationEngine: ${JSON.stringify(error)}`)
        }
    }
}