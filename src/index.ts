import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import Ainize from '@ainize-team/ainize-sdk'
import { RESPONSE_STATUS } from '@ainize-team/ainize-sdk/dist/types/type';
import Queue from './queue';
dotenv.config();
const userPrivateKey = process.env.PRIVATE_KEY? process.env.PRIVATE_KEY : '';
const app: Express = express();
app.use(express.json());
const port = process.env.PORT;
const ainize = new Ainize(0);
ainize.login(userPrivateKey);
const queue = new Queue();

app.post('/response', async (req: Request, res: Response) => {
  const responseData = req.body.results;
  const data = queue.finish();
  console.log('data: ', data);
  console.log('responseData:', responseData);
  await ainize.internal.handleRequest(data.req, data.amount, RESPONSE_STATUS.SUCCESS, responseData);
});

app.post('/service', ainize.middleware.triggerDuplicateFilter);
app.post('/service', async (req: Request, res: Response) => {
  console.log('service');
  const { requesterAddress, appName, requestData, requestKey } = ainize.internal.getDataFromServiceRequest(req);
  // if (!checkParams(req.body.value)) throw Error("Invalid parameters");
  // const paramString = paramStringify(value);
  try {
    const service = await ainize.getService(appName);
    const amount = await service.calculateCost('');
    queue.push({req,requestKey, requestData, appName, requesterAddress, amount});
  } catch(e) {
    await ainize.internal.handleRequest(req, 0, RESPONSE_STATUS.FAIL,'error');
    console.log('error: index:43');
    res.send('error');
  }
});

app.post('/deposit', ainize.middleware.triggerDuplicateFilter);
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