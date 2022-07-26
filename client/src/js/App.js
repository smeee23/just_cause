import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Authereum from "authereum";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

import React, { Component } from "react"
import { connect } from "react-redux"
import { ConnectedRouter } from 'connected-react-router'
import { createHashHistory} from 'history'

import routes from './routes'
import { detectMobile } from "./actions/mobile"
import { updateActiveAccount } from "./actions/activeAccount"
import { updateTokenMap } from "./actions/tokenMap"
import { updateVerifiedPoolAddrs } from "./actions/verifiedPoolAddrs"
import { updateVerifiedPoolInfo } from "./actions/verifiedPoolInfo"
import { updateOwnerPoolAddrs } from "./actions/ownerPoolAddrs"
import { updateOwnerPoolInfo } from "./actions/ownerPoolInfo"
import { updateUserDepositPoolAddrs } from "./actions/userDepositPoolAddrs"
import { updateUserDepositPoolInfo } from "./actions/userDepositPoolInfo"
import { updatePoolTrackerAddress } from "./actions/poolTrackerAddress"
import { updateAavePoolAddress } from "./actions/aavePoolAddress"
import { updateNetworkId } from "./actions/networkId"
import { updateConnect } from "./actions/connect"

import PoolTracker from "../contracts/PoolTracker.json";
import ERC20Instance from "../contracts/IERC20.json";
import { getTokenMap, getAaveAddressProvider } from "./func/tokenMaps.js";
import {getPoolInfo, getDepositorAddress, getAllowance, getLiquidityIndexFromAave, getAavePoolAddress} from './func/contractInteractions.js';
import {getPriceFromCoinGecko} from './func/priceFeeds.js'
import {precise, checkLocationForAppDeploy} from './func/ancillaryFunctions';
import {getAbout, getIpfsData} from './func/ipfs';

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          rpc: {
            80001: "https://polygon-mumbai.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e",
			137: "https://polygon-mainnet.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e",
          },
        }
    },
	coinbasewallet: {
		package: CoinbaseWalletSDK, // Required
		options: {
		  appName: "JustCause", // Required
		  infuraId: "c6e0956c0fb4432aac74aaa7dfb7687e", // Optional if `infuraId` is provided; otherwise it's required
		}
	},
    authereum: {
        package: Authereum // required
    }
};

export const web3Modal = new Web3Modal({
	cacheProvider: true, // optional
    disableInjectedProvider: false,
	providerOptions, // required
	theme: "dark",
});

class App extends Component {

	componentDidMount = async() => {
		try {

			window.addEventListener('resize', this.props.detectMobile);
			console.log("path app.js", window.location.pathname);
			console.log("href app.js", window.location.href);
			console.log("check", checkLocationForAppDeploy());

				if("inApp" === checkLocationForAppDeploy()){
					if(web3Modal.cachedProvider){
						await this.getAccounts();

						if (this.props.activeAccount){
							this.setUpConnection();
						}
					}
				}
		}

		catch (error) {
			// Catch any errors for any of the above operations.
			if(!this.props.networkId){
				alert(
					`Failed to load metamask wallet, no network detected`,
				);
			}
			else if(this.props.networkId !== 80001){
				alert(
					`Unsupported network detected (chain id: `+this.props.networkId+'). Please switch to polygon mumbai testnet'
				);
			}
			else{
				alert(
				`Failed to load web3, accounts, or contract. Check console for details. If not connected to site please select the Connect Button`,
			);
			}
			console.error(error);
		}
	}

