import ipc from 'node-ipc';

import {PositionManager} from './src/PositionsManager';
import {LogLevel} from '../helpers/config/config'
import { EventListener } from './src/EventListener';
import { config } from "dotenv";


let candidatesObj = {
  previous: <string[]>[],
};

const PAGE_SIZE = 20;

var positionManager: PositionManager;

async function scan(ipcTxManagers: any[]) {
  const candidatesSet = new Set<string>();

  if(positionManager.isBusy){
    console.log(LogLevel.debug('Already searching for positions...'));
    return;
  }

  console.log(LogLevel.debug('Searching for positions...'));
  positionManager.isBusy = true;
  let fetchMore = true;
  let pageIndex = 0;

  try{
    while(fetchMore){
      const rawPositions = await positionManager.getOpenPositions((pageIndex*PAGE_SIZE)+1,PAGE_SIZE);
      fetchMore = rawPositions.length < PAGE_SIZE ? false : true;
      pageIndex++;
      console.log(LogLevel.debug(`Found ${rawPositions.length} positions at page: ${pageIndex}`));
  
      let candidates = await positionManager.processPositions(rawPositions);
    
      if(candidates.length > 0){
        console.log(LogLevel.error(`Total risky positions ${candidates.length}`));
    
        candidates.forEach((candidate) => {
          candidatesSet.add(candidate.address);
          ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-add', candidate));
        });
      }
    }
  }catch(exception){
    console.log(LogLevel.error(exception))
  }finally{
    positionManager.isBusy = false;
  }

  candidatesObj.previous.forEach((address) => {
    if (candidatesSet.has(address)) return;
    ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-remove', address));
  });

  candidatesObj.previous = Array.from(candidatesSet);
}

async function start(ipcTxManagers: any[]) {
  positionManager = new PositionManager()
  setInterval(() => ipcTxManagers.forEach((i) => i.emit('keepalive', '')), 10 * 1 * 1000);
  scan(ipcTxManagers);
  const eventListener = new EventListener(() => scan(ipcTxManagers));
}

function stop() {
  // priceChecker.stop();
//   provider.eth.clearSubscriptions();
//   // @ts-expect-error: We already checked that type is valid
//   provider.eth.currentProvider.connection.destroy();
}

ipc.config.appspace = 'securrancy-liquidation-bot';
ipc.config.id = 'position-manager';
ipc.config.silent = true;
// ipc.connectTo('txmanager', '/tmp/newbedford.txmanager', () => {
//   ipc.of['txmanager'].on('connect', () => {
//     console.log("Connected to TxManager's IPC");

ipc.connectTo('worker', '/tmp/newbedford.worker', () => {
  ipc.of['worker'].on('connect', () => {
    console.log(LogLevel.debug("Connected to worker IPC"));

    start([ipc.of['worker']]);
  });
});

//   ipc.of['txmanager'].on('disconnect', () => {
//     console.log("Disconnected from TxManager's IPC");
//     stop();
//     process.exit();
//   });
// });

process.on('SIGINT', () => {
  console.log(LogLevel.error('\nCaught interrupt signal'));
  // ipc.disconnect('txmanager');
  ipc.disconnect('worker')
  stop();
  console.log(LogLevel.debug('Exited cleanly'));
  process.exit();
});
