import Web3 from "web3";
import Web3Modal from "web3modal";
import React, { Component } from "react"
import { connect } from "react-redux"
import { ConnectedRouter } from 'connected-react-router'
import { createHashHistory} from 'history'

import routes from './routes'
import { detectMobile } from "./actions/mobile"
import { updateActiveAccount } from "./actions/activeAccount"
import { updateAlert } from "./actions/alert"
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
import { updatePendingTxList } from "./actions/pendingTxList";

import PoolTracker from "../contracts/PoolTracker.json";
import ERC20Instance from "../contracts/IERC20.json";
import { getTokenMap, optimismTokenMap, arbitrumTokenMap, getAaveAddressProvider, deployedNetworks, getPoolTrackerAddress} from "./func/tokenMaps.js";

import {getPoolInfo, checkTransactions, getDepositorAddress, getAllowance, getLiquidityIndexFromAave, getAavePoolAddress } from './func/contractInteractions.js';

import { getPriceFromCoinCap } from './func/priceFeeds.js'
import {precise, delay, getVerifiedPoolInfoAws, filterOutVerifieds, encryptString, decryptString} from './func/ancillaryFunctions';
import connectWallet from "./func/connectWallet";
import { getDataFromS3 } from "./func/awsS3";
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { optimism, arbitrum } from 'wagmi/chains'

import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const projectId = '121c52ec6852ab6b453b3fbf45945d49'

