"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const liquidate_1 = require("./liquidate");
const liquidationEngine_1 = require("./liquidationEngine");
class Worker {
    constructor() {
        this.liquidationEngine = new liquidationEngine_1.LiquidationEngine();
        this.liquidate = new liquidate_1.Liquidator();
    }
    async setupLiquidation() {
        await this.liquidationEngine.setupLiquidationEngine();
    }
    async tryPerformingLiquidation(position) {
        this.liquidate.addLiquidationPosition(position);
    }
}
exports.Worker = Worker;
