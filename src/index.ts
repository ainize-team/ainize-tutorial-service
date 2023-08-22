import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
const Ain = require('@ainblockchain/ain-js').default
const ain = new Ain('https://testnet-api.ainetwork.ai', 0);
const privateKey = process.env.PRIVATE_KEY;
const appName = process.env.APP_NAME;
const app: Express = express();
app.use(express.json());
const port = process.env.PORT;

app.post('/service', (req: Request, res: Response) => {
  //write response at AInetwork
  console.log(req);
  res.send('Express + TypeScript Server');
});
app.post('/deposit', (req: Request, res:Response) => {
  console.log(req);
  //deposit
  res.send('test');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});