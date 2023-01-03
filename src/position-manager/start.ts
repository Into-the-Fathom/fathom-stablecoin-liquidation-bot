import ipc from 'node-ipc';

import { EventListener } from './src/EventListener';
import path from 'path';

// require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

import Logger from '../shared/utils/Logger';
import { IPositionService } from './src/interface/IPositionService';
import { GraphPositionsManager } from './src/GraphPositionsManager';
import { RedisClient } from '../shared/utils/RedisClient';
import { Constants } from './src/utils/Constants';
import { Tracing } from "../shared/utils/Tracing";
import PriceChecker from './src/PriceCheker';

const tracer = Tracing.initTracer("position-manager");

let candidatesObj = {
  previous: <string[]>[],
};

var positionManager: IPositionService;
var cacheManager: RedisClient;
const priceChecker = new PriceChecker(tracer);


async function scan(ipcTxManagers: any[]) {
  const span = tracer.startSpan("position-search");

  const candidatesSet = new Set<string>();

  if(positionManager.isBusy){
    Logger.debug('Already searching for positions...')
    span.log({ event: "positionManager-busy" });
    return;
  }

  Logger.debug('Searching for positions...')
  positionManager.isBusy = true;
  let fetchMore = true;
  let pageIndex = 0;

  try{
    while(fetchMore){
      const rawPositions = await positionManager.getRiskyPositions(Constants.MAX_POSITION_PER_QUERY,pageIndex);
      fetchMore = rawPositions.length < Constants.MAX_POSITION_PER_QUERY ? false : true;
      pageIndex++;

      if(rawPositions.length > 0){
        Logger.info(`Total risky positions ${rawPositions.length}`)

        span.log({
          event: "risky-position",
          value: rawPositions,
        });
    
        rawPositions.forEach((candidate) => {
          //Check if position is already in redis queue
          RedisClient.getInstance().getValue(`position_id:${candidate.positionAddress}`).then(value => {
            if(value != "1"){
              candidatesSet.add(candidate.positionAddress);
              ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-add', candidate));
            }else{
              Logger.info(`Position ${candidate.positionAddress} already in queue...`)
              span.log({ event: "position-already-queued" });
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
    span.log({ event: "position-search-complete" });
    span.finish();
  }

  candidatesObj.previous.forEach((address) => {
    if (candidatesSet.has(address)) return;
    ipcTxManagers.forEach((i) => i.emit('liquidation-candidate-remove', address));
  });

  candidatesObj.previous = Array.from(candidatesSet);
}

async function start(ipcTxManagers: any[]) {
  try{
    positionManager = new GraphPositionsManager(tracer)
    setInterval(() => ipcTxManagers.forEach((i) => i.emit('keepalive', '')), 10 * 1 * 1000);
    scan(ipcTxManagers);
    const eventListener = new EventListener(() => scan(ipcTxManagers));
    await RedisClient.getInstance().connect()
    priceChecker.init(() => scan(ipcTxManagers));
  }catch(exception){
    Logger.error(`Error in PositionManager:start(): ${JSON.stringify(exception)}`)
  }finally{
    
  }
}

async function stop() {
  await RedisClient.getInstance().disconnect()
  priceChecker.stop();
//   provider.eth.clearSubscriptions();
//   // @ts-expect-error: We already checked that type is valid
//   provider.eth.currentProvider.connection.destroy();

//   provider.eth.clearSubscriptions();
//   provider.eth.closeConnections();

}

ipc.config.appspace = 'fathom.liquidation.bot';
ipc.config.id = 'position-manager';
ipc.config.silent = true;
// ipc.connectTo('txmanager', '/tmp/newbedford.txmanager', () => {
//   ipc.of['txmanager'].on('connect', () => {
//     console.log("Connected to TxManager's IPC");

ipc.connectTo('worker', '/tmp/fathom.bot.worker', () => {
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
