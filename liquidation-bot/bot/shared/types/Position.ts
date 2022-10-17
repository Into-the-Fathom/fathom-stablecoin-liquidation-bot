import BN from 'bn.js';

class Position{
    public readonly address: string;
    public readonly poolId: string;
    public readonly debtShare : BN;
    public readonly safetyBuffer: BN;

    constructor(_address: string,_poolId:string, _debtShare: any,_safetyBuffer:any){
        this.address = _address;
        this.poolId = _poolId;
        this.debtShare = new BN(_debtShare);
        this.safetyBuffer = new BN(_safetyBuffer);
    }

    get isUnSafe(): boolean { 
        return this.safetyBuffer.lte(new BN(0)) && this.debtShare.gt(new BN(0));
    }
}

export default Position;