import Logger from "../../shared/utils/Logger";
import { SmartContractFactory } from "../../shared/web3/SmartContractFactory";
import { Web3Utils } from "../../shared/web3/Web3Utils";
import { RedisClient } from "../../shared/utils/RedisClient";
const opentracing = require('opentracing');


export class LiquidationEngine{
    
    private readonly bookKeeperContract:any;
    public readonly liquidationEngineContract:any;
    private readonly networkId:number = 51;
    private readonly tracer:any;

    constructor(tracer:any){
        try {
            this.tracer = tracer
            this.networkId = parseInt(process.env.NETWORK_ID!)
            this.bookKeeperContract = Web3Utils.getContractInstance(SmartContractFactory.BookKeeper(this.networkId),this.networkId)
            this.liquidationEngineContract = Web3Utils.getContractInstance(SmartContractFactory.LiquidationEngine(this.networkId),this.networkId)
        } catch(exception) {
            console.error(exception);
        }
    }

    public async setupLiquidationEngine(ctx:any){
        Logger.info(`Setting up liquidation engine for ${process.env.LIQUIDATOR_ADDRESS}`)
        ctx = {
            span: this.tracer.startSpan("setup-liquidation-engine", { childOf: ctx.span }),
        };

        try {
            ctx.span.setTag("liquidator-address", process.env.LIQUIDATOR_ADDRESS);
            await RedisClient.getInstance().setValue('initialized',0)

            if(this.bookKeeperContract == undefined || 
                this.liquidationEngineContract == undefined) {
                Logger.error('Error initializing bookKeeperContract.')
                ctx.span.setTag(opentracing.Tags.ERROR, true);
                ctx.span.log({ event: "error", "error.message": 'Error initializing bookKeeperContract'  })
                return;
            }


            let web3 = Web3Utils.getWeb3Instance(this.networkId)
            let web3BatchRequest = new web3.BatchRequest()

            let isLiqEngineWhitelisted = await this.bookKeeperContract.methods.positionWhitelist(process.env.LIQUIDATOR_ADDRESS,SmartContractFactory.LiquidationEngine(this.networkId).address).call()
            if(isLiqEngineWhitelisted <= 0){
                Logger.info(`Whitelisting LiquidationEngine...`)
                
                ctx.span.log(
                    "event", "Whitelisting LiquidationEngine"
                );

                await web3BatchRequest.add(this.bookKeeperContract.methods.whitelist(SmartContractFactory.LiquidationEngine(this.networkId).address).send.request({from: process.env.LIQUIDATOR_ADDRESS},
                    (error:Error, txnHash:string) => {
                        const span = this.tracer.startSpan("callback-whitelist-liquidation-engine");
                        if(error){
                            Logger.error(`Error whitelist LiquidationEngine: ${error} tx: ${txnHash}`)
                            span.setTag(opentracing.Tags.ERROR, true);
                            span.log({ event: "error", "error.message": `Error whitelist LiquidationEngine: ${error} tx: ${txnHash}`, "tx-hash": txnHash  })
                        }else
                            Logger.info(`Tx hash for whitelist LiquidationEngine: ${txnHash}`)
                            span.log({
                                "event": "transaction sent to whitelist",
                                "tx-hash": txnHash
                        });

                        span.finish()
                    }))
            }
            else{
                Logger.info(`LiquidationEngine already whitelisted...`)
                ctx.span.log(
                    "event", 'LiquidationEngine already whitelisted...'
                );
            }

            let isFixedSpreadLiquidationStrategyWhitelisted = await this.bookKeeperContract.methods.positionWhitelist(process.env.LIQUIDATOR_ADDRESS,SmartContractFactory.FixedSpreadLiquidationStrategy(this.networkId).address).call()
            if(isFixedSpreadLiquidationStrategyWhitelisted <= 0){
                Logger.info(`Whitelisting FixedSpreadLiquidationStrategy...`)
                await web3BatchRequest.add(this.bookKeeperContract.methods.whitelist(SmartContractFactory.FixedSpreadLiquidationStrategy(this.networkId).address).send.request({from: process.env.LIQUIDATOR_ADDRESS},
                    (error:Error, txnHash:string) => {
                        const span = this.tracer.startSpan("callback-whitelist-fixedSpreadLiquidationStrategy");
                        if(error){
                            span.setTag(opentracing.Tags.ERROR, true);
                            span.log({ event: "error", "error.message": `Error whitelist FixedSpreadLiquidationStrategy: ${error}`, "tx-hash": txnHash  })
                            Logger.error(`Error whitelist FixedSpreadLiquidationStrategy: ${error} tx: ${txnHash}`)
                        }
                        else{
                            Logger.info(`Tx hash for whitelist FixedSpreadLiquidationStrategy: ${txnHash}`)
                            span.log({
                                "event": "Tx hash for whitelist FixedSpreadLiquidationStrategy",
                                "tx-hash": txnHash
                            });
                        }
                        span.finish()
                    }))
            }else{
                Logger.info(`FixedSpreadLiquidationStrategy already whitelisted...`)
                ctx.span.log({
                    "event": "FixedSpreadLiquidationStrategy already whitelisted..."
                });
            }

            //Mint coins from deployer to signger, which is liquidation bot...
            Logger.info(`Minting Unbacked Stablecoins...`)
            ctx.span.log({
                "event": "minting Unbacked Stablecoins"
            });

            await web3BatchRequest.add(this.bookKeeperContract.methods.mintUnbackedStablecoin(SmartContractFactory.SystemDebtEngine(this.networkId).address, process.env.LIQUIDATOR_ADDRESS, "3000000000000000000000000000000000000000000000000").send.request({from: process.env.LIQUIDATOR_ADDRESS},
            (error:Error, txnHash:string) => {
                const span = this.tracer.startSpan("callback-whitelist-mintUnbackedStablecoin");
                if(error){
                    span.setTag(opentracing.Tags.ERROR, true);
                    Logger.error(`Error whitelist mintUnbackedStablecoin: ${error} tx: ${txnHash}`)
                    span.log({ event: "error", "error.message": `Error whitelist mintUnbackedStablecoin: ${error}`, "tx-hash": txnHash  })
                }
                else{
                    Logger.info(`Tx hash for mintUnbackedStablecoin ${txnHash}`)
                    span.log({
                        "event": "Tx hash for mintUnbackedStablecoin",
                        "tx-hash": txnHash
                    });
                }
                span.finish()
            }))

            ctx.span.log({
                "event": "calling web3BatchRequest.execute()"
            });
            await web3BatchRequest.execute()

            await RedisClient.getInstance().setValue('initialized',1)
            Logger.info(`Liquidator setup complete...`)
            ctx.span.log({
                "event": "liquidator setup complete..."
            });
           
        }catch(error){
            Logger.error(`Error in setupLiquidationEngine: ${JSON.stringify(error)}`)
            ctx.span.setTag(opentracing.Tags.ERROR, true);
            ctx.span.log({ event: "error", "error.message": JSON.stringify(error)  })
        }finally{
            ctx.span.finish()
        }
    }
}