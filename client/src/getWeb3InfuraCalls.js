import Web3 from "web3";

//import { web3Modal } from "./js/App"

const getWeb3Infura = () => {
  let provider;
  let web3;
		try {
			// Will open the MetaMask UI
			// You should disable this button while the request is pending!

			provider = "https://polygon-mainnet.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e";
            let web3Provider = new Web3.providers.HttpProvider(provider);
            web3 = new Web3(web3Provider);
			//addresses = await provider.request({ method: 'eth_requestAccounts' });
		}
		catch (error) {
			console.error(error);
		}
		//return {addresses, provider};
    return web3;
}

export default getWeb3Infura;