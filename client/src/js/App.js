import React, { Component } from "react"
import { connect } from "react-redux"
import { ConnectedRouter } from 'connected-react-router'
//import { createBrowserHistory } from 'history'
import { createHashHistory } from 'history'

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

import getWeb3 from "../getWeb3";
import PoolTracker from "../contracts/PoolTracker.json";
import JCDepositorERC721 from "../contracts/JCDepositorERC721.json";
import JCOwnerERC721 from "../contracts/JCOwnerERC721.json";
import ProtocolDataProvider from "../contracts/not_truffle/ProtocolDataProvider.json";
import { kovanTokenMap } from "./func/tokenMaps.js";
import {getPoolInfo, getDepositorAddress} from './func/contractInteractions.js';
import {getPriceFromMessari} from './func/messariPriceFeeds.js'

//import { load } from "dotenv";

class App extends Component {

	componentDidMount = async() => {
		try {
			window.addEventListener('resize', this.props.detectMobile);
			console.log('app.js componentDidMount called');
			this.web3 = await getWeb3();
			this.accounts = await this.web3.eth.getAccounts();
			let activeAccount = await this.web3.currentProvider.selectedAddress;
			if(!activeAccount){
				console.log('accounts' , this.accounts, this.accounts[0]);
				activeAccount = this.accounts[0];
			}

			//activeAccount = this.accounts[0];
			this.networkId = await this.web3.eth.net.getId();

			this.AaveProtocolDataProviderInstance = new this.web3.eth.Contract(
				ProtocolDataProvider.abi,
				ProtocolDataProvider.networks[this.networkId] && ProtocolDataProvider.networks[this.networkId].address,
			);

			this.PoolTrackerInstance = new this.web3.eth.Contract(
				PoolTracker.abi,
				PoolTracker.networks[this.networkId] && PoolTracker.networks[this.networkId].address,
			);

			this.poolTrackerAddress = PoolTracker.networks[this.networkId].address;

			const tokenMap = this.getTokenMapFromNetwork();
			this.setTokenMapState(tokenMap);
			this.setActiveAccountState(activeAccount);
			this.setPoolState(activeAccount);
			this.setPoolTrackAddress(this.poolTrackerAddress);

			let results = await this.AaveProtocolDataProviderInstance.methods.getAllATokens().call();
			console.log('aave protocol data response', results);
		}

		catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to load web3, accounts, or contract. Check console for details. If not connected to site please select the Connect Button`,
			);
			console.error(error);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.props.detectMobile);
	}

	isMetaMaskInstalled = () => {
		//Have to check the ethereum binding on the window object to see if it's installed
		const { ethereum } = window;
		return Boolean(ethereum && ethereum.isMetaMask);
	}

	connectToWeb3 = async() => {
		if(this.isMetaMaskInstalled()){
			try {
				// Will open the MetaMask UI
				// (You should disable this button while the request is pending)
				const { ethereum } = window;
				let request = await ethereum.request({ method: 'eth_requestAccounts' });
				console.log('request', request);
			}
			catch (error) {
				console.error(error);
			}
		}
	}

	getAaveData = async() => {
		let results = await this.AaveProtocolDataProviderInstance.methods.getAllATokens().call();
		console.log('aave protocol data response', results);
	}

	setPoolTrackAddress = (poolTrackerAddress) => {
		this.props.updatePoolTrackerAddress(poolTrackerAddress);
	}

	setActiveAccountState = (activeAccount) => {
		console.log('activeAccount', activeAccount);
		this.props.updateActiveAccount(activeAccount);
	}
	getTokenMapFromNetwork = () => {
		if(this.networkId === 42){
			return kovanTokenMap;
		}
	}
	setTokenMapState = async(tokenMap) => {
		console.log('token Map keys', Object.keys(tokenMap));

		let acceptedTokens = Object.keys(tokenMap);
		for(let i = 0; i < acceptedTokens.length; i++){
			const key = acceptedTokens[i];
			const address =  tokenMap[key] && tokenMap[key].address;
			const aaveTokenInfo = await this.AaveProtocolDataProviderInstance.methods.getReserveData(address).call();
			//console.log('aaveTokenInfo', aaveTokenInfo);
			tokenMap[key]['depositAPY'] = this.calculateAPY(aaveTokenInfo.liquidityRate).toPrecision(4);
			tokenMap[key]['liquidityIndex'] = aaveTokenInfo.liquidityIndex;
			//console.log(key, tokenMap[key] && tokenMap[key].apiKey, address);
			let result = JSON.parse(await getPriceFromMessari(tokenMap[key] && tokenMap[key].apiKey));
			result = result.data.market_data.price_usd;
			tokenMap[key]['priceUSD'] = result;
			//console.log('api response:', result);
		}
		console.log('updated tokenMap', tokenMap, typeof tokenMap);
		this.props.updateTokenMap(tokenMap);
	}

	calculateAPY = (liquidityRate) => {
		const RAY = 10**27;
		const SECONDS_PER_YEAR = 31536000;
		const depositAPR = liquidityRate/RAY;
		//return 1+ (depositAPR / SECONDS_PER_YEAR);
		return (((1 + (depositAPR / SECONDS_PER_YEAR)) ** SECONDS_PER_YEAR) - 1)*100;
	}

	getOwnerAddress = async(activeAccount) => {
		let userOwnedPools = [];
		const ERCAddr = await this.PoolTrackerInstance.methods.getOwnerERC721Address().call();
		const ERCInstance = new this.web3.eth.Contract(
			JCOwnerERC721.abi,
			ERCAddr,
		);

		let balance = await ERCInstance.methods.balanceOf(activeAccount).call();

		for(let i = 0; i < balance; i++){
			const tokenId = await ERCInstance.methods.tokenOfOwnerByIndex(activeAccount, i).call();
			console.log('tokenId:', tokenId);
			const ownerInfo = await ERCInstance.methods.getCreation(tokenId).call();
			console.log('pool:', ownerInfo);
			userOwnedPools.push(ownerInfo.pool);
		}

		return userOwnedPools;
	}

	setPoolState = async(activeAccount) => {
		//const { verifiedPools, ownerPools, userDepositPools, verifiedPoolInfo, ownerPoolInfo, userDepositPoolInfo } = getPoolStateFromChain(activeAccount, this.getTokenMapFromNetwork, this.networkId);
		const verifiedPools = await this.PoolTrackerInstance.methods.getVerifiedPools().call();
		const ownerPools = await this.getOwnerAddress(activeAccount); //await this.PoolTrackerInstance.methods.getUserOwned(activeAccount).call();
		const depositBalancePools = await getDepositorAddress(activeAccount, this.PoolTrackerInstance.options.address); //await this.PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();
		const userDepositPools = depositBalancePools.depositPools;
		const userBalancePools = depositBalancePools.balances;

		console.log('userBalancePools', userBalancePools);
		let isHashMatch = true;
		for(let i = 0; i < verifiedPools.length; i++){
			const isMatch = await this.PoolTrackerInstance.methods.checkByteCode(verifiedPools[i]).call();
			if(!isMatch){
				isHashMatch = false;
			}
		}
		console.log('isHashMatch', isHashMatch);

		const verifiedPoolInfo = await getPoolInfo(verifiedPools, this.getTokenMapFromNetwork(), userBalancePools);
		const ownerPoolInfo = await getPoolInfo(ownerPools, this.getTokenMapFromNetwork(), userBalancePools);
		const userDepositPoolInfo = await getPoolInfo(userDepositPools, this.getTokenMapFromNetwork(), userBalancePools);

		console.log('---------verifiedPoolInfo--------', verifiedPoolInfo);
		console.log('---------ownerPoolInfo--------', ownerPoolInfo);
		console.log('---------userDepositPoolInfo--------', userDepositPoolInfo);

		this.props.updateVerifiedPoolAddrs(verifiedPools);
		this.props.updateOwnerPoolAddrs(ownerPools);
		this.props.updateUserDepositPoolAddrs(userDepositPools);

		this.props.updateVerifiedPoolInfo(verifiedPoolInfo);
		this.props.updateOwnerPoolInfo(ownerPoolInfo);
		this.props.updateUserDepositPoolInfo(userDepositPoolInfo);
	}

	render() {
		let history;
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
			history = this.props.history;
		} else {
			history = createHashHistory({ basename: '/just_cause' })
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
})

export default connect(mapStateToProps, mapDispatchToProps)(App)