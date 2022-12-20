import { gql } from "graphql-request";

export class GraphQueries{

public static readonly  RISK_POSITION = gql`
    query MyQuery {
        positions(
            first: 1000
            orderBy: debtShare
            orderDirection: desc
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

public static RISK_POSITION1(pageSize:number, index:number) {
    return gql`
        query MyQuery {
            positions(
                first: ${pageSize}
                skip: ${index}
                orderBy: debtShare
                orderDirection: desc
                where: {positionStatus: unsafe}
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