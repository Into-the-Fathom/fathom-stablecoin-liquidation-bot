import Position from "../../shared/types/Position"
import Logger from "../../shared/utils/Logger";
import { IPositionService } from "./interface/IPositionService";
import { request } from 'graphql-request'
import { Constants } from "./utils/Constants";
import { GraphQueries } from "./utils/GraphQueries";
import { RedisClient } from "./utils/RedisClient";
import { retry } from 'ts-retry-promise';
import { IndexingStatusForCurrentVersion } from "./interface/IndexingStatusForCurrentVersion";

//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
export class GraphPositionsManager implements IPositionService{
    public isBusy:boolean = false;

    constructor(){
    }

    public async getOpenPositions(startIndex:number,offset:number):Promise<Position[]> {
        try {
            await retry(await this.checkGraphHealth,{retries: 10, delay:500})
            Logger.debug(`Fetching positions at index ${startIndex}...`)
            let response = await request(Constants.GRAPH_URL, GraphQueries.RISK_POSITION)
            let positions: Position[] = response.positions

            console.log(`GraphQL Reponse: ${JSON.stringify(positions)}`);    
            return positions;
        } catch(exception) {
            console.log(exception)
            return [];
        }
    }

    public async checkGraphHealth() {
        Logger.debug(`Checking graph sync status...`)
        let lastBlockFromEvent = await RedisClient.getInstance().getValue('lastblock')
        let response = await request(Constants.GRAPH_HEALTH_URL, GraphQueries.HEALTH_QUERY)
        let graphLastBlock = response.indexingStatusForCurrentVersion.chains[0].latestBlock.number
        Logger.debug(`Graph health status ${graphLastBlock}}`)
        if(graphLastBlock < lastBlockFromEvent){
            Logger.warn(`Graph node not fully synced.. latest block on chain is ${lastBlockFromEvent}, graph is synced to ${response.chains![0].latestBlock} `)
            throw new Error(`Graph node not fully synced.. latest block on chain is ${lastBlockFromEvent}, graph is synced to ${response.chains![0].latestBlock} `);
        }else{
            Logger.info('Graph is synced...')
        }
    }

    //TODO: Remove this method as a part of refactoring.
    public async processPositions(positions:Position []):Promise<Position[]> {
        return positions;
    }
}