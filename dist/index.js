"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Ain = require('@ainblockchain/ain-js').default;
const ain = new Ain('https://testnet-api.ainetwork.ai', 0);
const privateKey = process.env.PRIVATE_KEY;
const appName = process.env.APP_NAME;
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get('/service', (req, res) => {
    //write response at AInetwork
    console.log(req.body);
    res.send('Express + TypeScript Server');
});
app.post('/deposit', (req, res) => {
    console.log(req.body);
    //deposit
    res.send('test');
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
