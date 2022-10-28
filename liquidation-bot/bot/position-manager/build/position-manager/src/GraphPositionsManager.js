"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphPositionsManager = void 0;
const Logger_1 = __importDefault(require("../../shared/utils/Logger"));
const graphql_request_1 = require("graphql-request");
//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
class GraphPositionsManager {
    constructor() {
        this.isBusy = false;
    }
    async getOpenPositions(startIndex, offset) {
        try {
            Logger_1.default.debug(`Fetching positions at index ${startIndex}...`);
            const query = (0, graphql_request_1.gql) `
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
                        `;
            let url = 'http://139.59.27.103:8000/subgraphs/name/fathom-liquidation-bot';
            let response = await (0, graphql_request_1.request)(url, query);
            let positions = response.positions; //JSON.parse(response).positions
            console.log(`GraphQL Reponse: ${JSON.stringify(positions)}`);
            return positions;
        }
        catch (exception) {
            console.log(exception);
            return [];
        }
    }
    async processPositions(positions) {
        return positions;
    }
}
exports.GraphPositionsManager = GraphPositionsManager;