// Configure chains & providers with the Alchemy provider.
  // Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
  const { chains, publicClient, webSocketPublicClient } = configureChains(
	[optimism, arbitrum],
	[infuraProvider({ apiKey: process.env.REACT_APP_INFURA_KEY }), publicProvider()],
  )

  // Set up wagmi config
  const wagmiConfig = createConfig({
	autoConnect: true,
	connectors: [
	  new MetaMaskConnector({ chains, options: { shimDisconnect: true } }),
	  new CoinbaseWalletConnector({
		chains,
		options: {
		  appName: 'JustCause',
		},
	  }),
	  new WalletConnectConnector({
		chains,
		options: {
		  projectId: projectId,
		},
	  }),
	],
	publicClient,
	webSocketPublicClient,
  })

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			interval: "",
		}
	}
	componentDidMount = async() => {
		try {
			window.addEventListener('resize', this.props.detectMobile);

			const activeAccount = sessionStorage.getItem('activeAccount');
			if(activeAccount){
				await this.props.updateActiveAccount(JSON.parse(activeAccount));
			}

			const connector = sessionStorage.getItem('connectionType');
			if(connector){
				await this.props.updateConnect(JSON.parse(connector));
			}

			const networkId = sessionStorage.getItem('networkId');
			if(networkId){
				await this.props.updateNetworkId(parseInt(networkId));
				this.networkId = parseInt(networkId);
			}
			else{
				await this.props.updateNetworkId(10);
				console.log("no networkId stored chainID set to Optimism");
				this.networkId = 10;
			}

			let verifiedPoolInfo;
			/*if(activeAccount){
				verifiedPoolInfo = sessionStorage.getItem("verifiedPoolInfo");
				if(verifiedPoolInfo){
					await this.props.updateVerifiedPoolInfo(JSON.parse(verifiedPoolInfo));
					console.log("verifiedPoolInfo from storage", JSON.parse(verifiedPoolInfo));
				}
				const ownerPoolInfo = sessionStorage.getItem("ownerPoolInfo");
				if(ownerPoolInfo){
					await this.props.updateOwnerPoolInfo(JSON.parse(ownerPoolInfo));
					console.log("ownerPoolInfo from storage", JSON.parse(ownerPoolInfo));
				}
				const userDepositPoolInfo = sessionStorage.getItem("userDepositPoolInfo");
				if(userDepositPoolInfo){
					await this.props.updateUserDepositPoolInfo(JSON.parse(userDepositPoolInfo));
					console.log("userDepositPoolInfo from storage", JSON.parse(userDepositPoolInfo));
				}
			}*/

			let tokenMapCache = sessionStorage.getItem("tokenMap");
			if(tokenMapCache && JSON.parse(tokenMapCache).networkId == this.networkId){
				await this.setTokenMapInitialState(JSON.parse(tokenMapCache))
			}
			else{
				if(this.networkId == 10){
					await this.setTokenMapInitialState(optimismTokenMap);
				}
				else if(this.networkId == 42161){
					await this.setTokenMapInitialState(arbitrumTokenMap);
				}
			}

			console.log("tempTokenMap",this.props.tokenMap)
			if(!verifiedPoolInfo && this.networkId == 10){
				const newTokenMap = Object.fromEntries(
					Object.entries(this.props.tokenMap).filter(([key]) => key !== "networkId")
				  );
				const {verifiedPoolInfo, contributorPoolInfo, receiverPoolInfo} = await getVerifiedPoolInfoAws(newTokenMap, this.props.activeAccount);
				await this.setPoolsFromAws(verifiedPoolInfo, contributorPoolInfo, receiverPoolInfo);
			}
		}

		catch (error) {
			alert(
				`There was an error loading the page`,
			);
			console.error(error);
		}
	}

	componentDidUpdate = async(prevProps) => {
        if (this.props.connect && this.props.connect !== prevProps.connect) {
			console.log("update connect", this.props)
            // account prop has changed, perform your logic
			await this.setUpConnection();
        }

		if(this.props.networkId !== prevProps.networkId){
			if(prevProps.networkId){
				console.log("networkId chainged", prevProps.networkId, this.props.networkId);
				this.networkId = this.props.networkId;
				await this.setPoolStates();
				if(this.props.connect !== "WalletConnect" && this.props.connect !== "Coinbase Wallet") this.subscribeToInfura();
			}
			else{
				console.log("test");
			}
		}
    }

	componentWillUnmount() {
		console.log("unmounting")
		window.removeEventListener('resize', this.props.detectMobile);

		this.claimSubscription && this.claimSubscription.unsubscribe();
		this.addPoolSubscription && this.addPoolSubscription.unsubscribe();
		this.addDepositSubscription && this.addDepositSubscription.unsubscribe();
		this.withdrawDepositSubscription && this.withdrawDepositSubscription.unsubscribe();

		if (this.walletConnection && this.walletConnection.unsubscribeAll) {
			this.walletConnection.unsubscribeAll();
		}
	}

	setUpConnection = async() => {
		const pendingTxList = sessionStorage.getItem("pendingTxList");
		if(pendingTxList){
			const truePending = await checkTransactions(JSON.parse(pendingTxList), this.props.connect);
			this.props.updatePendingTxList(truePending);
			sessionStorage.setItem("pendingTxList", JSON.stringify(truePending));
		}
		if(this.props.activeAccount){
			await this.getAccounts();
			await this.setAccounts();
			await this.setPoolStates();
			if(this.props.connect !== "WalletConnect" && this.props.connect !== "Coinbase Wallet") this.subscribeToInfura();
		}
	}

	setAccounts = async() => {
		this.setActiveAccountState(this.props.activeAccount);
	}

	setPoolStates = async() => {
		this.poolTrackerAddress = getPoolTrackerAddress(this.props.networkId);
		this.PoolTrackerInstance = new this.web3.eth.Contract(
			PoolTracker.abi,
			this.poolTrackerAddress,
		);

		console.log("poolTracker Addr", this.poolTrackerAddress)

		this.setPoolTrackAddress(this.poolTrackerAddress);

		let tokenMapCache = sessionStorage.getItem("tokenMap");
		if(tokenMapCache && JSON.parse(tokenMapCache).networkId === this.networkId){
			await this.setTokenMapInitialState(JSON.parse(tokenMapCache))
			console.log("tokenMap match", JSON.parse(tokenMapCache))
		}
		else{
			if(this.networkId === 10) await this.setTokenMapInitialState(optimismTokenMap);
			else if(this.networkId === 42161) await this.setTokenMapInitialState(arbitrumTokenMap);
		}

		//const {verifiedPoolInfo, contributorPoolInfo, receiverPoolInfo} = await getVerifiedPoolInfoAws(this.props.tokenMap, this.props.activeAccount);
		//console.log("pools in App", verifiedPoolInfo, contributorPoolInfo, receiverPoolInfo, this.props.tokenMap)
		//await this.setPoolsFromAws(verifiedPoolInfo, contributorPoolInfo, receiverPoolInfo);

		await this.setPoolStateAll(this.props.activeAccount);
		const aaveAddressesProvider = getAaveAddressProvider(this.networkId);
		this.setAavePoolAddress(aaveAddressesProvider);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.props.detectMobile);
	}

	connectToWeb3 = async() => {
		let web3;
		try {
			this.walletConnection = await connectWallet(this.props.connect);
			web3 = this.walletConnection.web3;
		}
		catch (error) {
			console.error(error);
		}
		return web3;
	}

	subscribeToInfura = async() => {
		let poolTrackerInstance = new this.web3.eth.Contract(
			PoolTracker.abi,
			this.poolTrackerAddress,
		);

		let options = {
			filter: {
				value: [],
			},
			fromBlock: 0
		};

		console.log("events", poolTrackerInstance.events);

		let pending;
		this.claimSubscription = poolTrackerInstance.events.Claim(options)
			.on('data', async(event) => {
				//console.log("EVENT data", event)
				let pending = [...this.props.pendingTxList];
				pending.forEach((e, i) =>{
					if(e.txHash === event.transactionHash){
						e.status = "complete"
					}
				});
				await this.props.updatePendingTxList(pending);
				sessionStorage.setItem("pendingTxList", JSON.stringify(pending));

				await delay(3000);
				pending = (pending).filter(e => !(e.txHash === event.transactionHash));
				await this.props.updatePendingTxList(pending);
				sessionStorage.setItem("pendingTxList", JSON.stringify(pending));
			})
			.on('changed', changed => console.log("EVENT changed", changed))
			.on('error', err => console.log("EVENT err", err))
			.on('connected', str => console.log("EVENT str", str))

		this.addPoolSubscription = poolTrackerInstance.events.AddPool(options)
			.on('data', async(event) => {
				//console.log("EVENT data", event)
				let pending = [...this.props.pendingTxList];
				pending.forEach((e, i) =>{
					if(e.txHash === event.transactionHash){
						e.status = "complete"
					}
				});
				await this.props.updatePendingTxList(pending);
				sessionStorage.setItem("pendingTxList", JSON.stringify(pending));

				await delay(3000);
				pending = (pending).filter(e => !(e.txHash === event.transactionHash));
				await this.props.updatePendingTxList(pending);
				sessionStorage.setItem("pendingTxList", JSON.stringify(pending));
			})
			.on('changed', changed => console.log("EVENT changed", changed))
			.on('error', err => console.log("EVENT err", err))
			.on('connected', str => console.log("EVENT str", str))

		this.addDepositSubscription = poolTrackerInstance.events.AddDeposit(options)
			.on('data', async(event) => {
				//console.log("EVENT data", event)
				let pending = [...this.props.pendingTxList];
				pending.forEach((e, i) =>{
					if(e.txHash === event.transactionHash){
						e.status = "complete"
					}
				});
				await this.props.updatePendingTxList(pending);
				sessionStorage.setItem("pendingTxList", JSON.stringify(pending));

				await delay(3000);
				pending = (pending).filter(e => !(e.txHash === event.transactionHash));
				await this.props.updatePendingTxList(pending);
				sessionStorage.setItem("pendingTxList", JSON.stringify(pending));
			})
			.on('changed', changed => console.log("EVENT changed", changed))
			.on('error', err => console.log("EVENT err", err))
			.on('connected', str => console.log("EVENT str", str))

		this.withdrawDepositSubscription = poolTrackerInstance.events.WithdrawDeposit(options)
			.on('data', async(event) => {
				//console.log("EVENT data", event)
				let pending = [...this.props.pendingTxList];
				pending.forEach((e, i) =>{
					if(e.txHash === event.transactionHash){
						e.status = "complete"
					}
				});
				await this.props.updatePendingTxList(pending);
				sessionStorage.setItem("pendingTxList", JSON.stringify(pending));

				await delay(3000);
				pending = (pending).filter(e => !(e.txHash === event.transactionHash));
				await this.props.updatePendingTxList(pending);
				sessionStorage.setItem("pendingTxList", JSON.stringify(pending));
			})
			.on('changed', changed => console.log("EVENT changed", changed))
			.on('error', err => console.log("EVENT err", err))
			.on('connected', str => console.log("EVENT str", str))
	}

	getAccounts = async() => {
		this.web3 = await this.connectToWeb3();
		this.networkId = await this.web3.eth.net.getId();
		console.log("networkId", this.networkId)
		if(!deployedNetworks.includes(this.networkId)){
			const msg = "switch_network";
			this.props.updateAlert({msg});
			try {
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: "0xA" }],
				});
				this.props.updateAlert("");
				this.networkId = 10
			} catch (err) {
				alert("Optimism Network not found");
			}
		}
		await this.setNetworkId(this.networkId);
	}

	getAaveData = async() => {
		let results = await this.AaveProtocolDataProviderInstance.methods.getAllATokens().call();
		return results;
	}

	setAavePoolAddress = async(aavePoolAddressesProviderAddress) => {
		const aavePoolAddress = await getAavePoolAddress(aavePoolAddressesProviderAddress, this.props.connect);
		await this.props.updateAavePoolAddress(aavePoolAddress);

	}

	setNetworkId = async(networkId) => {
		await this.props.updateNetworkId(networkId);
		sessionStorage.setItem("networkId", networkId);
	}

	setPoolTrackAddress = async(poolTrackerAddress) => {
		await this.props.updatePoolTrackerAddress(poolTrackerAddress);
	}

	setPoolsFromAws = async(verifiedPoolInfo, contributorPoolInfo, receiverPoolInfo) => {
		if(Object.keys(verifiedPoolInfo).length > 0){
			await this.props.updateVerifiedPoolInfo(verifiedPoolInfo);
			await this.props.updateVerifiedPoolAddrs(Object.keys(verifiedPoolInfo));
		}
		if(Object.keys(contributorPoolInfo).length > 0){
			await this.props.updateUserDepositPoolInfo(contributorPoolInfo);
			await this.props.updateUserDepositPoolAddrs(Object.keys(contributorPoolInfo));
		}
		if(Object.keys(receiverPoolInfo).length > 0){
			await this.props.updateOwnerPoolInfo(receiverPoolInfo);
			await this.props.updateOwnerPoolAddrs(Object.keys(receiverPoolInfo));
		}
	}

	setActiveAccountState = async(activeAccount) => {
		await this.props.updateActiveAccount(activeAccount);
	}
	setTokenMapInitialState = async(tokenMap) => {
		let acceptedTokens = Object.keys(tokenMap);
		const claimedInterest = JSON.parse(await getDataFromS3("claimedInterest_OP"));
		const totalDeposit = JSON.parse(await getDataFromS3("totalDeposit_OP"));

		let prices = sessionStorage.getItem('prices');
		if(prices){
			prices = JSON.parse(prices);
		}
		else{
			prices = await getPriceFromCoinCap();
			if(prices){
				sessionStorage.setItem('prices', JSON.stringify(prices));
			}
		}

		for(let i = 0; i < acceptedTokens.length; i++){
			const key = acceptedTokens[i];
				if(key != "networkId"){
					const address =  tokenMap[key] && tokenMap[key].address;

			if(!tokenMap[key]['priceUSD']){
				const coinCapPriceData = await getPriceFromCoinCap();
				const apiKey = tokenMap[key] && tokenMap[key].apiKey;
				if(coinCapPriceData[apiKey]){
					tokenMap[key]['priceUSD'] = coinCapPriceData[apiKey];
				}
				else{
					tokenMap[key]['priceUSD'] = 0;
				}
			}

					const tvl = totalDeposit[address] ? totalDeposit[address] : 0//need to pull from aws
					tokenMap[key]['tvl'] = precise(tvl, tokenMap[key]['decimals']);

					const totalDonated = claimedInterest[address] ? claimedInterest[address] : 0
					tokenMap[key]['totalDonated'] = precise(totalDonated, tokenMap[key]['decimals']);
				}
		}
		console.log(tokenMap)
		await this.props.updateTokenMap(tokenMap);
		sessionStorage.setItem("tokenMap", JSON.stringify(tokenMap));
		console.log("after initial", tokenMap)
	}

	setTokenMapFinalState = async(tokenMap) => {
		let acceptedTokens = Object.keys(tokenMap);

		for(let i = 0; i < acceptedTokens.length; i++){
			const key = acceptedTokens[i];
			if(key != "networkId"){
				const address =  tokenMap[key] && tokenMap[key].address;

				const aaveTokenInfo = await getLiquidityIndexFromAave(address, getAaveAddressProvider(this.networkId), this.props.connect);

				tokenMap[key]['depositAPY'] = this.calculateAPY(aaveTokenInfo.currentLiquidityRate).toPrecision(4);
				tokenMap[key]['liquidityIndex'] = aaveTokenInfo.liquidityIndex;

				const tvl = await this.PoolTrackerInstance.methods.getTVL(address).call();
				tokenMap[key]['tvl'] = precise(tvl, tokenMap[key]['decimals']);

				const totalDonated = await this.PoolTrackerInstance.methods.getTotalDonated(address).call();
				tokenMap[key]['totalDonated'] = precise(totalDonated, tokenMap[key]['decimals']);
				tokenMap[key]['allowance'] = await getAllowance(address, this.poolTrackerAddress, this.props.activeAccount, this.props.connect)
			}
		}
		await this.props.updateTokenMap(tokenMap);
		sessionStorage.setItem("tokenMap", JSON.stringify(tokenMap));
		console.log("tokenMap final", tokenMap);
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

	setPoolStateAll = async(activeAccount) => {
		const verifiedPools = filterOutVerifieds(await this.PoolTrackerInstance.methods.getVerifiedPools().call());
		console.log("setPoolStateAll 1");
		const ownerPools = await this.getOwnerAddress(activeAccount);
		console.log("setPoolStateAll 2", this.poolTrackerAddress, this.PoolTrackerInstance.options.address);
		const depositBalancePools = await getDepositorAddress(activeAccount, this.poolTrackerAddress, this.props.connect);
		const userDepositPools = depositBalancePools.depositPools;
		const userBalancePools = depositBalancePools.balances;

		console.log("setPoolStateAll 3");
		let verifiedPoolInfo;
		verifiedPoolInfo = await getPoolInfo(verifiedPools, getTokenMap(this.networkId), userBalancePools, {}, this.props.connect);
		await this.props.updateVerifiedPoolInfo(verifiedPoolInfo);
		sessionStorage.setItem("verifiedPoolInfo", JSON.stringify(verifiedPoolInfo));
		console.log("setPoolStateAll 4");
		let ownerPoolInfo;
		ownerPoolInfo = await getPoolInfo(ownerPools, getTokenMap(this.networkId), userBalancePools, this.props.verifiedPoolInfo, this.props.connect);
		await this.props.updateUserDepositPoolAddrs(userDepositPools);
		await this.props.updateOwnerPoolAddrs(ownerPools);
		await this.props.updateOwnerPoolInfo(ownerPoolInfo);
		sessionStorage.setItem("ownerPoolInfo", JSON.stringify(ownerPoolInfo));

		let userDepositPoolInfo;
		let knownPools = ownerPoolInfo;

		userDepositPoolInfo = await getPoolInfo(userDepositPools, getTokenMap(this.networkId),  userBalancePools, knownPools, this.props.connect);
		await this.props.updateUserDepositPoolInfo(userDepositPoolInfo);
		sessionStorage.setItem("userDepositPoolInfo", JSON.stringify(userDepositPoolInfo));
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
		<WagmiConfig config={wagmiConfig}>
			<ConnectedRouter history={history}>
				{ routes }
			</ConnectedRouter>
		</WagmiConfig>
		)
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
	activeAccount: state.activeAccount,
	networkId: state.networkId,
	aavePoolAddress: state.aavePoolAddress,
	connect: state.connect,
	tokenMap: state.tokenMap,
	pendingTxList: state.pendingTxList,
})

const mapDispatchToProps = dispatch => ({
	detectMobile: () => dispatch(detectMobile()),
	updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
	updateAlert: (s) => dispatch(updateAlert(s)),
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
	updatePendingTxList: (list) => dispatch(updatePendingTxList(list)),
})

export default connect(mapStateToProps, mapDispatchToProps)(App)