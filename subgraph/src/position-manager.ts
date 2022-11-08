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
    let positionManager = PositionManager.bind(Address.fromString('0x0d2890cCea543689Eb2424B419239d042C653DEE'))
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
      let collatralConfig = CollateralPoolConfig.bind(Address.fromString('0xC0898248E3ec5D754A6cc4a3505E0B182E6edEc4'))
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