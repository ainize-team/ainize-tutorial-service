import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import Ainize from './functions/ainize';
import { responseStatus } from './functions/types';
dotenv.config();
const userPrivateKey = process.env.PRIVATE_KEY? process.env.PRIVATE_KEY : '';
const appName = process.env.APP_NAME? process.env.APP_NAME : '';
const app: Express = express();
app.use(express.json());
const port = process.env.PORT;
const ainizeInitalConfig = {
  appName,
  userPrivateKey,
}
const ainize = new Ainize(ainizeInitalConfig);
app.use(ainize.triggerDuplicateFilter);

app.post('/service', async (req: Request, res: Response) => {
  //fop POC use process.env.APP_NAME
  ainize.setAppName(req);
  console.log("service - txHash",req.body.transaction.hash);
  try{
    //DO SOMETHING
    req.body.auth.addr;
    await ainize.writeResponse(req, responseStatus.SUCCESS, 'successTest');
  }catch(e) {
    await ainize.writeResponse(req, responseStatus.FAILED, 'failedTest');
    console.log('error: ',e);
    res.send('error');
  }
});

app.post('/deposit', async (req: Request, res:Response) => {
  //fop POC use process.env.APP_NAME
  ainize.setAppName(req);
  console.log("deposit - txHash",req.body.transaction.hash);
  try{ 
    await ainize.deposit(req);
  }catch(e) {
    console.log('error: ',e);
    res.send('error');
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});