import ipc from 'node-ipc';
import Position from '../shared/types/Position'
import { Worker } from './src/worker';
import path from 'path';
import Logger from '../shared/utils/Logger';
import BN from 'bn.js';

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

ipc.config.appspace = 'securrancy-liquidation-bot';
ipc.config.id = 'worker';
ipc.config.silent = true;

let workerProcess = new Worker();
workerProcess.setupLiquidation();

ipc.serve('/tmp/newbedford.worker', () => {
  ipc.server.on('liquidation-candidate-add', async (message:Position) => {
    Logger.info(`Risky position with address: ${message.address}, 
    safety buffer: ${message.safetyBuffer}}`)
        
      await workerProcess.tryPerformingLiquidation(message);
  });

  ipc.server.on('liquidation-candidate-remove', (position:Position) => {
    Logger.debug('Candidate removed...')
    workerProcess.liquidate.removeLiquidationPosition(position);
  });

  ipc.server.on('keepalive', () => {
    Logger.debug('Staying alive...')
  });
});
ipc.server.start();


process.on('SIGINT', () => {
  //console.log(LogLevel.debug('\nCaught interrupt signal'));
  Logger.warn('\nCaught interrupt signal')
  ipc.server.stop();
//   provider.eth.clearSubscriptions();
//   provider.eth.closeConnections();
  Logger.info('Exited cleanly')
  process.exit();
});

