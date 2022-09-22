//This script should crete the proxy wallet for provided key/value pair..
import {ethers} from 'ethers';
import { provider } from '../config/config';
import { proxyWalletRegistryAddress } from '../utils/addresses';
import ProxyWalletRegistryArtifact from './artifacts/ProxyWalletRegistry';

export default async function createWallet (key:string, address:string) {
    const wallet = new ethers.Wallet(key,provider);
    const proxyWalletRegistryAsUser = new ethers.Contract(proxyWalletRegistryAddress, ProxyWalletRegistryArtifact.abi, wallet);
    await proxyWalletRegistryAsUser.build(address);
    const proxyWallet = await proxyWalletRegistryAsUser.proxies(wallet.address);
    console.log("proxy Wallet is " + proxyWallet);
    return proxyWallet;
}