import { gql } from "graphql-request";

export class GraphQueries{
    public static readonly  RISK_POSITION = gql`
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


}