import Position from '../../shared/types/Position'
import {ILiquidatedPositions} from '../../shared/types/interfaces/ILiquidatedPositions'

const MaxUint256 = require("@ethersproject/constants");
import Queue from 'queue-fifo';
import { Web3EventsUtils } from "../../shared/web3/Web3EventsUtils";
import { SmartContractFactory } from "../../shared/web3/SmartContractFactory";
import { Web3Utils } from "../../shared/web3/Web3Utils";
import Logger from "../../shared/utils/Logger";
import { RedisClient } from "../../shared/utils/RedisClient";
import BigNumber from "bignumber.js";
import { retry } from 'ts-retry-promise';
import { BindOptions } from 'dgram';
const opentracing = require('opentracing');



export class Liquidator{

    private badPositionsQueue:Queue<Position>;

    private fetchHandle: NodeJS.Timeout | null = null;
    private readonly liquidationEngineContract:any;
    private readonly fixedSpreadLiquidationStrategyContract:any;
    private readonly networkId:number = 51;
    private readonly liquidationInterval:number = 5000;
    private readonly web3BatchRequest;
    private readonly batchSize:number = 100;
    private readonly tracer:any;


    constructor(tracer:any) {
        this.networkId = parseInt(process.env.NETWORK_ID!)
        this.liquidationInterval = parseInt(process.env.LIQUIDATION_INTERVAL!)
        this.batchSize = parseInt(process.env.LIQUIDATION_BATCH_SIZE!)
        this.tracer = tracer

        let web3 = Web3Utils.getWeb3Instance(this.networkId)
        this.web3BatchRequest = new web3.BatchRequest()

        this.liquidationEngineContract = Web3Utils.getContractInstance(SmartContractFactory.LiquidationEngine(this.networkId),this.networkId)
        this.badPositionsQueue = new Queue()

        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);

        this.fetchHandle = setInterval(this.checkAndBatchLiquidateV2.bind(this), this.liquidationInterval);

        let options = {
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        
        //Listen for liquidation complete event
        this.fixedSpreadLiquidationStrategyContract = Web3EventsUtils.getContractInstance(SmartContractFactory.FixedSpreadLiquidationStrategy(this.networkId),this.networkId)
        this.fixedSpreadLiquidationStrategyContract.events.LogFixedSpreadLiquidate(options).
            on('data', (event: ILiquidatedPositions) => {
                const span = this.tracer.startSpan("liquidation-complete");
                Logger.info(`** Liquidation Complete for ${event.returnValues._positionAddress} **`)
                span.setTag("liquidated_position_address", JSON.stringify(event.returnValues._positionAddress))
                RedisClient.getInstance().deleteValue(`position_id:${event.returnValues._positionAddress}`)
                span.finish()
            }).
            on('error', (err:string) => {
                const span = this.tracer.startSpan("liquidation-event-error");
                Logger.error(`Error connecting LogFixedSpreadLiquidate Event: ${err}`)
                span.setTag(opentracing.Tags.ERROR, true);
                span.log({ event: "error", message: `Error connecting LogFixedSpreadLiquidate Event ${err}`});
                span.finish()
            })
    }

    public async addLiquidationPosition(position: Position,ctx:any) {
        ctx = {
            span: this.tracer.startSpan("enqueue-liquidation-position", { childOf: ctx.span }),
        };
        try{
            ctx.span.setTag("liquidated_position_address", JSON.stringify(position.positionAddress))
            await RedisClient.getInstance().setValueWithExpiration(`position_id:${position.positionAddress}`,'1')
            this.badPositionsQueue.enqueue(position)  
        }catch(exception){
            Logger.error(`Error in addLiquidationPosition(): for Position : ${JSON.stringify(position)} Exeption: ${JSON.stringify(exception)}`)
            ctx.span.setTag(opentracing.Tags.ERROR, true);
            ctx.span.log({ event: "error", message: `Error in addLiquidationPosition(): for Position : ${JSON.stringify(position)} Exeption: ${JSON.stringify(exception)}`});
        }finally{
            ctx.span.finish()
        }
    }

    public removeLiquidationPosition(position: Position,ctx:any) {
        ctx = {
            span: this.tracer.startSpan("dequeue-liquidation-position", { childOf: ctx.span }),
        };
        ctx.span.setTag("liquidated_position_address", JSON.stringify(position.positionAddress))
        this.badPositionsQueue.dequeue();
        ctx.span.finish()
    }

