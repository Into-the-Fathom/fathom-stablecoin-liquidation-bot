// server.js

import express from 'express' 
import createWallet from './scripts/createProxyWallet';
import {openNewPosition,approve} from './scripts/openNewPosition';
import {updateOnChainPrice, setLiquidationRatio, updateOnChainPriceWith, peekPriceFromPriceOracle } from './scripts/priceMenupulator';

const app = express();

var PORT = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//let proxyWallet = '';

app.get('/', function(req:any, res:any) {
    res.status(200).send('Hello world');
});

//TODO: Externalize the required information to create wallet
app.post('/create-proxy-wallet', async function(req:any, res:any) {
    console.log(`request body: ${JSON.stringify(req.body)}`);
    //DANGER: private key should never be sent like this... this is just for demo
    let {privateKey, address} = req.body;
    let proxyWallet = await createWallet(privateKey, address);
    res.status(200).send(`wallet created ${proxyWallet}`);
});

//TODO: Externalize the required information to create wallet
app.post('/update-price-safe', async function(req:any, res:any) {
    await updateOnChainPrice(true);
    res.status(200).send(`Price updated to safe`);
});

app.post('/update-price-unsafe', async function(req:any, res:any) {
    await updateOnChainPrice(false);
    res.status(200).send(`price updated to unsafe`);
});

app.post('/update-liquidation-ratio', async function(req:any, res:any) {
    await setLiquidationRatio();
    res.status(200).send(`price updated to unsafe`);
});

app.post('/update-price', async function(req:any, res:any) {
    let {priceWithSafetyMargin, rawPrice, decimalPlace} = req.body;
    await updateOnChainPriceWith(priceWithSafetyMargin, rawPrice, decimalPlace);
    res.status(200).send(`price updated.`);
});

app.post('/peek-price', async function(req:any, res:any) {
    await peekPriceFromPriceOracle();
    res.status(200).send(`price updated to unsafe`);
});

app.post('/approve', async function(req:any, res:any) {
    let {proxyWallet, privateKey, amount} = req.body;
    await approve(proxyWallet,privateKey,amount);
    res.status(200).send(`Amount ${amount} approved..`);
});

app.post('/open-position', async function(req:any, res:any) {
    //DANGER: private key should never be sent like this... this is just for demo
    let {proxyWallet, privateKey, address, collatral, debt} = req.body;
    await openNewPosition(proxyWallet, privateKey, address, collatral, debt);
    res.status(200).send(`New position opened...`);
});

app.listen(PORT, function() {
    console.log('Server is running on PORT:',PORT);
});