import Web3 from "web3";

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
import ERC20Instance from "../contracts/IERC20.json";
import JCOwnerERC721 from "../contracts/JCOwnerERC721.json";
import PoolAddressesProvider from "../contracts/IPoolAddressesProvider.json"
import Pool from "../contracts/IPool.json"
import ProtocolDataProvider from "../contracts/not_truffle/ProtocolDataProvider.json";
import { kovanTokenMap, polygonMumbaiV3TokenMap, aavePoolAddressesProviderPolygonMumbaiV3Address } from "./func/tokenMaps.js";
import {getPoolInfo, getDepositorAddress, getAllowance, getLiquidityIndexFromAave} from './func/contractInteractions.js';
import {getPriceFromMessari, getPriceFromCoinGecko} from './func/priceFeeds.js'

import { Modal } from "./components/Modal";
import PendingTxModal from "./components/modals/PendingTxModal";
import TxResultModal from "./components/modals/TxResultModal";
import DeployTxModal from "./components/modals/DeployTxModal";
//import { load } from "dotenv";

class App extends Component {

	componentDidMount = async() => {
		try {

			window.addEventListener('resize', this.props.detectMobile);
			let activeAccount = await this.getAccounts();
			//this.web3 = await getWeb3();
			this.accounts = await this.web3.eth.getAccounts();
			//console.log('linkkkkk', this.props.match.params.address)
			if(!activeAccount){
				console.log('accounts' , this.accounts, this.accounts[0]);
				activeAccount = this.accounts[0];
			}

			console.log('account', activeAccount);
			activeAccount =  activeAccount[0];
			if (activeAccount){
				this.setActiveAccountState(activeAccount);
				this.networkId = await this.web3.eth.net.getId();

				this.PoolTrackerInstance = new this.web3.eth.Contract(
					PoolTracker.abi,
					PoolTracker.networks[this.networkId] && PoolTracker.networks[this.networkId].address,
				);

				this.poolTrackerAddress = PoolTracker.networks[this.networkId].address;

				this.setPoolTrackAddress(this.poolTrackerAddress);
				const tokenMap = this.getTokenMapFromNetwork();
				this.setTokenMapState(tokenMap);
				this.setPoolState(activeAccount);

				//let results = await this.AaveProtocolDataProviderInstance.methods.getAllATokens().call();
			}
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

	getAccounts = async() => {
		let request;
		if(this.isMetaMaskInstalled()){
			try {
				const { ethereum } = window;
				this.web3 = new Web3(ethereum);
				request = await ethereum.request({ method: 'eth_requestAccounts' });
				console.log('requests', request);
			}
			catch (error) {
				console.error(error);
			}
		}
		return request;
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
		console.log('networkId', this.networkId);
		if(this.networkId === 42){
			return kovanTokenMap;
		}
		else if(this.networkId === 80001){
			return polygonMumbaiV3TokenMap;
		}
	}
	setTokenMapState = async(tokenMap) => {
		let acceptedTokens = Object.keys(tokenMap);
		const geckoPriceData = await getPriceFromCoinGecko(this.networkId);
		for(let i = 0; i < acceptedTokens.length; i++){
			const key = acceptedTokens[i];
			const address =  tokenMap[key] && tokenMap[key].address;
			const aaveTokenInfo = await getLiquidityIndexFromAave(address, aavePoolAddressesProviderPolygonMumbaiV3Address);
			console.log('aaveTokenInfo', aaveTokenInfo);
			const erc20Instance = await new this.web3.eth.Contract(ERC20Instance.abi, address);
			const allowance = await getAllowance(erc20Instance, this.poolTrackerAddress, this.props.activeAccount);
			tokenMap[key]['allowance'] = allowance > 0 ? true : false;
			tokenMap[key]['depositAPY'] = this.calculateAPY(aaveTokenInfo.currentLiquidityRate).toPrecision(4);
			tokenMap[key]['liquidityIndex'] = aaveTokenInfo.liquidityIndex;
			console.log('liquidity', aaveTokenInfo.currentLiquidityRate,  aaveTokenInfo.liquidityIndex);
			const apiKey = tokenMap[key] && tokenMap[key].apiKey;
			tokenMap[key]['priceUSD'] = geckoPriceData[apiKey] && geckoPriceData[apiKey].usd;
			console.log(key, 'price usd', tokenMap[key]['priceUSD'])
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
			const ownerInfo = await ERCInstance.methods.getCreation(tokenId).call();
			userOwnedPools.push(ownerInfo.pool);
		}

		return userOwnedPools;
	}

	setPoolState = async(activeAccount) => {
		console.log('e')
		//const { verifiedPools, ownerPools, userDepositPools, verifiedPoolInfo, ownerPoolInfo, userDepositPoolInfo } = getPoolStateFromChain(activeAccount, this.getTokenMapFromNetwork, this.networkId);
		const verifiedPools = await this.PoolTrackerInstance.methods.getVerifiedPools().call();
		const ownerPools = await this.getOwnerAddress(activeAccount); //await this.PoolTrackerInstance.methods.getUserOwned(activeAccount).call();
		const depositBalancePools = await getDepositorAddress(activeAccount, this.PoolTrackerInstance.options.address); //await this.PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();
		const userDepositPools = depositBalancePools.depositPools;
		const userBalancePools = depositBalancePools.balances;

		/*let isHashMatch = true;
		for(let i = 0; i < verifiedPools.length; i++){
			const isMatch = await this.PoolTrackerInstance.methods.checkByteCode(verifiedPools[i]).call();
			if(!isMatch){
				isHashMatch = false;
			}
		}
		console.log('isHashMatch', isHashMatch);*/

		const verifiedPoolInfo = await getPoolInfo(verifiedPools, this.getTokenMapFromNetwork(), userBalancePools);
		console.log('reached');
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
	activeAccount: state.activeAccount,
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