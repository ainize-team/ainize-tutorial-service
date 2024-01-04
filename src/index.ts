import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import Ainize from '@ainize-team/ainize-js'
const Ain = require('@ainblockchain/ain-js').default
import { llmService } from './functions/service';
import { RESPONSE_STATUS } from '@ainize-team/ainize-js/dist/types/type';
dotenv.config();
const userPrivateKey = process.env.PRIVATE_KEY? process.env.PRIVATE_KEY : '';
const app: Express = express();
app.use(express.json());
const port = process.env.PORT;
const ainize = new Ainize(0);
const ain = new Ain('https://testnet-api.ainetwork.ai', 0);
ainize.login(userPrivateKey);
app.use(ainize.middleware.triggerDuplicateFilter);

app.post('/service', async (req: Request, res: Response) => {
  const { appName, requestData, requestKey,requesterAddress } = ainize.internal.getDataFromServiceRequest(req);
  const result = ain.db.ref(`/apps/${appName}/service/${requesterAddress}/${requestKey}/request`).getValue();
  console.log(`result: ${JSON.stringify(await result)}`);
  console.log(`requestData: ${JSON.stringify(requestData)}`);
  console.log(`result === requestData: ${result === requestData}`);
  console.log("service requestKey: ", requestKey);
  try{
    const service = await ainize.getService(appName);
    const amount = await service.calculateCost(requestData);
    const responseData = await llmService(requestData);
    console.log(appName, requestData, amount);
    await ainize.internal.handleRequest(req, amount, RESPONSE_STATUS.SUCCESS, responseData);
  }catch(e) {
    await ainize.internal.handleRequest(req, 0, RESPONSE_STATUS.FAIL,'error');
    console.log('error: ',e);
    res.send('error');
  }
});

app.post('/deposit', async (req: Request, res:Response) => {
  console.log("deposit");
  try{ 
    const result = await ainize.internal.handleDeposit(req);
    console.log(result);
  }catch(e) {
    console.log('error: ',e);
    res.send('error');
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});