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

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            80001: "https://polygon-mumbai.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e",
			137: "https://polygon-mainnet.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e",
          },
        }
    },
	coinbasewallet: {
		package: CoinbaseWalletSDK,
		options: {
		  appName: "JustCause",
		  infuraId: "c6e0956c0fb4432aac74aaa7dfb7687e",
		}
	},
    authereum: {
        package: Authereum
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

				if("inApp" === checkLocationForAppDeploy() || "inSearch" === checkLocationForAppDeploy() ){
					if(web3Modal.cachedProvider || "inSearch" === checkLocationForAppDeploy() ){
						const verifiedPoolInfo = localStorage.getItem("verifiedPoolInfo");
						if(verifiedPoolInfo){
							await this.props.updateVerifiedPoolInfo(JSON.parse(verifiedPoolInfo));
							console.log("verifiedPoolInfo from storage", typeof JSON.parse(verifiedPoolInfo));
						}

						const ownerPoolInfo = localStorage.getItem("ownerPoolInfo");
						if(ownerPoolInfo){
							await this.props.updateOwnerPoolInfo(JSON.parse(ownerPoolInfo));
							console.log("ownerPoolInfo from storage", typeof JSON.parse(ownerPoolInfo));
						}

						const userDepositPoolInfo = localStorage.getItem("userDepositPoolInfo");
						console.log("userDeposit", userDepositPoolInfo)
						if(userDepositPoolInfo){
							await this.props.updateUserDepositPoolInfo(JSON.parse(userDepositPoolInfo));
							console.log("userDepositPoolInfo from storage", typeof JSON.parse(userDepositPoolInfo));
						}

						const tokenMap = localStorage.getItem("tokenMap");
						if(tokenMap){
							await this.props.updateTokenMap(JSON.parse(tokenMap));
							console.log("tokenMap from storage", JSON.parse(tokenMap));
						}
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
		this.setPoolTrackAddress(this.poolTrackerAddress);
		const tokenMap = getTokenMap(this.networkId);
		this.setTokenMapState(tokenMap);
		this.setPoolStateFront(this.props.activeAccount);
		const aaveAddressesProvider = getAaveAddressProvider(this.networkId);
		this.setAavePoolAddress(aaveAddressesProvider)
		this.setPoolStateAll(this.props.activeAccount);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.props.detectMobile);
	}

	connectToWeb3 = async() => {
		let provider;
		try {
			provider = await web3Modal.connect();
		}
		catch (error) {
			console.error(error);
		}
		return provider;
	}

	getAccounts = async() => {
		const provider = await this.connectToWeb3();
		this.provider = provider;

		this.web3 = new Web3(this.provider);
		const accounts = await this.web3.eth.getAccounts();

    	await this.props.updateActiveAccount(accounts[0]);
	}

	getAaveData = async() => {
		let results = await this.AaveProtocolDataProviderInstance.methods.getAllATokens().call();
		return results;
	}

	setAavePoolAddress = async(aavePoolAddressesProviderAddress) => {
		const aavePoolAddress = await getAavePoolAddress(aavePoolAddressesProviderAddress);
		await this.props.updateAavePoolAddress(aavePoolAddress);

	}

	setNetworkId = async(networkId) => {
		await this.props.updateNetworkId(networkId);
	}

	setPoolTrackAddress = async(poolTrackerAddress) => {
		await this.props.updatePoolTrackerAddress(poolTrackerAddress);
	}

	setActiveAccountState = async(activeAccount) => {
		await this.props.updateActiveAccount(activeAccount);
	}
	setTokenMapState = async(tokenMap) => {
		let acceptedTokens = Object.keys(tokenMap);
		const geckoPriceData = await getPriceFromCoinGecko(this.networkId);

		for(let i = 0; i < acceptedTokens.length; i++){
			const key = acceptedTokens[i];
			const address =  tokenMap[key] && tokenMap[key].address;

			const aaveTokenInfo = await getLiquidityIndexFromAave(address, getAaveAddressProvider(this.networkId));
			const erc20Instance = await new this.web3.eth.Contract(ERC20Instance.abi, address);
			const allowance = await getAllowance(erc20Instance, this.poolTrackerAddress, this.props.activeAccount);
			tokenMap[key]['allowance'] = allowance > 0 ? true : false;

			tokenMap[key]['depositAPY'] = this.calculateAPY(aaveTokenInfo.currentLiquidityRate).toPrecision(4);
			tokenMap[key]['liquidityIndex'] = aaveTokenInfo.liquidityIndex;
			const apiKey = tokenMap[key] && tokenMap[key].apiKey;
			tokenMap[key]['priceUSD'] = geckoPriceData[apiKey] && geckoPriceData[apiKey].usd;


			const tvl = await this.PoolTrackerInstance.methods.getTVL(address).call();
			tokenMap[key]['tvl'] = precise(tvl, tokenMap[key]['decimals']);

			const totalDonated = await this.PoolTrackerInstance.methods.getTotalDonated(address).call();
			tokenMap[key]['totalDonated'] = precise(totalDonated, tokenMap[key]['decimals']);

		}
		await this.props.updateTokenMap(tokenMap);
		localStorage.setItem("tokenMap", JSON.stringify(tokenMap));
	}

	calculateAPY = (liquidityRate) => {
		const RAY = 10**27;
		const SECONDS_PER_YEAR = 31536000;
		const depositAPR = liquidityRate/RAY;
		//return 1+ (depositAPR / SECONDS_PER_YEAR);
		return (((1 + (depositAPR / SECONDS_PER_YEAR)) ** SECONDS_PER_YEAR) - 1)*100;
	}

	getOwnerAddress = async(activeAccount) => {
		const userOwnedPools = await this.PoolTrackerInstance.methods.getReceiverPools(activeAccount).call();
		return userOwnedPools;
	}

	setPoolStateFront = async(activeAccount) => {
		const front = 10;
		const verifiedPools = await this.PoolTrackerInstance.methods.getVerifiedPools().call();
		const ownerPools = await this.getOwnerAddress(activeAccount);
		const depositBalancePools = await getDepositorAddress(activeAccount, this.PoolTrackerInstance.options.address);
		const userDepositPools = depositBalancePools.depositPools;
		const userBalancePools = depositBalancePools.balances;

		let frontPools = verifiedPools.length > front ? verifiedPools.slice(0, front) : verifiedPools;
		const verifiedPoolInfo = await getPoolInfo(frontPools, getTokenMap(this.networkId), userBalancePools);

		frontPools = ownerPools.length > front ? ownerPools.slice(0, front) : ownerPools;
		const ownerPoolInfo = await getPoolInfo(frontPools, getTokenMap(this.networkId), userBalancePools, this.props.verifiedPoolInfo);

		let knownPools = ownerPoolInfo;
		for(const key in this.props.verifiedPoolInfo){
			knownPools[("v_"+key)] = this.props.verifiedPoolInfo[key];
		}

		frontPools = userDepositPools.length > front ? userDepositPools.slice(0, front) : userDepositPools;
		const userDepositPoolInfo = await getPoolInfo(frontPools, getTokenMap(this.networkId),  userBalancePools, knownPools);

		await this.props.updateVerifiedPoolAddrs(verifiedPools);
		await this.props.updateVerifiedPoolInfo(verifiedPoolInfo);

		await this.props.updateOwnerPoolAddrs(ownerPools);
		await this.props.updateUserDepositPoolAddrs(userDepositPools);

		await this.props.updateOwnerPoolInfo(ownerPoolInfo);
		await this.props.updateUserDepositPoolInfo(userDepositPoolInfo);

		localStorage.setItem("verifiedPoolInfo", JSON.stringify(verifiedPoolInfo));
		localStorage.setItem("ownerPoolInfo", JSON.stringify(ownerPoolInfo));
		localStorage.setItem("userDepositPoolInfo", JSON.stringify(userDepositPoolInfo));
	}

	setPoolStateAll = async(activeAccount) => {
		let front = 10;
		const verifiedPools = await this.PoolTrackerInstance.methods.getVerifiedPools().call();
		const ownerPools = await this.getOwnerAddress(activeAccount);
		const depositBalancePools = await getDepositorAddress(activeAccount, this.PoolTrackerInstance.options.address);
		const userDepositPools = depositBalancePools.depositPools;
		const userBalancePools = depositBalancePools.balances;

		let verifiedPoolInfo;
		if(verifiedPools.length > front){
			verifiedPoolInfo = await getPoolInfo(verifiedPools, getTokenMap(this.networkId), userBalancePools);
			await this.props.updateVerifiedPoolInfo(verifiedPoolInfo);
			localStorage.setItem("verifiedPoolInfo", JSON.stringify(verifiedPoolInfo));
		}

		let ownerPoolInfo;
		if(ownerPools.length > front){
			ownerPoolInfo = await getPoolInfo(ownerPools, getTokenMap(this.networkId), userBalancePools, this.props.verifiedPoolInfo);
			await this.props.updateUserDepositPoolAddrs(userDepositPools);
			localStorage.setItem("ownerPoolInfo", JSON.stringify(ownerPoolInfo));
		}

		let userDepositPoolInfo;
		if(userDepositPools.length > front){
			let knownPools = ownerPoolInfo;
			for(const key in this.props.verifiedPoolInfo){
				knownPools[("v_"+key)] = this.props.verifiedPoolInfo[key];
			}

			userDepositPoolInfo = await getPoolInfo(userDepositPools, getTokenMap(this.networkId),  userBalancePools, knownPools);
			await this.props.updateUserDepositPoolInfo(userDepositPoolInfo);
			localStorage.setItem("userDepositPoolInfo", JSON.stringify(userDepositPoolInfo));
		}
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