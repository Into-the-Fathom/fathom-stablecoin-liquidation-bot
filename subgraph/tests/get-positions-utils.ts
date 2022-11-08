import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  GetPositionsAdminChanged,
  GetPositionsBeaconUpgraded,
  GetPositionsUpgraded
} from "../generated/GetPositions/GetPositions"

export function createGetPositionsAdminChangedEvent(
  previousAdmin: Address,
  newAdmin: Address
): GetPositionsAdminChanged {
  let getPositionsAdminChangedEvent = changetype<GetPositionsAdminChanged>(
    newMockEvent()
  )

  getPositionsAdminChangedEvent.parameters = new Array()

  getPositionsAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdmin",
      ethereum.Value.fromAddress(previousAdmin)
    )
  )
  getPositionsAdminChangedEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )

  return getPositionsAdminChangedEvent
}

export function createGetPositionsBeaconUpgradedEvent(
  beacon: Address
): GetPositionsBeaconUpgraded {
  let getPositionsBeaconUpgradedEvent = changetype<GetPositionsBeaconUpgraded>(
    newMockEvent()
  )

  getPositionsBeaconUpgradedEvent.parameters = new Array()

  getPositionsBeaconUpgradedEvent.parameters.push(
    new ethereum.EventParam("beacon", ethereum.Value.fromAddress(beacon))
  )

  return getPositionsBeaconUpgradedEvent
}

export function createGetPositionsUpgradedEvent(
  implementation: Address
): GetPositionsUpgraded {
  let getPositionsUpgradedEvent = changetype<GetPositionsUpgraded>(
    newMockEvent()
  )

  getPositionsUpgradedEvent.parameters = new Array()

  getPositionsUpgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return getPositionsUpgradedEvent
}
