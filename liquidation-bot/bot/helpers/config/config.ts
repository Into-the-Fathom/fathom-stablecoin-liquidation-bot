import { ethers } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";
import { config } from "dotenv";
import chalk from 'chalk';
import path from "path";

config({ path: path.resolve(__dirname, '../../../../.env') });

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const liquidatorWallet = new ethers.Wallet(process.env.LIQUIDATOR_PRIVATE_KEY!, provider);

const LogLevel = {
    info : chalk.bold.yellow,
    debug : chalk.black,
    error : chalk.bold.red,
    keyEvent : chalk.bold.green
}

const COLLATERAL_POOL_ID = formatBytes32String("USDT");
//export {LogLevel,COLLATERAL_POOL_ID}
export {provider, liquidatorWallet, LogLevel,COLLATERAL_POOL_ID}