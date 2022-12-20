import ipc from 'node-ipc';

import { EventListener } from './src/EventListener';
import path from 'path';

// require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

import Logger from '../shared/utils/Logger';
import { IPositionService } from './src/interface/IPositionService';
import { GraphPositionsManager } from './src/GraphPositionsManager';
import { RedisClient } from '../shared/utils/RedisClient';
import { Constants } from './src/utils/Constants';

let candidatesObj = {
  previous: <string[]>[],
};

var positionManager: IPositionService;
var cacheManager: RedisClient;

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
      const rawPositions = await positionManager.getOpenPositions(Constants.MAX_POSITION_PER_QUERY,pageIndex);
      fetchMore = rawPositions.length < Constants.MAX_POSITION_PER_QUERY ? false : true;
      pageIndex++;

      if(rawPositions.length > 0){
        Logger.info(`Total risky positions ${rawPositions.length}`)
    
        rawPositions.forEach((candidate) => {
          //Check if position is already in redis queue
          RedisClient.getInstance().getValue(`position_id:${candidate.positionAddress}`).then(value => {
            if(value != "1"){
              candidatesSet.add(candidate.positionAddress);
              ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-add', candidate));
            }else{
              Logger.info(`Position ${candidate.positionAddress} already in queue...`)
            }
          })
        });
      }
    }
  }catch(exception){
    Logger.error(exception)
  }finally{
    positionManager.isBusy = false;
    Logger.debug('Position Search Complete!')
  }

  candidatesObj.previous.forEach((address) => {
    if (candidatesSet.has(address)) return;
    ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-remove', address));
  });

  candidatesObj.previous = Array.from(candidatesSet);
}

async function start(ipcTxManagers: any[]) {
  await RedisClient.getInstance().connect()
  positionManager = new GraphPositionsManager()
  // positionManager = new PositionManager()
  setInterval(() => ipcTxManagers.forEach((i) => i.emit('keepalive', '')), 10 * 1 * 1000);
  scan(ipcTxManagers);
  const eventListener = new EventListener(() => scan(ipcTxManagers));
}

function stop() {
  RedisClient.getInstance().disconnect()
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

ipc.connectTo('worker', '/tmp/newbedford.worker', () => {
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
