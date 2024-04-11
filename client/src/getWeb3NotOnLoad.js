import { EthereumProvider } from "@walletconnect/ethereum-provider";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Web3 from "web3";

const getWeb3 = async(connectionType) => {
	let web3;
	const infuraRpc = "https://arbitrum-mainnet.infura.io/v3/"+process.env.REACT_APP_INFURA_KEY;
	if(connectionType === "MetaMask") {
	  if (typeof window.ethereum !== 'undefined') {
		const provider = window.ethereum;
		web3 = new Web3(window.ethereum);
	  } else {
		console.error("MetaMask not detected");
	  }
	}
	else if(connectionType === "Coinbase Wallet"){
		const coinbaseWallet = new CoinbaseWalletSDK({
		  appName: "JustCause"
		})
		const provider = coinbaseWallet.makeWeb3Provider(infuraRpc, 10)
		web3 = new Web3(provider)
	  }
	else if(connectionType === "WalletConnect"){
	    const provider = await EthereumProvider.init({
		projectId: '121c52ec6852ab6b453b3fbf45945d49', // required
		chains: [10], // required
		rpcMap: {
		  10: infuraRpc,
		}
	  })
	  await provider.enable();
	  web3 = new Web3(provider);
	}
	return web3; // Return the web3 instance if needed
}

export default getWeb3;