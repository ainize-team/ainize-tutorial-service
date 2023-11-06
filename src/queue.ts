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
        console.log('pushed!: ', data.requestKey)
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
      console.log("queue: ",this.queue);
      console.log("queue size:", this.size());
      if(this.size() > 0) {
        this.run();
      }
      return data;
    }

    run() {
      const { requestKey, requestData, appName, amount } = this.queue[0];
      try{
        requestData.prompt.request_key = requestKey;
        evaluate(requestData);
      } catch(e) {
        console.log('error: ');
      }
      console.log(appName, requestData, amount);
    }
    
}