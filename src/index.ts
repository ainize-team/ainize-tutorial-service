import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import Ainize from '@ainize-team/ainize-js';
import { llmService } from './functions/service';
import { RESPONSE_STATUS } from '@ainize-team/ainize-js/dist/types/type';
import OpenAI from "openai";
dotenv.config();
const userPrivateKey = process.env.PRIVATE_KEY? process.env.PRIVATE_KEY : '';
const app: Express = express();
app.use(express.json());
const port = process.env.PORT;
const ainize = new Ainize(0);
ainize.login(userPrivateKey);
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.post('/service',
  ainize.middleware.triggerDuplicateFilter,
  async (req: Request, res: Response) => {
  const { appName, requestData, requestKey } = ainize.internal.getDataFromServiceRequest(req);
  console.log("service requestKey: ", requestKey);
  try{
    const service = await ainize.getService(appName);
    const responseData = await llmService(openai, requestData.prompt);
    const amount = 0.1;
    console.log(appName, requestData, amount);
    await ainize.internal.handleRequest(req, amount, RESPONSE_STATUS.SUCCESS, responseData);
  }catch(e) {
    await ainize.internal.handleRequest(req, 0, RESPONSE_STATUS.FAIL,'error');
    console.log('error: ',e);
    res.send('error');
  }
});

app.post('/deposit',
  ainize.middleware.triggerDuplicateFilter,
  async (req: Request, res:Response) => {
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