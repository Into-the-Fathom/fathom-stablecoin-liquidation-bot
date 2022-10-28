import { Web3Utils } from "../../shared/web3/Web3Utils";
import { SmartContractFactory } from "../../shared/web3/SmartContractFactory";
import Position from "../../shared/types/Position"
import Logger from "../../shared/utils/Logger";
import { IPositionService } from "./interface/IPositionService";


//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
export class PositionManager implements IPositionService{
    public isBusy:boolean = false;
    private readonly networkId:number = 51;

    constructor(){
        this.networkId = parseInt(process.env.NETWORK_ID!)
    }

    public async getOpenPositions(startIndex:number,offset:number):Promise<Position[]> {
        try {
            Logger.debug(`Fetching positions at index ${startIndex}...`)
            let getPositionContract = Web3Utils.getContractInstance(SmartContractFactory.GetPositionsLiquidationBot(this.networkId),this.networkId)
            let response = await getPositionContract.methods.getPositionWithSafetyBuffer(SmartContractFactory.PositionManager(this.networkId).address,startIndex,offset).call();

            const {0: positions, 1: debtShares, 2: safetyBuffers, 3: poolIds} = response;
    
            let fetchedPositions: Position[] =  []; 
            let index = 0;
            positions.forEach((positionAddress: string) => {
                let poolId = poolIds[index];
                let debtShare = debtShares[index];
                let safetyBuffer = safetyBuffers[index];
                let position =  new Position(positionAddress,poolId,debtShare,safetyBuffer);

                if(debtShare > 0 && safetyBuffer > 0 ){
                    Logger.debug(`Position${index} address : ${positionAddress}, poolId: ${poolId}, debtShare: ${debtShare}, safetyBuffer: ${safetyBuffer}`)
                }

                fetchedPositions.push(position)
                index++;
            });
        
            return fetchedPositions;
        } catch(exception) {
            console.log(exception)
            return [];
        }
    }

    public async processPositions(positions:Position []):Promise<Position[]> {
        //Filter the underwater position
        const underwaterPositions = positions.filter(position => (position.isUnSafe));
        //Sort based on debtshare
        const priortizePositions = underwaterPositions.sort((pos1,pos2)  => (pos1.debtShare.gt(pos2.debtShare) ? -1 : 1));
    
        return priortizePositions;
    }
}