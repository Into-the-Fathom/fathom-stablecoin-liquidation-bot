import BN from 'bn.js';

class Position{
    public readonly positionAddress: string;
    public readonly collateralPool: string;
    public readonly debtShare : BN;
    public readonly safetyBuffer: BN;

    constructor(_address: string,_poolId:string, _debtShare: any,_safetyBuffer:any){
        this.positionAddress = _address;
        this.collateralPool = _poolId;
        this.debtShare = new BN(_debtShare);
        this.safetyBuffer = new BN(_safetyBuffer);
    }

    get isUnSafe(): boolean { 
        return this.safetyBuffer.lte(new BN(0)) && this.debtShare.gt(new BN(0));
    }
}

export default Position;