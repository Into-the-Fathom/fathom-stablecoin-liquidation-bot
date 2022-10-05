import Position from "./types/Position"

import { Web3Utils } from "./utils/Web3Utils";
import { SmartContractFactory } from "./config/SmartContractFactory";
import { LogLevel } from "../../helpers/config/config";

//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
export class PositionManager{
    public isBusy:boolean = false;
    private readonly networkId:number = 51;

    constructor(){
        process.env.NETWORK_ID ??  this.networkId === process.env.NETWORK_ID
    }

    public async getOpenPositions(startIndex:number,offset:number) {
        try {
            console.log(LogLevel.debug(`Fetching positions at index ${startIndex}...`));
            let getPositionContract = Web3Utils.getContractInstance(SmartContractFactory.GetPositions(this.networkId),this.networkId)
            let response = await getPositionContract.methods.getPositionWithSafetyBuffer(SmartContractFactory.PositionManager(this.networkId).address,startIndex,offset).call();

            const {0: positions, 1: debtShares, 2: safetyBuffers} = response;
    
            let fetchedPositions: Position[] =  []; 
            let index = 0;
            positions.forEach((positionAddress: string) => {
                let debtShare = debtShares[index];
                let safetyBuffer = safetyBuffers[index];
                let position =  new Position(positionAddress,debtShare,safetyBuffer);
                console.log(LogLevel.debug(`Position${index} address : ${positionAddress}, debtShare: ${debtShare}, safetyBuffer: ${safetyBuffer}`));
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