import React, { Component } from "react"
import { connect } from "react-redux"
import { ConnectedRouter } from 'connected-react-router'
import { createBrowserHistory } from 'history'

import routes from './routes'
import { detectMobile } from "./actions/mobile"
import { updateActiveAccount } from "./actions/activeAccount"
import { updateTokenMap } from "./actions/tokenMap"
import { updateVerifiedPoolAddrs } from "./actions/verifiedPoolAddrs"
import { updateVerifiedPoolInfo } from "./actions/verifiedPoolInfo"

import getWeb3 from "../getWeb3";
import JCPool from "../contracts/JustCausePool.json";
import PoolTracker from "../contracts/PoolTracker.json";
//import ERC20Instance from "../contracts/IERC20.json";
import { kovanTokenMap } from "./func/tokenMaps.js";

//import { load } from "dotenv";

class App extends Component {

	componentDidMount = async() => {
		try {
			window.addEventListener('resize', this.props.detectMobile);
			console.log('app.js componentDidMount called');
			this.web3 = await getWeb3();
			this.accounts = await this.web3.eth.getAccounts();
			console.log(this.accounts);

			this.networkId = await this.web3.eth.net.getId();

			console.log("network ID", typeof this.networkId);

			this.PoolTrackerInstance = new this.web3.eth.Contract(
				PoolTracker.abi,
				PoolTracker.networks[this.networkId] && PoolTracker.networks[this.networkId].address,
			);

			this.poolTrackerAddress = PoolTracker.networks[this.networkId].address;
			console.log("Pool Tracker Address:", this.poolTrackerAddress);

			const tokenMap = this.getTokenMapFromNetwork();
			this.setTokenMapState(tokenMap);
			this.setActiveAccountState();
			this.setVerifiedPoolState();
		}
		catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to load web3, accounts, or contract. Check console for details.`,
			);
			console.error(error);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.props.detectMobile);
	}

	setActiveAccountState = () => {
		const activeAccount = this.web3.currentProvider.selectedAddress;
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
	setVerifiedPoolState = async() => {
		const verifiedPools = await this.PoolTrackerInstance.methods.getVerifiedPools().call();
		this.props.updateVerifiedPoolAddrs(verifiedPools);
		const verifiedPoolInfo = await this.getVerifiedPoolInfo(verifiedPools, this.getTokenMapFromNetwork());
		console.log('---------verifiedPoolInfo--------', verifiedPoolInfo);
		this.props.updateVerifiedPoolInfo(verifiedPoolInfo);
	}

	getVerifiedPoolInfo = async(poolTracker, tokenMap) => {
		const activeAccount = this.web3.currentProvider.selectedAddress;
		let poolInfo = [];
		for(let i=0; i < poolTracker.length; i++){
			let JCPoolInstance = new this.web3.eth.Contract(
				JCPool.abi,
				poolTracker[i],
			);

			let acceptedTokens = await JCPoolInstance.methods.getAcceptedTokens().call();
			let name = await JCPoolInstance.methods.getName().call();
			let receiver = await JCPoolInstance.methods.getRecipient().call();

			console.log("pool address:", JCPoolInstance.options.address)
			console.log("accepted tokens:", acceptedTokens);
			let acceptedTokenStrings = [];
			let acceptedTokenInfo = [];
			console.log('acceptedTokens', acceptedTokens)
			for(let j = 0; j < acceptedTokens.length; j++){
				const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === acceptedTokens[j]);
				console.log("tokenString", tokenString);
				acceptedTokenInfo.push({
					'totalDeposits': await JCPoolInstance.methods.getTotalDeposits(acceptedTokens[j]).call(),
					'userBalance': await JCPoolInstance.methods.getUserBalance(activeAccount, acceptedTokens[j]).call(),
					'unclaimedInterest': await JCPoolInstance.methods.getUnclaimedInterest(acceptedTokens[j]).call(),
					'claimedInterest': await JCPoolInstance.methods.getClaimedInterest(acceptedTokens[j]).call(),
					'aTokenAddress': await JCPoolInstance.methods.getATokenAddress(acceptedTokens[j]).call(),
					'acceptedTokenString': tokenString,
					'decimals': tokenMap[tokenString].decimals,
					'address': acceptedTokens[j],
				});
				acceptedTokenStrings.push(tokenString);
			}
			poolInfo.push({
							receiver: receiver,
							name: name,
							address: poolTracker[i],
							acceptedTokens: acceptedTokenStrings,
							acceptedTokenInfo: acceptedTokenInfo,
			});
		}

		console.log("pool info", poolInfo);
		console.log("pool tracker", poolTracker);
		return poolInfo;
	}

	render() {
		let history;
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
			history = this.props.history;
		} else {
			history = createBrowserHistory({ basename: '/just_cause' })
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
})

export default connect(mapStateToProps, mapDispatchToProps)(App)