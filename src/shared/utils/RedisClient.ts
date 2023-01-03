import { createClient } from 'redis';

export class RedisClient {

    static instance: RedisClient;
    private redisClient : any;
    private isConnected : any;

    private constructor() {
        //process.env.REDIS_SERVER_IP
        this.redisClient = createClient({ url: 'redis://redis:6379' })//createClient();
        this.redisClient.on('error', (err:any) => console.log('Redis Client Error', err));
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public async connect(){
        await this.redisClient.connect();
    } 

    public async disconnect(){
        await this.redisClient.disconnect();
    } 

    public async setValue(key:string, value:any){
        await this.redisClient.set(key, value);
    }
    
    public async setValueWithExpiration(key:string, value:any, expirationDuration:number = 60*3){
        await this.redisClient.set(key, value,'EX',expirationDuration);
    }

    public async deleteValue(key:string){
        await this.redisClient.del(key);
    }

    public async getValue(key:string){
        const value = await this.redisClient.get(key);
        return value;
    }

    
}