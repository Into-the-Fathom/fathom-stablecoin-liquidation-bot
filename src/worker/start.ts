import ipc from 'node-ipc';
import Position from '../shared/types/Position'
import { Worker } from './src/worker';
import Logger from '../shared/utils/Logger';

import { Tracing } from "../shared/utils/Tracing";

const tracer = Tracing.initTracer("liquidation-worker");


ipc.config.appspace = 'fathom.liquidation.bot';
ipc.config.id = 'worker';
ipc.config.silent = true;

let workerProcess = new Worker(tracer);

workerProcess.setupLiquidation();

ipc.serve('/tmp/fathom.bot.worker', () => {
  ipc.server.on('liquidation-candidate-add', async (position:Position) => {
      const span = tracer.startSpan("liquidation-candidate-add");
      const ctx = { span };

      span.setTag("position_address",position.positionAddress)

      await workerProcess.tryPerformingLiquidation(position,ctx);
      span.finish()
  });

  ipc.server.on('liquidation-candidate-remove', (position:Position) => {
    const span = tracer.startSpan("liquidation-candidate-removed");
    const ctx = { span };
    Logger.debug('Candidate removed...')
    span.setTag("position_address",position.positionAddress)
    workerProcess.liquidate.removeLiquidationPosition(position,ctx);
    span.finish()
  });

  ipc.server.on('keepalive', () => {
    console.log('Staying alive...')
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

