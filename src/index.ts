import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import Ainize from '@ainize-team/ainize-sdk'
import { RESPONSE_STATUS } from '@ainize-team/ainize-sdk/dist/types/type';
import { exec } from 'child_process';
import { checkParams, paramStringify, evaluate } from './functions/service';
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
  const responseData = req.body;
  const data = queue.finish();
  await ainize.internal.handleRequest(data.req, data.amount, RESPONSE_STATUS.SUCCESS, responseData);
});

app.post('/service', async (req: Request, res: Response) => {
  ainize.middleware.triggerFilter(req, res);
  const { requesterAddress, appName, requestData, requestKey } = ainize.internal.getDataFromServiceRequest(req);
  // if (!checkParams(req.body.value)) throw Error("Invalid parameters");
  // const paramString = paramStringify(value);
  try {
    const service = await ainize.getService(appName);
    const amount = await service.calculateCost('');
    queue.push({req,requestKey, requestData, appName, requesterAddress, amount});
    
    // const cp = exec(`sh ./docker_run.sh "python main.py ${paramString}"`, (error, stdout, stderr) => {
    //   // TODO(yoojin): Need to set responseData
    //   responseData = stdout;
    //   if (error !== null) {
    //     console.log(`exec error: ${error}`);
    //     throw Error(error.message);
    //   }
    // })

  } catch(e) {
    await ainize.internal.handleRequest(req, 0, RESPONSE_STATUS.FAIL,'error');
    console.log('error: ', e.message);
    res.send('error');
  }
});

app.post('/deposit', async (req: Request, res:Response) => {
  ainize.middleware.triggerFilter(req, res);
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