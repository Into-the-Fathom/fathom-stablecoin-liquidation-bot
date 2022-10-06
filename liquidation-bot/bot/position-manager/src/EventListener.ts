import { SmartContractFactory } from "./config/SmartContractFactory";
import Logger from "./utils/Logger";
import { Web3EventsUtils } from "./utils/Web3EventsUtils";


export class EventListener{
    private consumer: (() => Promise<void> | void) | undefined;
    private priceOracleContract:any;
    private positionManagerContract:any;
    private readonly networkId:number = 51;

    constructor(_consumer: () => Promise<void> | void){
        this.consumer = _consumer;
        this.networkId = parseInt(process.env.NETWORK_ID!)
        this.setupEventListner();
    }

    private setupEventListner(){

        let options = {
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        
        //Listen for price update
        this.priceOracleContract = Web3EventsUtils.getContractInstance(SmartContractFactory.PriceOracle(this.networkId),this.networkId)
        this.priceOracleContract.events.LogSetPrice(options).
            on('data', (event: any) => {
                //TODO: Check from previous price, if lesser then only call refetch the positions
                Logger.info(`Price update event occuered.`)
                if(this.consumer != undefined)
                    this.consumer();
            }).
            on('error', (err:string) => {
                Logger.error(`Error connecting LogSetPrice Event ${err}`)
            })

        //Listen for New Position Opened
        this.positionManagerContract = Web3EventsUtils.getContractInstance(SmartContractFactory.PositionManager(this.networkId),this.networkId)
        this.positionManagerContract.events.LogNewPosition(options).
            on('data', (event: any) => {
                Logger.info(`New position opened.`)
                if(this.consumer != undefined)
                    this.consumer();
            }).
            on('error', (err:string) => {
                Logger.error(`Error connecting LogNewPosition Event ${err}`)
            })
    
    }

}