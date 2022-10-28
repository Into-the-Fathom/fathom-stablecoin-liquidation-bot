"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_ipc_1 = __importDefault(require("node-ipc"));
const EventListener_1 = require("./src/EventListener");
const path_1 = __importDefault(require("path"));
require('dotenv').config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const Logger_1 = __importDefault(require("../shared/utils/Logger"));
const GraphPositionsManager_1 = require("./src/GraphPositionsManager");
let candidatesObj = {
    previous: [],
};
const PAGE_SIZE = 20;
var positionManager;
async function scan(ipcTxManagers) {
    const candidatesSet = new Set();
    if (positionManager.isBusy) {
        Logger_1.default.debug('Already searching for positions...');
        return;
    }
    Logger_1.default.debug('Searching for positions...');
    positionManager.isBusy = true;
    let fetchMore = true;
    let pageIndex = 0;
    try {
        while (fetchMore) {
            const rawPositions = await positionManager.getOpenPositions((pageIndex * PAGE_SIZE) + 1, PAGE_SIZE);
            fetchMore = rawPositions.length < PAGE_SIZE ? false : true;
            pageIndex++;
            let candidates = await positionManager.processPositions(rawPositions);
            if (candidates.length > 0) {
                Logger_1.default.info(`Total risky positions ${candidates.length}`);
                candidates.forEach((candidate) => {
                    candidatesSet.add(candidate.positionAddress);
                    ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-add', candidate));
                });
            }
        }
    }
    catch (exception) {
        Logger_1.default.error(exception);
    }
    finally {
        positionManager.isBusy = false;
    }
    candidatesObj.previous.forEach((address) => {
        if (candidatesSet.has(address))
            return;
        ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-remove', address));
    });
    candidatesObj.previous = Array.from(candidatesSet);
}
async function start(ipcTxManagers) {
    positionManager = new GraphPositionsManager_1.GraphPositionsManager();
    setInterval(() => ipcTxManagers.forEach((i) => i.emit('keepalive', '')), 10 * 1 * 1000);
    scan(ipcTxManagers);
    const eventListener = new EventListener_1.EventListener(() => scan(ipcTxManagers));
}
function stop() {
    // priceChecker.stop();
    //   provider.eth.clearSubscriptions();
    //   // @ts-expect-error: We already checked that type is valid
    //   provider.eth.currentProvider.connection.destroy();
    //   provider.eth.clearSubscriptions();
    //   provider.eth.closeConnections();
}
node_ipc_1.default.config.appspace = 'securrancy-liquidation-bot';
node_ipc_1.default.config.id = 'position-manager';
node_ipc_1.default.config.silent = true;
// ipc.connectTo('txmanager', '/tmp/newbedford.txmanager', () => {
//   ipc.of['txmanager'].on('connect', () => {
//     console.log("Connected to TxManager's IPC");
node_ipc_1.default.connectTo('worker', '/tmp/newbedford.worker', () => {
    Logger_1.default.info(`#### MongoDB URL : ${process.env.MONGODB_URL} ###`);
    node_ipc_1.default.of['worker'].on('connect', () => {
        Logger_1.default.debug("Connected to worker IPC");
        start([node_ipc_1.default.of['worker']]);
    });
});
//   ipc.of['txmanager'].on('disconnect', () => {
//     console.log("Disconnected from TxManager's IPC");
//     stop();
//     process.exit();
//   });
// });
process.on('SIGINT', () => {
    Logger_1.default.error('Exited cleanly');
    // ipc.disconnect('txmanager');
    node_ipc_1.default.disconnect('worker');
    stop();
    Logger_1.default.debug('Exited cleanly');
    process.exit();
});
