import {ethers} from 'ethers';
import { COLLATERAL_POOL_ID, provider } from '../config/config';
import { alpacaStablecoinProxyActionsAddress, ibDUMMYAddress, ibTokenAdapterAddress, positionManagerAddress, stabilityFeeCollectorAddress, stablecoinAdapterAddress } from '../utils/addresses';
import ibDummyArtifact from './artifacts/BEP20';
import ProxyWalletArtifact from './artifacts/ProxyWallet';

const WeiPerWad = ethers.constants.WeiPerEther

async function openPosition(address: any, proxyWalletAs: any, collatral: number, debt: number ) {
    // https://github.com/ethers-io/ethers.js/issues/478
    let openLockTokenAndDrawAbi = [
      "function openLockTokenAndDraw(address _manager, address _stabilityFeeCollector, address _tokenAdapter, address _stablecoinAdapter, bytes32 _collateralPoolId, uint256 _collateralAmount, uint256 _stablecoinAmount, bool _transferFrom, bytes calldata _data)"
    ];

    let openLockTokenAndDrawIFace = new ethers.utils.Interface(openLockTokenAndDrawAbi);
    const encodedResult = ethers.utils.defaultAbiCoder.encode(["address"], [address]);

    let openPositionCall = openLockTokenAndDrawIFace.encodeFunctionData("openLockTokenAndDraw", [
        positionManagerAddress,
        stabilityFeeCollectorAddress,
        ibTokenAdapterAddress,
        stablecoinAdapterAddress,
        COLLATERAL_POOL_ID,
        WeiPerWad.mul(collatral), //Collatral amount
        WeiPerWad.mul(debt), //Stable coin amount
        true,
        encodedResult,
    ]);
    const positionId = await proxyWalletAs.execute2(alpacaStablecoinProxyActionsAddress, openPositionCall);
    console.log('New position is opened...')
}

 export async function openNewPosition(proxyWalletAlice: any, primaryKey: string, address: string, collatral: number, debt: number) {
    const walletAlice = new ethers.Wallet(primaryKey, provider);
    const proxyWalletAsAlice = new ethers.Contract(proxyWalletAlice, ProxyWalletArtifact.abi, walletAlice);
    //const ibDummyAsAlice = new ethers.Contract(ibDUMMYAddress, ibDummyArtifact.abi, walletAlice);
    var alicePositionId = await openPosition(address, proxyWalletAsAlice, collatral, debt);
    console.log(`Position opened ${alicePositionId}`)  
}
  
export async function approve(proxyWalletAlice: any, primaryKey: string, amount: number) {
    const walletAlice = new ethers.Wallet(primaryKey,provider);
    const ibDummyAsAlice = new ethers.Contract(ibDUMMYAddress, ibDummyArtifact.abi, walletAlice);
    await ibDummyAsAlice.approve(proxyWalletAlice, WeiPerWad.mul(amount));
}
