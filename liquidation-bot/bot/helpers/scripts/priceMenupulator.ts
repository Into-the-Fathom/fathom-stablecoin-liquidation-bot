import {ethers, BigNumber} from 'ethers';
import { COLLATERAL_POOL_ID, provider } from '../config/config.js';
import {collateralPoolConfigAddress,priceOracleAddress,simplePriceFeedAddress} from '../utils/addresses.js';

const collateralPoolConfigAbi = [
    // Some details about the token
    'function setPriceWithSafetyMargin(bytes32 collateralPoolId, uint256 priceWithSafetyMargin) external',
    'function setLiquidationRatio(bytes32 _poolId, uint256 _data) external',
];

const simplePriceFeedAbi = [
    // Some details about the token
    'function setPrice(uint256 _price) external',
];

let priceOracleAbi = [
    'function setPrice(bytes32 _collateralPoolId) external',
];


//Externalize these parameters

const signer = provider.getSigner();

const collateralPoolConfigContract = new ethers.Contract(collateralPoolConfigAddress, collateralPoolConfigAbi, signer);
const simplePriceFeedContract = new ethers.Contract(simplePriceFeedAddress, simplePriceFeedAbi, signer);
const priceOracleContract = new ethers.Contract(priceOracleAddress, priceOracleAbi, signer);

const WeiPerRay = BigNumber.from(`1${"0".repeat(27)}`)

export async function updateOnChainPrice(safe:boolean) {
    if (safe) {
        await collateralPoolConfigContract.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.mul(129).div(2))
        await simplePriceFeedContract.setPrice(WeiPerRay.mul(129).div(2).div(1e9));
    } else {
        await collateralPoolConfigContract.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.mul(129).div(4));
        await simplePriceFeedContract.setPrice(WeiPerRay.mul(129).div(4).div(1e9));
    }
}

export async function updateOnChainPriceWith(safetyMargin: number, rawPrice: number, decimalPlace: number) {
    await collateralPoolConfigContract.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.mul(safetyMargin).div(decimalPlace));
    await simplePriceFeedContract.setPrice(WeiPerRay.mul(rawPrice).div(decimalPlace).div(1e9));
}

export async function setLiquidationRatio() {
    await collateralPoolConfigContract.setLiquidationRatio(COLLATERAL_POOL_ID, WeiPerRay.mul(18).div(10));
}

export async function peekPriceFromPriceOracle() {
    await priceOracleContract.setPrice(COLLATERAL_POOL_ID);
}