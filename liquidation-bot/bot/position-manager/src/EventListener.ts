import { ethers, utils } from "ethers";
import { LogLevel } from "../../helpers/config/config";
import { SmartContractFactory } from "./config/SmartContractFactory";
import { Web3EventsUtils } from "./utils/Web3EventsUtils";


export class EventListener{
    private consumer: (() => Promise<void> | void) | undefined;
    private priceOracleContract:any;
    private positionManagerContract:any;
    private readonly networkId:number = 51;

    constructor(_consumer: () => Promise<void> | void){
        this.consumer = _consumer;
        process.env.NETWORK_ID ??  this.networkId === process.env.NETWORK_ID
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
                console.log(LogLevel.keyEvent('================================'));
                console.log(LogLevel.keyEvent(`Price update event occuered.`));
                console.log(LogLevel.keyEvent('================================'));
                if(this.consumer != undefined)
                    this.consumer();
            }).
            on('error', (err:string) => {
                console.log(LogLevel.error(err));
            })

            //Listen for New Position Opened
        this.positionManagerContract = Web3EventsUtils.getContractInstance(SmartContractFactory.PositionManager(this.networkId),this.networkId)
        this.positionManagerContract.events.LogNewPosition(options).
            on('data', (event: any) => {
                console.log(LogLevel.keyEvent('================================'));
                console.log(LogLevel.keyEvent(`New position opened.`));
                console.log(LogLevel.keyEvent('================================'));
                if(this.consumer != undefined)
                    this.consumer();
            }).
            on('error', (err:string) => {
                console.log(LogLevel.error(err));
            })
    
    }

}