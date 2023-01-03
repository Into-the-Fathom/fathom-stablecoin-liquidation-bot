const { initTracer: initJaegerTracer } = require("jaeger-client");

export class Tracing {

    public static initTracer(serviceName:string){
        
        const config = {
            serviceName: serviceName,
            sampler: {
              type: "const",
              param: 1,
            },
            reporter: {
              logSpans: true,
              agentHost: 'jaeger',
              agentPort : 6832
            },
          };

          const options = {
            logger: {
              info(msg:string) {
                console.log("INFO ", msg);
              },
              error(msg:string) {
                console.log("ERROR", msg);
              },
            },
          };

          return initJaegerTracer(config, options);
    } 
}
