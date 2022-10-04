"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const node_ipc_1 = __importDefault(require("node-ipc"));
const worker_1 = require("./src/worker");
const config_1 = require("../helpers/config/config");
node_ipc_1.default.config.appspace = 'securrancy-liquidation-bot';
node_ipc_1.default.config.id = 'worker';
node_ipc_1.default.config.silent = true;
let workerProcess = new worker_1.WorkerProcess();
//workerProcess.setupLiquidation();
node_ipc_1.default.serve('/tmp/newbedford.worker', () => {
    node_ipc_1.default.server.on('liquidation-candidate-add', async (message) => {
        console.log(config_1.LogLevel.error(`Risky position with address: ${message.address}, 
                              safety buffer: ${ethers_1.ethers.BigNumber.from(message.safetyBuffer)}}`));
        await workerProcess.tryPerformingLiquidation(message);
    });
    node_ipc_1.default.server.on('liquidation-candidate-remove', (position) => {
        console.log(config_1.LogLevel.keyEvent('Candidate removed...'));
        workerProcess.liquidate.removeLiquidationPosition(position);
    });
    node_ipc_1.default.server.on('keepalive', () => {
        console.log(config_1.LogLevel.debug('Staying alive...'));
    });
});
node_ipc_1.default.server.start();
process.on('SIGINT', () => {
    //console.log(LogLevel.debug('\nCaught interrupt signal'));
    console.log(config_1.LogLevel.info('\nCaught interrupt signal'));
    node_ipc_1.default.server.stop();
    //   provider.eth.clearSubscriptions();
    //   provider.eth.closeConnections();
    console.log(config_1.LogLevel.debug('Exited cleanly'));
    process.exit();
});
