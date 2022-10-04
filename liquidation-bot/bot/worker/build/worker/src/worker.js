"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerProcess = void 0;
const liquidate_1 = require("./liquidate");
const liquidationEngineSetup_1 = require("./liquidationEngineSetup");
class WorkerProcess {
    constructor() {
        this.liquidationEngine = new liquidationEngineSetup_1.LiquidationEngine();
        this.liquidate = new liquidate_1.Liquidate(this.liquidationEngine.liquidationEngineAbiContract);
    }
    async setupLiquidation() {
        await this.liquidationEngine.setupLiquidationEngine();
    }
    async tryPerformingLiquidation(position) {
        this.liquidate.addLiquidationPosition(position);
    }
}
exports.WorkerProcess = WorkerProcess;
