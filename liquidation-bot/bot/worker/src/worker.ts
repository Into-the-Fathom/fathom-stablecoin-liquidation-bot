import Position from '../../shared/types/Position'
import { Liquidator } from "./liquidate";
import { LiquidationEngine } from "./liquidationEngine";
import { RedisClient } from "../utils/RedisClient";


export class Worker{
    public readonly liquidate: Liquidator;
    private readonly liquidationEngine: LiquidationEngine;
  
    constructor(){
        this.liquidationEngine =  new LiquidationEngine();
        this.liquidate = new Liquidator();
    }
    
    public async setupLiquidation(){
        await RedisClient.getInstance().connect()
        await this.liquidationEngine.setupLiquidationEngine();
    }
  
    public async tryPerformingLiquidation(position: Position){
        this.liquidate.addLiquidationPosition(position);
    }
  }
  