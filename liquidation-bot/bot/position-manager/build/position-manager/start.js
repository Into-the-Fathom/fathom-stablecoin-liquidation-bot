"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_ipc_1 = __importDefault(require("node-ipc"));
const PositionsManager_1 = require("./src/PositionsManager");
const config_1 = require("../helpers/config/config");
const EventListener_1 = require("./src/EventListener");
let candidatesObj = {
    previous: [],
};
const PAGE_SIZE = 20;
var positionManager;
async function scan(ipcTxManagers) {
    const candidatesSet = new Set();
    if (positionManager.isBusy) {
        console.log(config_1.LogLevel.debug('Already searching for positions...'));
        return;
    }
    console.log(config_1.LogLevel.debug('Searching for positions...'));
    positionManager.isBusy = true;
    let fetchMore = true;
    let pageIndex = 0;
    try {
        while (fetchMore) {
            const rawPositions = await positionManager.getOpenPositions((pageIndex * PAGE_SIZE) + 1, PAGE_SIZE);
            fetchMore = rawPositions.length < PAGE_SIZE ? false : true;
            pageIndex++;
            console.log(config_1.LogLevel.debug(`Found ${rawPositions.length} positions at page: ${pageIndex}`));
            let candidates = await positionManager.processPositions(rawPositions);
            if (candidates.length > 0) {
                console.log(config_1.LogLevel.error(`Total risky positions ${candidates.length}`));
                candidates.forEach((candidate) => {
                    candidatesSet.add(candidate.address);
                    ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-add', candidate));
                });
            }
        }
    }
    catch (exception) {
        console.log(config_1.LogLevel.error(exception));
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
    positionManager = new PositionsManager_1.PositionManager();
    setInterval(() => ipcTxManagers.forEach((i) => i.emit('keepalive', '')), 10 * 1 * 1000);
    scan(ipcTxManagers);
    const eventListener = new EventListener_1.EventListener(() => scan(ipcTxManagers));
}
function stop() {
    // priceChecker.stop();
    //   provider.eth.clearSubscriptions();
    //   // @ts-expect-error: We already checked that type is valid
    //   provider.eth.currentProvider.connection.destroy();
}
node_ipc_1.default.config.appspace = 'securrancy-liquidation-bot';
node_ipc_1.default.config.id = 'position-manager';
node_ipc_1.default.config.silent = true;
// ipc.connectTo('txmanager', '/tmp/newbedford.txmanager', () => {
//   ipc.of['txmanager'].on('connect', () => {
//     console.log("Connected to TxManager's IPC");
node_ipc_1.default.connectTo('worker', '/tmp/newbedford.worker', () => {
    node_ipc_1.default.of['worker'].on('connect', () => {
        console.log(config_1.LogLevel.debug("Connected to worker IPC"));
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
    console.log(config_1.LogLevel.error('\nCaught interrupt signal'));
    // ipc.disconnect('txmanager');
    node_ipc_1.default.disconnect('worker');
    stop();
    console.log(config_1.LogLevel.debug('Exited cleanly'));
    process.exit();
});
