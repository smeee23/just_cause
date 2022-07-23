import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: "c6e0956c0fb4432aac74aaa7dfb7687e", // required
          rpc: {
            80001: "https://polygon-mumbai.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e",
          },
        }
    }
};

const web3Modal = new Web3Modal({
	//network: "mumbai", // optional
	cacheProvider: true, // optional
    disableInjectedProvider: false,
	providerOptions, // required
});

export const connectToWeb3 = async() => {
    let addresses;
    let provider;
    try {
        // Will open the MetaMask UI
        // You should disable this button while the request is pending!

        provider = await web3Modal.connect();
        addresses = await provider.request({ method: 'eth_requestAccounts' });
    }
    catch (error) {
        console.error(error);
    }
    return {addresses, provider};
}