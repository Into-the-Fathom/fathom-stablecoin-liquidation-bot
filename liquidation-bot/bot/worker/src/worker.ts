import Position from "../types/Position";
import { Liquidate } from "./liquidate";
import { LiquidationEngine } from "./liquidationEngineSetup";

export class WorkerProcess{
    public readonly liquidate: Liquidate;
    private readonly liquidationEngine: LiquidationEngine;
  
    constructor(){
        this.liquidationEngine =  new LiquidationEngine();
        this.liquidate = new Liquidate(this.liquidationEngine.liquidationEngineAbiContract!);
    }
    
    public async setupLiquidation(){
        await this.liquidationEngine.setupLiquidationEngine();
    }
  
    public async tryPerformingLiquidation(position: Position){
        this.liquidate.addLiquidationPosition(position);
    }
  }
  