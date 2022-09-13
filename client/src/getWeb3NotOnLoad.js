import Web3 from "web3";

import { web3Modal } from "./js/App"

const getWeb3 = async() => {
  let provider;
  let web3;
		try {
			// Will open the MetaMask UI
			// You should disable this button while the request is pending!

			provider = await web3Modal.connect();
      web3 = new Web3(provider);
			//addresses = await provider.request({ method: 'eth_requestAccounts' });
		}
		catch (error) {
			console.error(error);
		}
		//return {addresses, provider};
    return web3;
}

export default getWeb3;