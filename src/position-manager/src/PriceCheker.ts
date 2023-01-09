import Logger from "../../shared/utils/Logger";
import { SmartContractFactory } from "../../shared/web3/SmartContractFactory";
import { Web3Utils } from "../../shared/web3/Web3Utils";
import { Constants } from "./utils/Constants";
const opentracing = require('opentracing');


class PriceChecker {
    private fetchHandle: NodeJS.Timeout | null = null;
    private consumer: (() => Promise<void> | void) | undefined;
    private readonly priceCheckInterval:number = 5000;
    private readonly timeAllowedSincePriceUpdateInSeconds:number = 25 * 60; 
    private readonly tracer:any;
    private readonly delayFathomOraclePriceFeedContract:any;
    private readonly priceOracleContract:any;
    private readonly networkId:number = 51;

    constructor(tracer:any){
        try {
            this.networkId = parseInt(process.env.NETWORK_ID!)
            
            //this.priceCheckInterval = parseInt(process.env.PRICE_CHECK_INTERVAL_IN_MS!)
            this.priceCheckInterval = 25*60*1000
            
            this.timeAllowedSincePriceUpdateInSeconds = parseInt(process.env.TIME_ALLOWED_SINCE_PRICE_UPDATE_IN_SECONDS!)
            this.tracer = tracer
            
            //this.delayFathomOraclePriceFeedContract = Web3Utils.getContractInstance(SmartContractFactory.DelayFathomOraclePriceFeed(this.networkId),this.networkId)
            
            this.priceOracleContract =  Web3Utils.getContractInstance(SmartContractFactory.PriceOracle(this.networkId),this.networkId)
        } catch(exception) {
            console.error(exception);
        }
    }

    public async init(_consumer: () => Promise<void> | void): Promise<void> {
        this.consumer = _consumer;
        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);
        // this.fetchHandle = setInterval(this.checkPrice.bind(this), this.priceCheckInterval);
        this.fetchHandle = setInterval(this.updateOnChainPriceV2.bind(this), this.priceCheckInterval);
    }

    //Check the latest price of underlying collatral
    private async checkPrice(): Promise<void> {
        const span = this.tracer.startSpan("price-check");
        const ctx = { span };
        span.setTag("check_price", "WXDC");
        Logger.info(`Checking price from chain.`)

        if(this.delayFathomOraclePriceFeedContract == undefined) {
            Logger.error('Error setting up delayFathomOraclePriceFeedContract.')
            ctx.span.log({ event: "error", message: 'Error setting up delayFathomOraclePriceFeedContract.'});
            return;
        }

        // Get the price from chain
        let {price, lastUpdateTS} = await this.delayFathomOraclePriceFeedContract.methods.currentPrice().call()
        Logger.info(`Current price : ${price} lastUpdateTS: ${lastUpdateTS}`)
        ctx.span.log({ event: "current_price", message: price});
        ctx.span.log({ event: "last_update_timestamp", message: lastUpdateTS});

        let web3 = await Web3Utils.getWeb3Instance(this.networkId)

        let currentBlock = await web3.eth.getBlockNumber()
        Logger.info(`Current block : ${currentBlock}`)
        ctx.span.log({ event: "current_block", message: currentBlock});

        const currentblock = await web3.eth.getBlock(currentBlock)
        let currentTimeStamp = currentblock.timestamp
        Logger.info(`Current timestamp : ${currentTimeStamp}`)
        ctx.span.log({ event: "current_timestamp", message: currentTimeStamp});

        let timeElapsed = currentTimeStamp - lastUpdateTS
        Logger.info(`Time elapsed since last price update: ${Math.floor(timeElapsed/60)} minutes ${timeElapsed%60} seconds`)
        ctx.span.log({ event: "time_since_last_price_update", message: `${Math.floor(timeElapsed/60)} minutes ${timeElapsed%60} seconds`});

        //If total time elased
        if (timeElapsed > this.timeAllowedSincePriceUpdateInSeconds){
            Logger.warn(`Price elapsed, updating from BOT`)
            ctx.span.log({ event: "price_elapsed", message: `Price elapsed, updating price.`});

            await this.updateOnChainPrice(ctx)
        }

        span.finish();
    }

    private async updateOnChainPrice(ctx:any){
        ctx = {
            span: this.tracer.startSpan("update-price", { childOf: ctx.span }),
        };
        try{
            ctx.span.setTag("collateral", "WXDC");

            Logger.info(`Updating price on chain`)
            await this.priceOracleContract.methods.
                                        setPrice(Constants.WXDC_COLLATRAL_ID).
                                        send(
                                        {
                                            from: process.env.LIQUIDATOR_ADDRESS, 
                                            gasLimit: 1000000
                                        })
        } catch(exception) {
            Logger.error(JSON.stringify(exception));
            ctx.span.setTag(opentracing.Tags.ERROR, true);
            ctx.span.log({ event: "error", "error.object": JSON.stringify(exception) })
        }finally{
            ctx.span.finish()
        }
    }

    //TODO: This is temporary code and will be removed in future.. in future original version of htis method will be used
    private async updateOnChainPriceV2(){
        const span = this.tracer.startSpan("update-price");
        try{
            span.setTag("collateral", "WXDC");

            Logger.info(`Updating price on chain`)
            await this.priceOracleContract.methods.
                                        setPrice(Constants.WXDC_COLLATRAL_ID).
                                        send(
                                        {
                                            from: process.env.LIQUIDATOR_ADDRESS, 
                                            gasLimit: 1000000
                                        })
        } catch(exception) {
            Logger.error(JSON.stringify(exception));
            span.setTag(opentracing.Tags.ERROR, true);
            span.log({ event: "error", "error.object": JSON.stringify(exception) })
        }finally{
            span.finish()
        }
    }

    public stop(): void {
        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);
    }
}

export default PriceChecker;