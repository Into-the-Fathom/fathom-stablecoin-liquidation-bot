"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionManager = void 0;
// import { ethers, utils } from "ethers";
const Position_1 = __importDefault(require("./types/Position"));
// import {getPositionContractAddress, 
//     positionManagerAddress} 
//     from '../../helpers/utils/addresses.js'
// import { LogLevel } from "../../helpers/config/config";
const Web3Utils_1 = require("./utils/Web3Utils");
const SmartContractFactory_1 = require("./config/SmartContractFactory");
const Web3EventsUtils_1 = require("./utils/Web3EventsUtils");
const config_1 = require("../../helpers/config/config");
const CURRENT_NETWORK = 51;
//This class will fetch onchain positions, process them and emit event to worker node in case of any underwater position...
//TODO: Handle position internally and notify 
class PositionManager {
    constructor(_consumer) {
        this.isBusy = false;
        this.consumer = _consumer;
        let options = {
            filter: {
                value: [],
            },
            fromBlock: 0
        };
        let positionManagerContract = Web3EventsUtils_1.Web3EventsUtils.getContractInstance(SmartContractFactory_1.SmartContractFactory.PositionManager(CURRENT_NETWORK), CURRENT_NETWORK);
        positionManagerContract.events.LogNewPosition(options).
            on('data', (event) => {
            console.log(config_1.LogLevel.keyEvent('================================'));
            console.log(config_1.LogLevel.keyEvent(`New position opened.`));
            console.log(config_1.LogLevel.keyEvent('================================'));
            if (this.consumer != undefined)
                this.consumer();
        }).
            on('error', (err) => {
            console.log(config_1.LogLevel.error(err));
        });
    }
    async getOpenPositions(startIndex, offset) {
        try {
            console.log(`Fetching positions at index ${startIndex}...`);
            let getPositionContract = Web3Utils_1.Web3Utils.getContractInstance(SmartContractFactory_1.SmartContractFactory.GetPositions(CURRENT_NETWORK), CURRENT_NETWORK);
            let response = await getPositionContract.methods.getPositionWithSafetyBuffer(SmartContractFactory_1.SmartContractFactory.PositionManager(CURRENT_NETWORK).address, startIndex, offset).call();
            const { 0: positions, 1: debtShares, 2: safetyBuffers } = response;
            let fetchedPositions = [];
            let index = 0;
            positions.forEach((positionAddress) => {
                let debtShare = debtShares[index];
                let safetyBuffer = safetyBuffers[index];
                let position = new Position_1.default(positionAddress, debtShare, safetyBuffer);
                console.log(`Position${index} address : ${positionAddress}, debtShare: ${debtShare}, safetyBuffer: ${safetyBuffer}`);
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
