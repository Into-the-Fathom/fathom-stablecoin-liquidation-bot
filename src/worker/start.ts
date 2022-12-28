import ipc from 'node-ipc';
import Position from '../shared/types/Position'
import { Worker } from './src/worker';
import Logger from '../shared/utils/Logger';

import { Tracing } from "../shared/utils/Tracing";

const tracer = Tracing.initTracer("liquidation-worker");


ipc.config.appspace = 'securrancy-liquidation-bot';
ipc.config.id = 'worker';
ipc.config.silent = true;

let workerProcess = new Worker();

workerProcess.setupLiquidation();

ipc.serve('/tmp/newbedford.worker', () => {
  ipc.server.on('liquidation-candidate-add', async (message:Position) => {
      await workerProcess.tryPerformingLiquidation(message);
  });

  ipc.server.on('liquidation-candidate-remove', (position:Position) => {
    Logger.debug('Candidate removed...')
    workerProcess.liquidate.removeLiquidationPosition(position);
  });

  ipc.server.on('keepalive', () => {
    const span = tracer.startSpan("position-search");
    console.log('Staying alive...')
    span.log({ event: "ping" });
    span.finish()
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

