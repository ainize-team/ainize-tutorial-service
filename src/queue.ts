import { evaluate } from "./functions/service";
import { Request } from 'express';
type QueueData = {
    req: Request;
    requestKey: string;
    appName: string;
    requestData: any;
    requesterAddress: string;
    amount: number;
}

export default class Queue {
    queue: Array<QueueData>;
    constructor() {
        this.queue = new Array();
    }
    push(data:QueueData) {
        this.queue.push(data);
        if(this.size() === 1) {
          this.run();
        }
    }
    shift() {
        return this.queue.shift();
    }
    size() {
        return this.queue.length;
    }
    finish() {
        const data = this.queue.shift()!;
        if(this.size() > 0) {
           this.run();
        }
        return data;
    }

    run() {
      const { requestData, appName, amount } = this.queue[0];
      evaluate(requestData);
      console.log(appName, requestData, amount);
    }
    
}