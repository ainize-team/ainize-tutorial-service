import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import Ainize from '@ainize-team/ainize-sdk'
import { llmService } from './functions/service';
import { RESPONSE_STATUS } from '@ainize-team/ainize-sdk/dist/types/type';
dotenv.config();
const userPrivateKey = process.env.PRIVATE_KEY? process.env.PRIVATE_KEY : '';
const appName = process.env.APP_NAME? process.env.APP_NAME : 'ainize_tutorial_app';
const app: Express = express();
app.use(express.json());
const port = process.env.PORT;
const ainize = new Ainize(0, userPrivateKey);
app.use(ainize.middleware.triggerDuplicateFilter);

app.post('/service', async (req: Request, res: Response) => {
  const { serviceName, requestData, requesterAddress, requestKey } = ainize.admin.getDataFromServiceRequest(req);
  console.log("service requestKey: ", requestKey);
  try{
    const amount = await ainize.app.checkCostAndBalance(appName, serviceName, requestData, requesterAddress);
    const responseData = await llmService(requestData);
    console.log(responseData, amount);
    await ainize.admin.writeResponse(req, amount, responseData, RESPONSE_STATUS.SUCCESS);
  }catch(e) {
    await ainize.admin.writeResponse(req, 0, 'error', RESPONSE_STATUS.FAIL);
    console.log('error: ',e);
    res.send('error');
  }
});

app.post('/deposit', async (req: Request, res:Response) => {
  console.log("deposit");
  try{ 
    await ainize.admin.deposit(req);
  }catch(e) {
    console.log('error: ',e);
    res.send('error');
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});