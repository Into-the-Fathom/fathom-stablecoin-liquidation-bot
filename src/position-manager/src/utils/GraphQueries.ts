import { gql } from "graphql-request";

export class GraphQueries{

public static RISK_POSITION(pageSize:number, index:number) {
    return gql`
        query MyQuery {
            positions(
                first: ${pageSize}
                skip: ${index}
                orderBy: debtShare
                orderDirection: desc
                where: {positionStatus: unsafe, collateralPoolName_not:"US+STABLE"}
            ) {
                collateralPool
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
}

public static readonly  HEALTH_QUERY = gql`
    query health {
        indexingStatusForCurrentVersion(subgraphName: "fathomapp-subgraph") {
        synced
        health
        chains {
                chainHeadBlock {
                    number
                }
                latestBlock {
                    number
                }
            }
        }
    }
`
}