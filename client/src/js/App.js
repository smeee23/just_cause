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
import { kovanTokenMap } from "./func/tokenMaps.js";
import {getPoolInfo} from './func/contractInteractions';

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
			console.log('activeAccount', activeAccount);

			//activeAccount = this.accounts[0];
			this.networkId = await this.web3.eth.net.getId();

			console.log("network ID", this.networkId);

			this.PoolTrackerInstance = new this.web3.eth.Contract(
				PoolTracker.abi,
				PoolTracker.networks[this.networkId] && PoolTracker.networks[this.networkId].address,
			);

			this.poolTrackerAddress = PoolTracker.networks[this.networkId].address;
			console.log("Pool Tracker Address:", this.poolTrackerAddress);

			const tokenMap = this.getTokenMapFromNetwork();
			this.setTokenMapState(tokenMap);
			this.setActiveAccountState(activeAccount);
			this.setPoolState(activeAccount);
			this.setPoolTrackAddress(this.poolTrackerAddress);
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
	setTokenMapState = (tokenMap) => {
		this.props.updateTokenMap(tokenMap);
	}

	setPoolState = async(activeAccount) => {
		//const { verifiedPools, ownerPools, userDepositPools, verifiedPoolInfo, ownerPoolInfo, userDepositPoolInfo } = getPoolStateFromChain(activeAccount, this.getTokenMapFromNetwork, this.networkId);
		const verifiedPools = await this.PoolTrackerInstance.methods.getVerifiedPools().call();
		const ownerPools = await this.PoolTrackerInstance.methods.getUserOwned(activeAccount).call();
		let userDepositPools = await this.PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();
		userDepositPools = [...new Set(userDepositPools)];

		let isHashMatch = true;
		for(let i = 0; i < verifiedPools.length; i++){
			const isMatch = await this.PoolTrackerInstance.methods.checkByteCode(verifiedPools[i]).call();
			if(!isMatch){
				isHashMatch = false;
			}
		}
		console.log('isHashMatch', isHashMatch);

		const verifiedPoolInfo = await getPoolInfo(verifiedPools, this.getTokenMapFromNetwork(), activeAccount);
		const ownerPoolInfo = await getPoolInfo(ownerPools, this.getTokenMapFromNetwork(), activeAccount);
		const userDepositPoolInfo = await getPoolInfo(userDepositPools, this.getTokenMapFromNetwork(), activeAccount);

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