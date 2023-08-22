import express, { Express, Request, Response } from 'express';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
dotenv.config();
const Ain = require('@ainblockchain/ain-js').default
const ain = new Ain('https://testnet-api.ainetwork.ai', 0);
const adminPrivateKey = process.env.PRIVATE_KEY;
const appName = process.env.APP_NAME;
const adminAddress = ain.wallet.addAndSetDefaultAccount(adminPrivateKey);
const app: Express = express();
app.use(express.json());
const port = process.env.PORT;
const cache = new NodeCache();
const cacheCheck = (txHash:string)=>{
  if (cache.get(txHash) && cache.get(txHash) !== 'error') {
		cache.ttl(txHash, 500);
		return false;
	}
	// if request is first request, set cache 
	cache.set(txHash, "in_progress", 500);
  return true;
}
app.post('/service', async (req: Request, res: Response) => {
  const isNotDuplicated = cacheCheck(req.body.transaction.hash);
  if (!isNotDuplicated) {
    res.send('duplicated');
    return;
  }
  const userAddress = req.body.valuePath[3];
  const requestTimestamp = req.body.valuePath[4];
  const responsePath = `/apps/${appName}/prompt/${userAddress}/${requestTimestamp}/response`;
  res.send('Express + TypeScript Server');
  //write response at AInetwork
  console.log("txHash",req.body.transaction.hash);
  console.log("responsePath",responsePath);
  try{
    await ain.db.ref(responsePath).setValue({
      value: {
        status: 'SUCCESS',
        msg:'response test 1',
        price: 0.1,
      },
      gas_price: 500,
      nonce: -1
    })
  }catch(e) {
    await ain.db.ref(responsePath).setValue({
      value: {
        status: 'FAILED',
        msg: 'failTest',
      },
      gas_price: 500,
      nonce: -1
    })
  }
  console.log("Done");
  cache.set(req.body.transaction.hash, 'done', 500);
});
app.post('/deposit', (req: Request, res:Response) => {
  console.log(req.body);
  //deposit
  res.send('test');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});