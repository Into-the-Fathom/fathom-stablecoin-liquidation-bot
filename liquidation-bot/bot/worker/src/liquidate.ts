import Position from '../../shared/types/Position'
const MaxUint256 = require("@ethersproject/constants");
import Queue from 'queue-fifo';
import { Web3EventsUtils } from "../../shared/web3/Web3EventsUtils";
import { SmartContractFactory } from "../../shared/web3/SmartContractFactory";
import { Web3Utils } from "../../shared/web3/Web3Utils";
import Logger from "../../shared/utils/Logger";


export class Liquidator{

    private badPositionsQueue:Queue<Position>;

    private fetchHandle: NodeJS.Timeout | null = null;
    private readonly liquidationEngineContract:any;
    private readonly fixedSpreadLiquidationStrategyContract:any;
    private readonly networkId:number = 51;
    private readonly liquidationInterval:number = 5000;


    constructor() {
        this.networkId = parseInt(process.env.NETWORK_ID!)
        this.liquidationInterval = parseInt(process.env.LIQUIDATION_INTERVAL!)

        this.liquidationEngineContract = Web3Utils.getContractInstance(SmartContractFactory.LiquidationEngine(this.networkId),this.networkId)
        this.badPositionsQueue = new Queue()

        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);

        //TODO: Check if we can do it in better way
        this.fetchHandle = setInterval(this.checkAndLiquidate.bind(this), this.liquidationInterval);

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
        this.badPositionsQueue.enqueue(position)
    }

    public removeLiquidationPosition(position: Position) {
        this.badPositionsQueue.dequeue();
    }

    private async checkAndLiquidate(){
        if (this.badPositionsQueue.isEmpty())
            return;
        
        let position = this.badPositionsQueue.dequeue();
        if (position != undefined) {
            try {
                Logger.info(`Performing liquidation on position ${position.address}`)
                //TODO: Find the collatral pool id and replace it as first parameter
                await this.liquidationEngineContract.methods.liquidate(position.poolId, position.address, position.debtShare, MaxUint256.MaxUint256, process.env.LIQUIDATOR_ADDRESS, "0x00").send({from: process.env.LIQUIDATOR_ADDRESS});
            } catch(exception) {
                Logger.error(`Error liquidating position ${position.address} : ${JSON.stringify(exception)}`)
            }
        }
    }
}