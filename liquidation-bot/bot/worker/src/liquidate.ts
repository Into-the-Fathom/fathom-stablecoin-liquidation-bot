import Position from '../../shared/types/Position'
const MaxUint256 = require("@ethersproject/constants");
import Queue from 'queue-fifo';
import { Web3EventsUtils } from "../../shared/web3/Web3EventsUtils";
import { SmartContractFactory } from "../../shared/web3/SmartContractFactory";
import { Web3Utils } from "../../shared/web3/Web3Utils";
import Logger from "../../shared/utils/Logger";
import { RedisClient } from "../../shared/utils/RedisClient";


export class Liquidator{

    private badPositionsQueue:Queue<Position>;

    private fetchHandle: NodeJS.Timeout | null = null;
    private readonly liquidationEngineContract:any;
    private readonly fixedSpreadLiquidationStrategyContract:any;
    private readonly networkId:number = 51;
    private readonly liquidationInterval:number = 5000;
    private readonly web3BatchRequest;
    private readonly batchSize:number = 100;


    constructor() {
        this.networkId = parseInt(process.env.NETWORK_ID!)
        this.liquidationInterval = parseInt(process.env.LIQUIDATION_INTERVAL!)
        this.batchSize = parseInt(process.env.LIQUIDATION_BATCH_SIZE!)

        let web3 = Web3Utils.getWeb3Instance(this.networkId)
        this.web3BatchRequest = new web3.BatchRequest()

        this.liquidationEngineContract = Web3Utils.getContractInstance(SmartContractFactory.LiquidationEngine(this.networkId),this.networkId)
        this.badPositionsQueue = new Queue()

        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);

        //TODO: Check if we can do it in better way
        this.fetchHandle = setInterval(this.checkAndBatchLiquidate.bind(this), this.liquidationInterval);

        let options = {
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        
        //Listen for liquidation complete event
        this.fixedSpreadLiquidationStrategyContract = Web3EventsUtils.getContractInstance(SmartContractFactory.FixedSpreadLiquidationStrategy(this.networkId),this.networkId)
        this.fixedSpreadLiquidationStrategyContract.events.LogFixedSpreadLiquidate(options).
            on('data', (event: any) => {
                Logger.info(`** Liquidation Complete for ${JSON.stringify(event)} **`)
            }).
            on('error', (err:string) => {
                Logger.error(`Error connecting LogFixedSpreadLiquidate Event: ${err}`)
            })
    }

    public addLiquidationPosition(position: Position) {
        RedisClient.getInstance().setValueWithExpiration(`position_id:${position.positionAddress}`,'1')
        this.badPositionsQueue.enqueue(position)
    }

    public removeLiquidationPosition(position: Position) {
        this.badPositionsQueue.dequeue();
    }

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
                                                                                Logger.error(`Error liquidating ${position!.positionAddress}  : ${error} tx: ${txnHash}`)
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
}