	setUpConnection = async() => {
		this.setActiveAccountState(this.props.activeAccount);
		this.networkId = await this.web3.eth.net.getId();
		this.setNetworkId(this.networkId);

		this.PoolTrackerInstance = new this.web3.eth.Contract(
			PoolTracker.abi,
			PoolTracker.networks[this.networkId] && PoolTracker.networks[this.networkId].address,
		);

		this.poolTrackerAddress = PoolTracker.networks[this.networkId].address;

		console.log("poolTrackerAddress1", this.poolTrackerAddress)
		this.setPoolTrackAddress(this.poolTrackerAddress);
		const tokenMap = getTokenMap(this.networkId);
		this.setTokenMapState(tokenMap);
		this.setPoolState(this.props.activeAccount);
		const aaveAddressesProvider = getAaveAddressProvider(this.networkId);
		this.setAavePoolAddress(aaveAddressesProvider)
		console.log("poolTrackerAddress2", this.poolTrackerAddress, aaveAddressesProvider)
		//let results = await this.AaveProtocolDataProviderInstance.methods.getAllATokens().call();

		const PoolTrackerInstance = new this.web3.eth.Contract(
			PoolTracker.abi,
			this.poolTrackerAddress,
		);

		console.log("getAddressFromName");
		const result = await PoolTrackerInstance.methods.getReservesList().call();
		console.log("TESTTTTTT", result);
		await getAbout('test');
		await getIpfsData('QmPTsBwAC1x4Qhr7Ckd4Vt2GJGR4CcL8bp7WSgeChfCMY2');

		await getIpfsData('bafybeic4sjo4mwkxqz3gpvflmqys2kkq7dow2pvtl2n5ncgt6fih46osgu');
		console.log("poolTrackerAddress3", this.poolTrackerAddress)
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.props.detectMobile);
	}

	connectToWeb3 = async() => {
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

	disconnect = async () => {
		console.log("DISCONNECT");
		/*await web3Modal.clearCachedProvider();
		this.props.updateActiveAccount("");

		window.location.reload(false);*/
	};
	getAccounts = async() => {
		const {addresses, provider} = await this.connectToWeb3();
		this.provider = provider;

		this.web3 = new Web3(this.provider);

		console.log("provider", provider);
    	await this.props.updateActiveAccount(addresses[0]);
	}

	getAaveData = async() => {
		let results = await this.AaveProtocolDataProviderInstance.methods.getAllATokens().call();
		console.log('aave protocol data response', results);
	}

	setAavePoolAddress = async(aavePoolAddressesProviderAddress) => {
		const aavePoolAddress = await getAavePoolAddress(aavePoolAddressesProviderAddress);
		await this.props.updateAavePoolAddress(aavePoolAddress);
		console.log('aavePoolAddress', this.props.aavePoolAddress);

	}

	setNetworkId = async(networkId) => {
		await this.props.updateNetworkId(networkId);
		console.log('networkId', this.props.networkId);
	}

	setPoolTrackAddress = async(poolTrackerAddress) => {
		await this.props.updatePoolTrackerAddress(poolTrackerAddress);
	}

	setActiveAccountState = async(activeAccount) => {
		console.log('activeAccount', activeAccount);
		await this.props.updateActiveAccount(activeAccount);
	}
	setTokenMapState = async(tokenMap) => {
		let acceptedTokens = Object.keys(tokenMap);
		const geckoPriceData = await getPriceFromCoinGecko(this.networkId);

		for(let i = 0; i < acceptedTokens.length; i++){
			const key = acceptedTokens[i];
			const address =  tokenMap[key] && tokenMap[key].address;

			const aaveTokenInfo = await getLiquidityIndexFromAave(address, getAaveAddressProvider(this.networkId));
			console.log('aaveTokenInfo', aaveTokenInfo);
			const erc20Instance = await new this.web3.eth.Contract(ERC20Instance.abi, address);
			const allowance = await getAllowance(erc20Instance, this.poolTrackerAddress, this.props.activeAccount);
			tokenMap[key]['allowance'] = allowance > 0 ? true : false;

			console.log(key);

			tokenMap[key]['depositAPY'] = this.calculateAPY(aaveTokenInfo.currentLiquidityRate).toPrecision(4);
			tokenMap[key]['liquidityIndex'] = aaveTokenInfo.liquidityIndex;
			console.log('liquidity', aaveTokenInfo.currentLiquidityRate,  aaveTokenInfo.liquidityIndex);
			const apiKey = tokenMap[key] && tokenMap[key].apiKey;
			tokenMap[key]['priceUSD'] = geckoPriceData[apiKey] && geckoPriceData[apiKey].usd;


			const tvl = await this.PoolTrackerInstance.methods.getTVL(address).call();
			tokenMap[key]['tvl'] = precise(tvl, tokenMap[key]['decimals']);

			const totalDonated = await this.PoolTrackerInstance.methods.getTotalDonated(address).call();
			tokenMap[key]['totalDonated'] = precise(totalDonated, tokenMap[key]['decimals']);

		}
		console.log('updated tokenMap', tokenMap, typeof tokenMap);
		await this.props.updateTokenMap(tokenMap);
	}

	calculateAPY = (liquidityRate) => {
		const RAY = 10**27;
		const SECONDS_PER_YEAR = 31536000;
		const depositAPR = liquidityRate/RAY;
		//return 1+ (depositAPR / SECONDS_PER_YEAR);
		console.log("APY TEST", liquidityRate, depositAPR);
		return (((1 + (depositAPR / SECONDS_PER_YEAR)) ** SECONDS_PER_YEAR) - 1)*100;
	}

	getOwnerAddress = async(activeAccount) => {
		const userOwnedPools = await this.PoolTrackerInstance.methods.getReceiverPools(activeAccount).call();
		return userOwnedPools;
	}

	setPoolState = async(activeAccount) => {
		//const { verifiedPools, ownerPools, userDepositPools, verifiedPoolInfo, ownerPoolInfo, userDepositPoolInfo } = getPoolStateFromChain(activeAccount, this.getTokenMapFromNetwork, this.networkId);
		const verifiedPools = await this.PoolTrackerInstance.methods.getVerifiedPools().call();
		const ownerPools = await this.getOwnerAddress(activeAccount); //await this.PoolTrackerInstance.methods.getUserOwned(activeAccount).call();
		const depositBalancePools = await getDepositorAddress(activeAccount, this.PoolTrackerInstance.options.address); //await this.PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();
		const userDepositPools = depositBalancePools.depositPools;
		const userBalancePools = depositBalancePools.balances;

		const verifiedPoolInfo = await getPoolInfo(verifiedPools, getTokenMap(this.networkId), userBalancePools);
		console.log('reached');
		const ownerPoolInfo = await getPoolInfo(ownerPools, getTokenMap(this.networkId), userBalancePools);
		const userDepositPoolInfo = await getPoolInfo(userDepositPools, getTokenMap(this.networkId),  userBalancePools);

		console.log('---------verifiedPoolInfo--------', verifiedPoolInfo);
		console.log('---------ownerPoolInfo--------', ownerPoolInfo);
		console.log('---------userDepositPoolInfo--------', userDepositPoolInfo);

		await this.props.updateVerifiedPoolAddrs(verifiedPools);
		await this.props.updateOwnerPoolAddrs(ownerPools);
		await this.props.updateUserDepositPoolAddrs(userDepositPools);

		await this.props.updateVerifiedPoolInfo(verifiedPoolInfo);
		await this.props.updateOwnerPoolInfo(ownerPoolInfo);
		await this.props.updateUserDepositPoolInfo(userDepositPoolInfo);
	}

	render() {
				let history;
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
			history = this.props.history;
		} else {
			history = createHashHistory({ basename: '/just_cause' })
			//history = createBrowserHistory({ basename: '/just_cause' })
		}

		return (
    	<ConnectedRouter history={history}>
        	{ routes }
		</ConnectedRouter>
		)
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
	activeAccount: state.activeAccount,
	networkId: state.networkId,
	aavePoolAddress: state.aavePoolAddress,
	connect: state.connect,
})

const mapDispatchToProps = dispatch => ({
	detectMobile: () => dispatch(detectMobile()),
	updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
	updateTokenMap: (tokenMap) => dispatch(updateTokenMap(tokenMap)),
	updateVerifiedPoolAddrs: (addrsArray) => dispatch(updateVerifiedPoolAddrs(addrsArray)),
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateOwnerPoolAddrs: (addrsArray) => dispatch(updateOwnerPoolAddrs(addrsArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateUserDepositPoolAddrs: (addrsArray) => dispatch(updateUserDepositPoolAddrs(addrsArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updatePoolTrackerAddress: (s) => dispatch(updatePoolTrackerAddress(s)),
	updateNetworkId: (int) => dispatch(updateNetworkId(int)),
	updateAavePoolAddress: (s) => dispatch(updateAavePoolAddress(s)),
	updateConnect: (bool) => dispatch(updateConnect(bool)),
})

export default connect(mapStateToProps, mapDispatchToProps)(App)