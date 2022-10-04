import Position from "./types/Position"

import { Web3Utils } from "./utils/Web3Utils";
import { SmartContractFactory } from "./config/SmartContractFactory";
import { Web3EventsUtils } from "./utils/Web3EventsUtils";
import { LogLevel } from "../../helpers/config/config";

const CURRENT_NETWORK = 51

//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
//TODO: Handle position internally and notify 
export class PositionManager{

    private readonly getPositionContract:any;
    public isBusy:boolean = false;
    private consumer: (() => Promise<void> | void) | undefined;

    constructor(_consumer: () => Promise<void> | void){
        this.consumer = _consumer;

        let options = {
            filter: {
                value: [],
            },
            fromBlock: 0
        };
        
        let positionManagerContract = Web3EventsUtils.getContractInstance(SmartContractFactory.PositionManager(CURRENT_NETWORK),CURRENT_NETWORK)
        positionManagerContract.events.LogNewPosition(options).
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

    public async getOpenPositions(startIndex:number,offset:number) {
        try {
            console.log(`Fetching positions at index ${startIndex}...`);
            let getPositionContract = Web3Utils.getContractInstance(SmartContractFactory.GetPositions(CURRENT_NETWORK),CURRENT_NETWORK)
            let response = await getPositionContract.methods.getPositionWithSafetyBuffer(SmartContractFactory.PositionManager(CURRENT_NETWORK).address,startIndex,offset).call();

            const {0: positions, 1: debtShares, 2: safetyBuffers} = response;
    
            let fetchedPositions: Position[] =  []; 
            let index = 0;
            positions.forEach((positionAddress: string) => {
                let debtShare = debtShares[index];
                let safetyBuffer = safetyBuffers[index];
                let position =  new Position(positionAddress,debtShare,safetyBuffer);
                console.log(`Position${index} address : ${positionAddress}, debtShare: ${debtShare}, safetyBuffer: ${safetyBuffer}`);
                fetchedPositions.push(position)
                index++;
            });
        
            return fetchedPositions;
        } catch(exception) {
            console.log(exception)
            return [];
        }
    }

    public async processPositions(positions:Position []) {
        //Filter the underwater position
        const underwaterPositions = positions.filter(position => (position.isUnSafe));
        //Sort based on debtshare
        const priortizePositions = underwaterPositions.sort((pos1,pos2)  => (pos1.debtShare.gt(pos2.debtShare) ? -1 : 1));
    
        return priortizePositions;
    }
}