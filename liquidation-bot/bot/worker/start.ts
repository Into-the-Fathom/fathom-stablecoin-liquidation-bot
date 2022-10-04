import { ethers } from 'ethers';
import ipc from 'node-ipc';
import Position from './types/Position';
import { WorkerProcess } from './src/worker';
import { LogLevel } from '../helpers/config/config';


ipc.config.appspace = 'securrancy-liquidation-bot';
ipc.config.id = 'worker';
ipc.config.silent = true;

let workerProcess = new WorkerProcess();
//workerProcess.setupLiquidation();

ipc.serve('/tmp/newbedford.worker', () => {
  ipc.server.on('liquidation-candidate-add', async (message:Position) => {
      console.log(LogLevel.error(`Risky position with address: ${message.address}, 
                              safety buffer: ${ethers.BigNumber.from(message.safetyBuffer)}}`))
        
      await workerProcess.tryPerformingLiquidation(message);
  });

  ipc.server.on('liquidation-candidate-remove', (position:Position) => {
    console.log(LogLevel.keyEvent('Candidate removed...'));
    workerProcess.liquidate.removeLiquidationPosition(position);
  });

  ipc.server.on('keepalive', () => {
    console.log(LogLevel.debug('Staying alive...'));
  });
});
ipc.server.start();


process.on('SIGINT', () => {
  //console.log(LogLevel.debug('\nCaught interrupt signal'));
  console.log(LogLevel.info('\nCaught interrupt signal'));
  ipc.server.stop();
//   provider.eth.clearSubscriptions();
//   provider.eth.closeConnections();
  console.log(LogLevel.debug('Exited cleanly'));
  process.exit();
});

