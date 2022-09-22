import { ethers, utils } from "ethers";
import Position from "./types/Position"

import {getPositionContractAddress, 
    positionManagerAddress} 
    from '../../helpers/utils/addresses.js'
import { LogLevel, provider } from "../../helpers/config/config";

//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
//TODO: Handle position internally and notify 
export class PositionManager{

    public readonly getPositionContract;
    public isBusy:boolean = false;
    private consumer: (() => Promise<void> | void) | undefined;

    constructor(_consumer: () => Promise<void> | void){
        this.consumer = _consumer;

        let getPositionWithSafetyBufferAbi = [
            'function getPositionWithSafetyBuffer(address _manager,uint256 _startIndex,uint256 _offset) external view returns (address[], uint256[],uint256[])',
        ];

        this.getPositionContract = new ethers.Contract(getPositionContractAddress, getPositionWithSafetyBufferAbi, provider);

        //Subscribe to listen newly open position..
        const eventFilter = {
            address: positionManagerAddress,
            topics: [
                utils.id("LogNewPosition(address,address,uint256)"),
            ]
        }
        provider.on(eventFilter, (log, event) => {
            // Emitted whenever onchain price update happens
            console.log(LogLevel.keyEvent('================================'));
            console.log(LogLevel.keyEvent(`New position opened.`));
            console.log(LogLevel.keyEvent('================================'));
            if(this.consumer != undefined)
                this.consumer();
        })
    }

    public async getOpenPositions(startIndex:number,offset:number) {
        try {
            console.log(LogLevel.debug(`Fetching positions at index ${startIndex}...`));
            //TODO: Fix the code to iterate and fetch positions providing the startindex and pagesize, currently hardcoded to 1 and 10
            let response = await this.getPositionContract.getPositionWithSafetyBuffer(positionManagerAddress,startIndex,offset)
    
            const {0: positions, 1: debtShares, 2: safetyBuffers} = response;
    
            let fetchedPositions: Position[] =  []; 
            let index = 0;
            positions.forEach((positionAddress: string) => {
                let debtShare = debtShares[index];
                let safetyBuffer = safetyBuffers[index];
                let position =  new Position(positionAddress,debtShare,safetyBuffer);
                console.log(LogLevel.info(`Position${index} address : ${positionAddress}, debtShare: ${debtShare}, safetyBuffer: ${safetyBuffer}`));
                fetchedPositions.push(position)
                index++;
            });
        
            return fetchedPositions;
        } catch(exception) {
            console.log(LogLevel.error(exception))
            return [];
        }
    }

    public async processPositions(positions:Position []) {
        //Filter the underwater position
        const underwaterPositions = positions.filter(position => (position.isUnSafe));
        //Sort based on debtshare
        const priortizePositions = underwaterPositions.sort((pos1,pos2)  => (pos1.debtShare.gt(pos2.debtShare) ? -1 : 1));
    
        return priortizePositions;
    }
}