import { request } from "@ainize-team/ainize-sdk/dist/types/type";
import { evaluate } from "./functions/service";
import { Request } from 'express';

type QueueData = request & {
    req: Request;
    amount: number;
};

export default class Queue {
    queue: Array<QueueData>;
    constructor() {
        this.queue = new Array();
    }

    push(data: QueueData) {
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
      console.log("before queue size:", this.size());
      if (this.size() === 0) {
        return null;
      }
      const data = this.queue.shift()!;
      console.log("shifted data:", data);
      if(this.size() > 0) {
        this.run();
      }
      return data;
    }

    run() {
      const { requestKey, requestData, appName, amount } = this.queue[0];
      try {
        requestData.request_key = requestKey;
        console.log('run: ', requestKey);
        evaluate(requestData);
      } catch(e) {
        console.log('error: ');
      }
    }
    
}