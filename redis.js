import { createClient } from 'redis';

export class RedisClient{

    constructor(){
        this.client;
    }

    async connect(){
        this.client = await createClient().on('error', err => console.log('Redis Client Error', err)).connect();
    }

    async set(key, value){
        await this.client.set(key, value);
    }

    async get(key){
        return await this.client.get(key);
    }

    async disconnect(){
        await this.client.quit();
    }
}