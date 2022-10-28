"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionManager = void 0;
const Web3Utils_1 = require("../../shared/web3/Web3Utils");
const SmartContractFactory_1 = require("../../shared/web3/SmartContractFactory");
const Position_1 = __importDefault(require("../../shared/types/Position"));
const Logger_1 = __importDefault(require("../../shared/utils/Logger"));
//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
class PositionManager {
    constructor() {
        this.isBusy = false;
        this.networkId = 51;
        this.networkId = parseInt(process.env.NETWORK_ID);
    }
    async getOpenPositions(startIndex, offset) {
        try {
            Logger_1.default.debug(`Fetching positions at index ${startIndex}...`);
            let getPositionContract = Web3Utils_1.Web3Utils.getContractInstance(SmartContractFactory_1.SmartContractFactory.GetPositionsLiquidationBot(this.networkId), this.networkId);
            let response = await getPositionContract.methods.getPositionWithSafetyBuffer(SmartContractFactory_1.SmartContractFactory.PositionManager(this.networkId).address, startIndex, offset).call();
            const { 0: positions, 1: debtShares, 2: safetyBuffers, 3: poolIds } = response;
            let fetchedPositions = [];
            let index = 0;
            positions.forEach((positionAddress) => {
                let poolId = poolIds[index];
                let debtShare = debtShares[index];
                let safetyBuffer = safetyBuffers[index];
                let position = new Position_1.default(positionAddress, poolId, debtShare, safetyBuffer);
                if (debtShare > 0 && safetyBuffer > 0) {
                    Logger_1.default.debug(`Position${index} address : ${positionAddress}, poolId: ${poolId}, debtShare: ${debtShare}, safetyBuffer: ${safetyBuffer}`);
                }
                fetchedPositions.push(position);
                index++;
            });
            return fetchedPositions;
        }
        catch (exception) {
            console.log(exception);
            return [];
        }
    }
    async processPositions(positions) {
        //Filter the underwater position
        const underwaterPositions = positions.filter(position => (position.isUnSafe));
        //Sort based on debtshare
        const priortizePositions = underwaterPositions.sort((pos1, pos2) => (pos1.debtShare.gt(pos2.debtShare) ? -1 : 1));
        return priortizePositions;
    }
}
exports.PositionManager = PositionManager;
