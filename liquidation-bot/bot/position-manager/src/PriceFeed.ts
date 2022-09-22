import { BigNumber, ethers } from "ethers";
import { provider } from "../../helpers/config/config";
import { dexPriceOracle, fathomStablecoin, ibDUMMYAddress, WXDCAddress } from "../../helpers/utils/addresses";
import { IPriceFeed } from "./interfaces/IPriceFeed";

export class PriceFeed implements IPriceFeed{
    public readonly symbol: string; 
    public readonly dexPriceContract;

    constructor(_symbol: string){
        this.symbol = _symbol;

        let dexPriceContractAbi = [
            'function getPrice(address token0, address token1) external view override returns (uint256, uint256)',
        ];

        this.dexPriceContract = new ethers.Contract(dexPriceOracle, dexPriceContractAbi, provider);
    }

    async fetchPrice(): Promise<BigNumber> {
        const fathemStableCoinPrice = await this.dexPriceContract.getPrice(ibDUMMYAddress, WXDCAddress);
        return fathemStableCoinPrice[0];
    }
    
}