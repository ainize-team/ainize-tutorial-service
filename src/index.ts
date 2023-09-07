import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import Ainize from '@ainize-team/ainize-sdk'
import { llmService } from './functions/service';
import { RESPONSE_STATUS } from '@ainize-team/ainize-sdk/dist/types/type';
dotenv.config();
const userPrivateKey = process.env.PRIVATE_KEY? process.env.PRIVATE_KEY : '';
const appName = process.env.APP_NAME? process.env.APP_NAME : '';
const app: Express = express();
app.use(express.json());
const port = process.env.PORT;
const ainize = new Ainize(0, userPrivateKey);
app.use(ainize.middleware.triggerDuplicateFilter);
app.post('/service', async (req: Request, res: Response) => {
  //fop POC use process.env.APP_NAME
  console.log("service - txHash",req.body.transaction.hash);
  let amount = 0;
  const prompt = req.body.value.prompt;
  console.log('default account:', ainize.wallet.getDefaultAccount());
  try{
    amount = await ainize.admin.checkCostAndBalance(appName, prompt);
    const responseData = await llmService(prompt);
    console.log(req.body.valuePath);
    await ainize.admin.writeResponse(req, amount, responseData, RESPONSE_STATUS.SUCCESS);
  }catch(e) {
    await ainize.admin.writeResponse(req, amount, 'error', RESPONSE_STATUS.FAIL);
    console.log('error: ',e);
    res.send('error');
  }
});

app.post('/deposit', async (req: Request, res:Response) => {
  //fop POC use process.env.APP_NAME
  console.log("deposit - txHash",req.body.transaction.hash);
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