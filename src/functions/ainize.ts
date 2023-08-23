import  { NextFunction, Request, Response } from 'express';
import Ain from '@ainblockchain/ain-js';
import NodeCache from 'node-cache';
import util from './util';
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
//admin function

  setAppName = (req: Request) => {
    const appName = req.body.valuePath[1];
    this.appName = appName;
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
    await this.writeHistory(req, historyType.USAGE, 1 , requestTimestamp );
  }

  deposit = async (req:Request) => {
    const transferPath = this.util.getTransferPath(req);
    const transferKey = req.body.value;
    const transferValue = (await this.ain.db.ref(transferPath).getValue()).value;
    const balancePath = await this.util.getBalancePath(req);
    await this.ain.db.ref(balancePath).incrementValue({
      value:transferValue,
      gas_price: 500,
      nonce: -1
    });
    await this.writeHistory(req, historyType.DEPOSIT, transferValue, transferKey);
  }

  writeHistory  = async (req:Request, type: historyType, amount: number, key: string) => {
    const historyPath = await this.util.getHistoryPath(req);
    await this.ain.db.ref(historyPath).setValue({
      value:{
        type,
        amount,
        transferKey: type === historyType.DEPOSIT ? key : null,
        requestTimestamp: type === historyType.USAGE ? key : null,
      },
      gas_price: 500,
      nonce: -1
    });
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
}