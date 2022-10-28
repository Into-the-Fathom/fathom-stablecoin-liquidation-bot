"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_ipc_1 = __importDefault(require("node-ipc"));
const worker_1 = require("./src/worker");
const path_1 = __importDefault(require("path"));
const Logger_1 = __importDefault(require("../shared/utils/Logger"));
require('dotenv').config({ path: path_1.default.resolve(__dirname, '../../../.env') });
node_ipc_1.default.config.appspace = 'securrancy-liquidation-bot';
node_ipc_1.default.config.id = 'worker';
node_ipc_1.default.config.silent = true;
let workerProcess = new worker_1.Worker();
workerProcess.setupLiquidation();
node_ipc_1.default.serve('/tmp/newbedford.worker', () => {
    node_ipc_1.default.server.on('liquidation-candidate-add', async (message) => {
        Logger_1.default.info(`Risky position with address: ${message.positionAddress}, 
    safety buffer: ${message.safetyBuffer}}`);
        await workerProcess.tryPerformingLiquidation(message);
    });
    node_ipc_1.default.server.on('liquidation-candidate-remove', (position) => {
        Logger_1.default.debug('Candidate removed...');
        workerProcess.liquidate.removeLiquidationPosition(position);
    });
    node_ipc_1.default.server.on('keepalive', () => {
        Logger_1.default.debug('Staying alive...');
    });
});
node_ipc_1.default.server.start();
process.on('SIGINT', () => {
    //console.log(LogLevel.debug('\nCaught interrupt signal'));
    Logger_1.default.warn('\nCaught interrupt signal');
    node_ipc_1.default.server.stop();
    //   provider.eth.clearSubscriptions();
    //   provider.eth.closeConnections();
    Logger_1.default.info('Exited cleanly');
    process.exit();
});
