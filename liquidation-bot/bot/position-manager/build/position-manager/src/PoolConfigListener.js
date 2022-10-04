"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolConfigListener = void 0;
//
class PoolConfigListener {
    constructor(_consumer) {
        this.consumer = _consumer;
        this.setupEventListner();
    }
    setupEventListner() {
        // const eventFilter = {
        //     address: collateralPoolConfigAddress,
        //     topics: [
        //         utils.id("LogSetLiquidationRatio(address,bytes32,uint256)"),
        //     ]
        // }
        // provider.on(eventFilter, (log, event) => {
        //     // Emitted whenever onchain price update happens
        //     console.log(LogLevel.keyEvent('============================================'));
        //     console.log(LogLevel.keyEvent('OnChain LogSetLiquidationRatio Event Fired'));
        //     console.log(LogLevel.keyEvent('============================================'));
        //     if(this.consumer != undefined)
        //         this.consumer();
        // });
    }
}
exports.PoolConfigListener = PoolConfigListener;
