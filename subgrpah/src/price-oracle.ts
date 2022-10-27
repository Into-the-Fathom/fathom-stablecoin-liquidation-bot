import {LogSetPrice} from "../generated/PriceOracle/PriceOracle"
import { Pool, Position } from "../generated/schema";
import {
    BigInt
  } from "@graphprotocol/graph-ts";

export function priceUpdateHandler(event: LogSetPrice): void {
    let poolId = event.params._poolId;
    let pool  = Pool.load(poolId.toHexString())
    if(pool != null){
        let _debtAccumulatedRate = pool.debtAccumulatedRate
        let _priceWithSafetyMargin = event.params._priceWithSafetyMargin
        for (let i = 0; i < pool.positions.length; ++i) {
            let pos  = Position.load(pool.positions[i])
            if(pos != null && pos.debtShare.gt(BigInt.fromI32(0))){
                let collateralValue = pos.lockedCollateral.times(_priceWithSafetyMargin)
                let debtValue = pos.debtShare.times(_debtAccumulatedRate)
                pos.safetyBuffer = collateralValue.ge(debtValue) ? collateralValue.minus(debtValue) : BigInt.fromString('0')
                pos.save()
            }
        }
    }        
}