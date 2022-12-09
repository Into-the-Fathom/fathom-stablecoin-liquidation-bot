export interface ILiquidatedPositions {
    address:          string;
    blockNumber:      number;
    transactionHash:  string;
    transactionIndex: number;
    blockHash:        string;
    logIndex:         number;
    removed:          boolean;
    id:               string;
    returnValues:     ReturnValues;
    event:            string;
    signature:        string;
}

export interface ReturnValues {
    _collateralPoolId:               string;
    _positionDebtShare:              string;
    _positionCollateralAmount:       string;
    _positionAddress:                string;
    _debtShareToBeLiquidated:        string;
    _maxDebtShareToBeLiquidated:     string;
    _liquidatorAddress:              string;
    _collateralRecipient:            string;
    _actualDebtShareToBeLiquidated:  string;
    _actualDebtValueToBeLiquidated:  string;
    _collateralAmountToBeLiquidated: string;
    _treasuryFees:                   string;
}
