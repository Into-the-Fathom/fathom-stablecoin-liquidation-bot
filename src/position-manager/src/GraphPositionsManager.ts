import Position from "../../shared/types/Position"
import Logger from "../../shared/utils/Logger";
import { IPositionService } from "./interface/IPositionService";
import { request } from 'graphql-request'
import { Constants } from "./utils/Constants";
import { GraphQueries } from "./utils/GraphQueries";
import { RedisClient } from "../../shared/utils/RedisClient";
import { retry } from 'ts-retry-promise';
import { IndexingStatusForCurrentVersion } from "./interface/IndexingStatusForCurrentVersion";

//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
export class GraphPositionsManager implements IPositionService{
    public isBusy:boolean = false;
    private readonly tracer:any;

    constructor(tracer:any){
        this.tracer = tracer
    }

    public async getRiskyPositions(pageSize:number,offset:number):Promise<Position[]> {
        const span = this.tracer.startSpan("get-risky-positions");
        const ctx = { span };
        try {
            span.setTag("search-risky-positions", offset);

            await retry(async () => await this.checkGraphHealth(ctx),{retries: 10, delay:500})
            Logger.debug(`Fetching positions at index ${offset}...`)
            let response = await request(Constants.GRAPH_URL, GraphQueries.RISK_POSITION(pageSize,pageSize*offset))
            let positions: Position[] = response.positions
            ctx.span.log({
                event: "risky-position",
                value: positions,
            });
            console.log(`GraphQL Reponse: ${JSON.stringify(positions)}`);    
            return positions;
        } catch(exception) {
            ctx.span.log({ event: "error", "error.object": exception })
            Logger.error(exception)
            return [];
        }finally{
            span.finish();
        }
    }

    public async checkGraphHealth(ctx:any) {
        Logger.debug(`Checking graph sync status...`)
        ctx = {
            span: this.tracer.startSpan("check-graph-health", { childOf: ctx.span }),
        };

        let lastBlockFromEvent = await RedisClient.getInstance().getValue('lastblock')
        ctx.span.setTag("lastblock", lastBlockFromEvent);
        
        Logger.debug(`Last block saved locally ${lastBlockFromEvent}`)
        let response = await request(Constants.GRAPH_HEALTH_URL, GraphQueries.HEALTH_QUERY)
        let graphLastBlock = response.indexingStatusForCurrentVersion.chains[0].latestBlock.number
        Logger.debug(`Graph last sync status ${graphLastBlock}`)
        if(graphLastBlock < lastBlockFromEvent){
            Logger.warn(`Graph node not fully synced.. latest block on chain is ${lastBlockFromEvent}, graph is synced to ${response.chains![0].latestBlock} `)
            ctx.span.log({
                event: "graph-sync-pending",
                value: lastBlockFromEvent,
              });
            throw new Error(`Graph node not fully synced.. latest block on chain is ${lastBlockFromEvent}, graph is synced to ${response.chains![0].latestBlock} `);
        }else{
            Logger.info('Graph is synced...')
            ctx.span.log({
                event: "graph-sync",
                value: "complete",
              });
        }

        ctx.span.finish();
    }
}