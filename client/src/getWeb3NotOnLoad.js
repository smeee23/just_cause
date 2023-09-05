import Web3 from "web3";

import { web3Modal } from "./js/App"

const getWeb3 = async() => {
  let provider;
  let web3;
		try {

			provider = await web3Modal.connect();
      			web3 = new Web3(provider);

		}
		catch (error) {
			console.error(error);
		}
		//return {addresses, provider};
    return web3;
}

export default getWeb3;