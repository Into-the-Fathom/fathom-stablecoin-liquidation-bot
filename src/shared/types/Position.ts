import BigNumber from "bignumber.js";

class Position{
    public readonly positionAddress: string;
    public readonly collateralPool: string;
    public readonly debtShare : string;
    public readonly safetyBuffer: BigNumber;

    constructor(_address: string,_poolId:string, _debtShare: any,_safetyBuffer:any){
        this.positionAddress = _address;
        this.collateralPool = _poolId;
        this.debtShare = _debtShare;
        this.safetyBuffer = new BigNumber(_safetyBuffer);
    }
}

export default Position;