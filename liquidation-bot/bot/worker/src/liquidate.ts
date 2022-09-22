import { ethers, utils } from "ethers";
import { formatBytes32String, parseEther } from "ethers/lib/utils";
import Position from '../types/Position'
const MaxUint256 = require("@ethersproject/constants");
import {fixedSpreadLiquidationStrategyAddress} from '../../helpers/utils/addresses.js'
import { COLLATERAL_POOL_ID, LogLevel, provider } from "../../helpers/config/config";
import Queue from 'queue-fifo';
import path from "path";
import { config } from "dotenv";


config({ path: path.resolve(__dirname, '../../../../.env') });


export class Liquidate{

    //TODO: replace it with FIFO queue
    private badPositionsQueue:Queue<Position>;

//    private arrPositions:Position[];
    private fetchHandle: NodeJS.Timeout | null = null;
    private readonly liquidationEngineAbiContract;

    constructor(_liquidationEngineAbiContract:ethers.Contract) {
        // this.arrPositions = [];
        this.badPositionsQueue = new Queue()
        this.liquidationEngineAbiContract = _liquidationEngineAbiContract;

        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);

        //TODO: Check if we can do it in better way
        this.fetchHandle = setInterval(this.checkAndLiquidate.bind(this), 5*1000);

        const eventFilter = {
            address: fixedSpreadLiquidationStrategyAddress,
            topics: [
                utils.id("LogFixedSpreadLiquidate(bytes32,uint256,uint256,address,uint256,uint256,address,address,uint256,uint256,uint256,uint256)"),
            ]
        }

        provider.on(eventFilter, (log, event) => {
            let topics = log.topics;
            let topic: string = topics[2].replace('0x000000000000000000000000','0x');
            console.log(LogLevel.keyEvent('============================================================================'));
            console.log(LogLevel.keyEvent(`** Liquidation Complete for ${topic} **`));
            console.log(LogLevel.keyEvent('============================================================================'));
        })
    }

    public addLiquidationPosition(position: Position) {
        this.badPositionsQueue.enqueue(position)
    }

    public removeLiquidationPosition(position: Position) {
        this.badPositionsQueue.dequeue();
    }

    private async checkAndLiquidate(){
        if (this.badPositionsQueue.isEmpty())
            return;
        
        let position = this.badPositionsQueue.dequeue();
        if (position != undefined) {
            try {
                console.log(LogLevel.keyEvent(`Performing liquidation on position ${position.address}`));
                await this.liquidationEngineAbiContract.liquidate(COLLATERAL_POOL_ID, position.address, position.debtShare, MaxUint256.MaxUint256, process.env.LIQUIDATOR_ADDRESS, "0x00")
            } catch(exception) {
                console.log(LogLevel.error(exception))
            }
        }
    }
}