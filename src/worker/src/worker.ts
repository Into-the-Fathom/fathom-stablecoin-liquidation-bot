import Position from '../../shared/types/Position'
import { Liquidator } from "./liquidate";
import { LiquidationEngine } from "./liquidationEngine";
import { RedisClient } from "../../shared/utils/RedisClient";
import Logger from '../../shared/utils/Logger';


export class Worker{
    public readonly liquidate: Liquidator;
    private readonly liquidationEngine: LiquidationEngine;
  
    constructor(){
        this.liquidationEngine =  new LiquidationEngine();
        this.liquidate = new Liquidator();
    }
    
    public async setupLiquidation(){
        try{
            await RedisClient.getInstance().connect()
            await this.liquidationEngine.setupLiquidationEngine();
        }catch(exception){
            Logger.error(`Error in setupLiquidation(): ${JSON.stringify(exception)}`)
        }
    }
  
    public async tryPerformingLiquidation(position: Position){
        try{
            await this.liquidate.addLiquidationPosition(position);
        }catch(exception){
            Logger.error(`Error in tryPerformingLiquidation(): ${JSON.stringify(exception)}`)
        }
    }
  }
  