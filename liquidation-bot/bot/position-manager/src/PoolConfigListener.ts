import { ethers, utils } from "ethers";
import { LogLevel, provider } from "../../helpers/config/config";
import { collateralPoolConfigAddress } from "../../helpers/utils/addresses";

//
export class PoolConfigListener{
    private consumer: (() => Promise<void> | void) | undefined;

    constructor(_consumer: () => Promise<void> | void){
        this.consumer = _consumer;
        this.setupEventListner();
    }

    private setupEventListner(){
        
        const eventFilter = {
            address: collateralPoolConfigAddress,
            topics: [
                utils.id("LogSetLiquidationRatio(address,bytes32,uint256)"),
            ]
        }

        provider.on(eventFilter, (log, event) => {
            // Emitted whenever onchain price update happens
            console.log(LogLevel.keyEvent('============================================'));
            console.log(LogLevel.keyEvent('OnChain LogSetLiquidationRatio Event Fired'));
            console.log(LogLevel.keyEvent('============================================'));
            if(this.consumer != undefined)
                this.consumer();
            
        });
    }

}