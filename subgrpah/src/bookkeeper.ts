import {LogAdjustPosition} from "../generated/BookKeeper/BookKeeper"
import { Position } from "../generated/schema"

export function adjustPositionHandler(event: LogAdjustPosition): void {
    let position = Position.load(event.params._positionAddress.toHexString())
    if(position!=null){
        position.lockedCollateral =  event.params._lockedCollateral
        position.debtShare =  event.params._debtShare
        position.save()
    }    
}