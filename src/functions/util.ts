import {  Request } from 'express';
import Ainize from './ainize';

export default class util {
  ainize: Ainize;
  constructor(ainize: Ainize) {
    this.ainize = ainize;
  }

  getResponsePath = (req: Request) => {
    const requesterAddress = req.body.auth.addr;
    const requestTimestamp = req.body.valuePath[4];
    const responsePath = `/apps/${this.ainize.appName}/usage/${requesterAddress}/${requestTimestamp}/response`;
    return responsePath;
  }

  getBalancePath = (req: Request) => {
    const requesterAddress = req.body.auth.addr;
    const balancePath = `/apps/${this.ainize.appName}/balance/${requesterAddress}/balance`;
    return balancePath;
  }

  getTransferPath = (req: Request) => {
    const appName = this.ainize.appName;
    const requesterAddress = req.body.auth.addr;
    const adminAddress = this.ainize.userAddress;
    const transferKey = req.body.valuePath[4];
    const transferPath = `/apps/${appName}/transfer/${requesterAddress}/${adminAddress}/${transferKey}`;
    return transferPath;
  }

  getHistoryPath = (req: Request) => {
    const appName = this.ainize.appName;
    const requesterAddress = req.body.auth.addr;
    const timestamp = Date.now();
    const historyPath = `/apps/${appName}/balance/${requesterAddress}/history/${timestamp}`;
    return historyPath;
  }
}