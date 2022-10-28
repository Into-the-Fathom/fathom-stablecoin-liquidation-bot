import {
  LogNewPosition,
  PositionManager,

} from "../generated/PositionManager/PositionManager"
import {CollateralPoolConfig} from "../generated/CollateralPoolConfig/CollateralPoolConfig"
import { Position,Pool } from "../generated/schema"
import { log } from '@graphprotocol/graph-ts'


import {
  Address,
  BigDecimal,
  BigInt
} from "@graphprotocol/graph-ts";

export function newPositionHandler(event: LogNewPosition): void {
    let positionManager = PositionManager.bind(Address.fromString('0xC0FeEa2f3C9a6F208E75715b1BAc71f1B61ED43b'))
    let positionAddress = positionManager.positions(event.params._positionId)
    let poolId = positionManager.collateralPools(event.params._positionId)

    let position = new Position(positionAddress.toHexString())
    position.positionId = event.params._positionId;
    position.positionAddress = positionAddress;
    position.userAddress = event.params._usr;
    position.walletAddress = event.params._own;
    position.collatralPool = poolId
    position.lockedCollateral = BigInt.fromString('0')
    position.debtShare = BigInt.fromString('0')
    position.safetyBuffer= BigInt.fromString('1')
    position.save()

    //Save Pool
    let pool  = Pool.load(poolId.toHexString())
    if(pool == null){
      log.info('Creating new pool with id: {}',[poolId.toHexString()])
      let collatralConfig = CollateralPoolConfig.bind(Address.fromString('0x48853e29341Bf581D56cF8Ff330a0F7371BFFFC6'))
      pool = new Pool(poolId.toHexString())
      pool.debtAccumulatedRate = collatralConfig.getDebtAccumulatedRate(poolId)
      pool.positions = []
    }else{
      log.info('Pool with id {} Found',[poolId.toHexString()])
    }

    let _positions = pool.positions
    _positions.push(positionAddress.toHexString())
    pool.positions = _positions
    pool.save()
}