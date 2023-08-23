import  { NextFunction, Request, Response } from 'express';
import Ain from '@ainblockchain/ain-js';
import NodeCache from 'node-cache';
import util from './util';
import { ActionType, ainizeInitalConfig, historyType, responseStatus } from './types';
export default class Ainize {
  cache: NodeCache;
  ain: Ain;
  appName: string;
  userAddress: string;
  userPrivateKey: string;
  util: util;
  constructor(config: ainizeInitalConfig) {
    const Ain = require('@ainblockchain/ain-js').default
    this.ain = new Ain('https://testnet-api.ainetwork.ai', 0);

    this.cache = new NodeCache();
    this.util = new util(this);
    this.appName = config.appName;
    this.userPrivateKey = config.userPrivateKey;
    this.userAddress = this.ain.wallet.addAndSetDefaultAccount(config.userPrivateKey);
  }
//general function
  createApp = (req:Request) => {
  
  }

//user function

//admin function

  setTriggerFunction = async ( endpoint:string, functionId: string, action:ActionType,path?:string) => {
    let triggerPath = '';
    switch(action){
      case ActionType.SERVICE:
        triggerPath = `/apps/${this.appName}/service/${functionId}`;
        break;
      case ActionType.DEPOSIT:
        triggerPath = `/apps/${this.appName}/deposit/${functionId}`;
        break;
      case ActionType.CUSTOM:
        if (!path) {
          throw new Error('path is required for custom action');
        }
        triggerPath = path;
      default:
        throw new Error('invalid action type');
    }
    await this.ain.db.ref(triggerPath)
    .setFunction({
      value: {
        '.function': {
          [functionId]: {
            function_type: 'REST',
            function_url: endpoint,
            function_id: functionId,
          },
        },
      },
      nonce: -1,
    })
  }

  writeResponse = async (req:Request, status: responseStatus, data: any)=> {
    const requestTimestamp = req.body.valuePath[4];
    const responsePath = this.util.getResponsePath(req);
    await this.ain.db.ref(responsePath).setValue({
      value:{
        status,
        data,
      },
      gas_price: 500,
      nonce: -1
    })
    //TODO(Woojae): change 0 to actual usage cost
    await this.changeBalance(req,'DEC', 1);
    await this.writeHistory(req, historyType.USAGE, 1 , requestTimestamp );
  }

  deposit = async (req:Request) => {
    const transferKey = req.body.valuePath[4];
    const transferValue = req.body.value;
    await this.changeBalance(req,'INC', transferValue);
    await this.writeHistory(req, historyType.DEPOSIT, transferValue, transferKey);
  }

  writeHistory  = async (req:Request, type: historyType, amount: number, key: string) => {
    const historyPath = await this.util.getHistoryPath(req);
    console.log("historyPath",historyPath);
    await this.ain.db.ref(historyPath).setValue({
      value:{
        type,
        amount,
        transferKey: type === historyType.DEPOSIT ? key : undefined,
        requestTimestamp: type === historyType.USAGE ? key : undefined,
      },
      gas_price: 500,
      nonce: -1
    });
  }

  changeBalance = async (req:Request,changeType: string, amount: number) => {
    const balancePath = this.util.getBalancePath(req);
    if(changeType === 'INC'){
      const result = await this.ain.db.ref(balancePath).incrementValue({
        value:amount,
        gas_price: 500,
        nonce: -1
      });
      console.log("incvalue result",result);
    }else {
      const result = await this.ain.db.ref(balancePath).decrementValue({
        value:amount,
        gas_price: 500,
        nonce: -1
      });
      console.log("incvalue result",result);
    }
    
  }

  


//middleware
  triggerDuplicateFilter = (req: Request, res: Response, next: NextFunction) => {
    if(req.body.fid === undefined){
      next();
    }
    const txHash = req.body.transaction.hash;
    if (this.cache.get(txHash) && this.cache.get(txHash) !== 'error') {
      res.send('duplicated');
      return;
    }
      // if request is first request, set cache 
    this.cache.set(txHash, "in_progress", 500);
    next();
  }
//POC
setAppName = (req: Request) => {
  const appName = req.body.valuePath[1];
  this.appName = appName;
}

}
