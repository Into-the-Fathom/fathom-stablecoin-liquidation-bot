import { Web3Utils } from "../../shared/web3/Web3Utils";
import { SmartContractFactory } from "../../shared/web3/SmartContractFactory";
import Position from "../../shared/types/Position"
import Logger from "../../shared/utils/Logger";
import { IPositionService } from "./interface/IPositionService";
import { request, gql } from 'graphql-request'
import { Constants } from "./utils/Constants";
import { GraphQueries } from "./utils/GraphQueries";


//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
export class GraphPositionsManager implements IPositionService{
    public isBusy:boolean = false;

    constructor(){
    }

    public async getOpenPositions(startIndex:number,offset:number):Promise<Position[]> {
        try {
            this.checkGraphHealth()
            Logger.debug(`Fetching positions at index ${startIndex}...`)
            let response = await request(Constants.GRAPH_URL, GraphQueries.RISK_POSITION)
            let positions: Position[] = response.positions//JSON.parse(response).positions
            console.log(`GraphQL Reponse: ${JSON.stringify(positions)}`);    
            return positions;
        } catch(exception) {
            console.log(exception)
            return [];
        }
    }

    public async checkGraphHealth() {
        Logger.debug(`Checking graph health...`)
        let response = await request(Constants.GRAPH_HEALTH_URL, GraphQueries.HEALTH_QUERY)
        Logger.debug(`GraphQL Health Reponse: ${JSON.stringify(response)}`);    
    }

    //TODO: Remove this method as a part of refactoring.
    public async processPositions(positions:Position []):Promise<Position[]> {
        return positions;
    }
}