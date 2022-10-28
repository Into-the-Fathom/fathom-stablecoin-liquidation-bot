import { Web3Utils } from "../../shared/web3/Web3Utils";
import { SmartContractFactory } from "../../shared/web3/SmartContractFactory";
import Position from "../../shared/types/Position"
import Logger from "../../shared/utils/Logger";
import { IPositionService } from "./interface/IPositionService";
import { request, gql } from 'graphql-request'


//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
export class GraphPositionsManager implements IPositionService{
    public isBusy:boolean = false;

    constructor(){
    }

    public async getOpenPositions(startIndex:number,offset:number):Promise<Position[]> {
        try {
            Logger.debug(`Fetching positions at index ${startIndex}...`)
            const query = gql`
                            query MyQuery {
                                positions(
                                    first: 100
                                    orderBy: debtShare
                                    orderDirection: desc
                                where: {debtShare_gt: "0", safetyBuffer: "0"}
                                ) {
                                    collatralPool
                                    debtShare
                                    id
                                    lockedCollateral
                                    positionAddress
                                    positionId
                                    safetyBuffer
                                    userAddress
                                }
                            }
                        `

            let url = 'http://139.59.27.103:8000/subgraphs/name/fathom-liquidation-bot'; 
            let response = await request(url, query)
            let positions: Position[] = response.positions//JSON.parse(response).positions
            console.log(`GraphQL Reponse: ${JSON.stringify(positions)}`);    
            return positions;
        } catch(exception) {
            console.log(exception)
            return [];
        }
    }

    public async processPositions(positions:Position []):Promise<Position[]> {
        return positions;
    }
}