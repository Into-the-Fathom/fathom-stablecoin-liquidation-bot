import Position from '../../shared/types/Position'
import { Liquidator } from "./liquidate";
import { LiquidationEngine } from "./liquidationEngine";
import { RedisClient } from "../../shared/utils/RedisClient";
import Logger from '../../shared/utils/Logger';
const opentracing = require('opentracing');


export class Worker{
    public readonly liquidate: Liquidator;
    private readonly liquidationEngine: LiquidationEngine;
    private readonly tracer:any;

  
    constructor(tracer:any){
        this.tracer = tracer
        this.liquidationEngine =  new LiquidationEngine(tracer);
        this.liquidate = new Liquidator(tracer);
    }
    
    public async setupLiquidation(){
        const span = this.tracer.startSpan("setup-liquidation");
        const ctx = { span };
        try{
            await RedisClient.getInstance().connect()
            await this.liquidationEngine.setupLiquidationEngine(ctx);
        }catch(exception){
            Logger.error(`Error in setupLiquidation(): ${JSON.stringify(exception)}`)
            span.setTag(opentracing.Tags.ERROR, true);
            span.log({ event: "error", message: `Error in setupLiquidation(): ${JSON.stringify(exception)}`});
        }finally{
            span.finish()
        }
    }
  
    public async tryPerformingLiquidation(position: Position,ctx:any){
        ctx = {
            span: this.tracer.startSpan("try-performing-liquidation", { childOf: ctx.span }),
        };
        try{
            ctx.span.setTag("position-address", position.positionAddress);
            await this.liquidate.addLiquidationPosition(position,ctx);
        }catch(exception){
            Logger.error(`Error in tryPerformingLiquidation(): ${JSON.stringify(exception)}`)
            ctx.span.setTag(opentracing.Tags.ERROR, true);
            ctx.span.log({ event: "error", "error.object": JSON.stringify(exception) })
        }finally{
            ctx.span.finish()
        }
    }
  }
  