    private async checkAndBatchLiquidateV2(){

        if (this.badPositionsQueue.isEmpty()){
            Logger.info("Nothing to liquidate yet...")
            return;
        }

        const span = this.tracer.startSpan("start-batch-liquidation");

        try {
            let isInitialized =  await RedisClient.getInstance().getValue('initialized')

            if (isInitialized == 0){
                span.log(
                    "event", `Liquidator not initialized`
                );
                return;
            }

            let batchIndex = 0;
            let collateralPools:string[] = []
            let positionAddresses:string[] = []
            let debtShares:BigNumber[] = []
            let maxDebtShareToBeLiquidateds:string[] = []
            let collateralRecipients:string[] = []
            let datas:string[] = []

            while(!this.badPositionsQueue.isEmpty() && 
                    batchIndex < this.batchSize){

                batchIndex++
                let position = this.badPositionsQueue.dequeue();
                if (position != undefined) {
                    
                    let debtShare = new BigNumber(position.debtShare).times(new BigNumber(`1${"0".repeat(45)}`))
                    Logger.info(`Adding ${position.positionAddress} to the batch at index ..${batchIndex}`)

                    collateralPools.push(position.collateralPool)
                    positionAddresses.push(position.positionAddress)
                    debtShares.push(debtShare)
                    maxDebtShareToBeLiquidateds.push(MaxUint256.MaxUint256)
                    collateralRecipients.push(process.env.LIQUIDATOR_ADDRESS!)
                    datas.push("0x00")
                }
            }

            if(batchIndex > 0){
                await this.liquidationEngineContract.methods.batchLiquidate(
                    collateralPools,
                    positionAddresses, 
                    debtShares, 
                    maxDebtShareToBeLiquidateds, 
                    collateralRecipients, 
                    datas).
                send({from: process.env.LIQUIDATOR_ADDRESS, 
                gasLimit: (1000000 * batchIndex)}).
                on("transactionHash", async (hash: any) => {
                    Logger.info(`Liquidation in progress with Tx: ${hash}`)
                    span.log({
                            "event": `batch liquidation in progress`,
                            "tx-hash": hash
                        }
                    );

                    await retry(async () => await this.checkTransactionStatus(hash),{retries: 10, delay:500})    
                }).
                on("error", (error: any) => {
                    Logger.error(`Liquidation Failed: ${JSON.stringify(error)}`)
                    span.setTag(opentracing.Tags.ERROR, true);
                    span.log({ event: "error", "error.message": `Liquidation Failed: ${JSON.stringify(error)}`  })    
                })
            }
        } catch(exception) {
            Logger.error(`Error liquidating checkAndLiquidate  : ${JSON.stringify(exception)}`)
            span.setTag(opentracing.Tags.ERROR, true);
            span.log({ event: "error", "error.message": `Liquidation Failed: ${JSON.stringify(exception)}`  })    
        }finally{
              span.finish()
        }
    }

    //DEPRECATE: This method will perform batch liquidtion at web3js level.. which results in unique transaction 
    //Will be removed in future
    private async checkAndBatchLiquidate(){
        try {
            let isInitialized =  await RedisClient.getInstance().getValue('initialized')

            if (this.badPositionsQueue.isEmpty() || isInitialized == 0)
                return;

                let batchIndex = 0;
                while(!this.badPositionsQueue.isEmpty() && 
                        batchIndex < this.batchSize){

                    batchIndex++
                    let position = this.badPositionsQueue.dequeue();
                    if (position != undefined) {
                        Logger.info(`Adding ${position.positionAddress} to the batch at index ..${batchIndex}`)
                        
                        this.web3BatchRequest.add(
                            this.liquidationEngineContract.methods.liquidate(position.collateralPool,
                                                                    position.positionAddress, 
                                                                    position.debtShare, 
                                                                    MaxUint256.MaxUint256, 
                                                                    process.env.LIQUIDATOR_ADDRESS, 
                                                                    "0x00").
                                                                    send.request({from: process.env.LIQUIDATOR_ADDRESS, gasLimit: 1000000},
                                                                        (error:Error, txnHash:string) => {
                                                                            if(error)
                                                                                Logger.error(`Error liquidating ${position!.positionAddress}  : ${JSON.stringify(error)}`)
                                                                            else
                                                                                Logger.info(`Position ${position!.positionAddress} TX: ${txnHash}`)
                                                                        }
                                                                    )
                    )
                }
                }
      
            Logger.info(`Performing batch execution for liquidation.`)    
            await this.web3BatchRequest.execute()
        } catch(exception) {
            Logger.error(`Error liquidating checkAndLiquidate  : ${JSON.stringify(exception)}`)
        }
    }

    //DEPRECATE: This method will perform liquidtion one at a time.
    //Will be removed in future
    private async checkAndLiquidate(){
        try {
            let isInitialized =  await RedisClient.getInstance().getValue('initialized')

            if (this.badPositionsQueue.isEmpty() || isInitialized == 0)
                return;

                    let position = this.badPositionsQueue.dequeue();
                    if (position != undefined) {
                        Logger.info(`Liquidating ${position.positionAddress}...`)
                        
                            await this.liquidationEngineContract.methods.liquidate(
                                    position.collateralPool,
                                    position.positionAddress, 
                                    position.debtShare, 
                                    MaxUint256.MaxUint256, 
                                    process.env.LIQUIDATOR_ADDRESS, 
                                    "0x00").
                                    send({from: process.env.LIQUIDATOR_ADDRESS, gasLimit: 1000000})
                    }
      
        } catch(exception) {
            Logger.error(`Error liquidating checkAndLiquidate  : ${JSON.stringify(exception)}`)
        }
    }

    private async checkTransactionStatus(txHash:string){
        let response = await Web3EventsUtils.xdc3.eth.getTransactionReceipt(txHash);
        Logger.info(
            `status for transaction: ${txHash} is ${JSON.stringify(
                 response
            )}`
        );
        if (response == null) {
            Logger.info(`Tx ${txHash} Pending confirmation...`)
            throw new Error(`Tx ${txHash} Pending confirmation...`);
        }else{
            if (response.status == true){
                Logger.info(`check transaction Status complete for TX: ${txHash}`)
            }
        }
    }
}