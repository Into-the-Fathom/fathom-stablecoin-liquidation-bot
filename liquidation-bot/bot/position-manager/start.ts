import ipc from 'node-ipc';

import {PositionManager} from './src/PositionsManager';
import { EventListener } from './src/EventListener';
import path from 'path';
import Logger from './src/utils/Logger';

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


let candidatesObj = {
  previous: <string[]>[],
};

const PAGE_SIZE = 20;

var positionManager: PositionManager;

async function scan(ipcTxManagers: any[]) {
  const candidatesSet = new Set<string>();

  if(positionManager.isBusy){
    Logger.debug('Already searching for positions...')
    return;
  }

  Logger.debug('Searching for positions...')
  positionManager.isBusy = true;
  let fetchMore = true;
  let pageIndex = 0;

  try{
    while(fetchMore){
      const rawPositions = await positionManager.getOpenPositions((pageIndex*PAGE_SIZE)+1,PAGE_SIZE);
      fetchMore = rawPositions.length < PAGE_SIZE ? false : true;
      pageIndex++;

      let candidates = await positionManager.processPositions(rawPositions);
    
      if(candidates.length > 0){
        Logger.warn(`Total risky positions ${candidates.length}`)
    
        candidates.forEach((candidate) => {
          candidatesSet.add(candidate.address);
          ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-add', candidate));
        });
      }
    }
  }catch(exception){
    Logger.error(exception)
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

//   provider.eth.clearSubscriptions();
//   provider.eth.closeConnections();

}

ipc.config.appspace = 'securrancy-liquidation-bot';
ipc.config.id = 'position-manager';
ipc.config.silent = true;
// ipc.connectTo('txmanager', '/tmp/newbedford.txmanager', () => {
//   ipc.of['txmanager'].on('connect', () => {
//     console.log("Connected to TxManager's IPC");

ipc.connectTo('worker', '/usr/src/app', () => {
  ipc.of['worker'].on('connect', () => {
    Logger.debug("Connected to worker IPC")
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
  Logger.error('Exited cleanly')
  // ipc.disconnect('txmanager');
  ipc.disconnect('worker')
  stop();
  Logger.debug('Exited cleanly')
  process.exit();
});
