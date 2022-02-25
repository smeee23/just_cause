import { connect } from "react-redux";

import getWeb3 from "../../getWeb3NotOnLoad";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";
import JCDepositorERC721 from "../../contracts/JCDepositorERC721.json";

import { updatePendingTx } from "../actions/pendingTx"

	export const getAllowance = async(erc20Instance, address, activeAccount) => {
		const allowance = await erc20Instance.methods.allowance(activeAccount, address).call();
		console.log("allowance", allowance, typeof allowance);
		return allowance;
	}

	const getWalletBalance = async(tokenAddress) => {
		const web3 = await getWeb3();
		const activeAccount = await web3.currentProvider.selectedAddress;
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		const balance = await erc20Instance.methods.balanceOf(activeAccount).call();
		return balance;
	}

	export const getAmountBase = (amount, decimals) => {
		console.log('amount in base', amount*10**decimals);
		return (amount*10**decimals).toString();
	}

	export const getBalance = async(tokenAddress, decimals, tokenString, activeAccount) => {
		if(tokenString !== 'ETH'){
			let balance = await getWalletBalance(tokenAddress);
			balance = balance / 10**decimals;
			return Number.parseFloat(balance).toPrecision(6);
		}
		else{
			const web3 = await getWeb3()
			let balance = await web3.eth.getBalance(activeAccount);
			balance = await web3.utils.fromWei(balance, "ether");
			return Number.parseFloat(balance).toPrecision(6);
		}
	}

	/*export const getPoolStateFromChain = async(activeAccount, tokenMap, networkId) => {

		const web3 = await getWeb3();
		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			PoolTracker.networks[networkId] && PoolTracker.networks[networkId].address,
		);

		const verifiedPools = await PoolTrackerInstance.methods.getVerifiedPools().call();
		const ownerPools = await PoolTrackerInstance.methods.getUserOwned(activeAccount).call();
		let userDepositPools = await PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();

		let isHashMatch = true;
		for(let i = 0; i < verifiedPools.length; i++){
			const isMatch = await PoolTrackerInstance.methods.checkByteCode(verifiedPools[i]).call();
			if(!isMatch){
				isHashMatch = false;
			}
		}
		console.log('isHashMatch', isHashMatch);
		userDepositPools = [...new Set(userDepositPools)];

		const verifiedPoolInfo = await getPoolInfo(verifiedPools, tokenMap, activeAccount);
		const ownerPoolInfo = await getPoolInfo(ownerPools, tokenMap, activeAccount);
		const userDepositPoolInfo = await getPoolInfo(userDepositPools, tokenMap, activeAccount);

		console.log('---------verifiedPoolInfo--------', verifiedPoolInfo);
		console.log('---------ownerPoolInfo--------', ownerPoolInfo);
		console.log('---------userDepositPoolInfo--------', userDepositPoolInfo);

		return { verifiedPools, ownerPools, userDepositPools, verifiedPoolInfo, ownerPoolInfo, userDepositPoolInfo };
	}*/


	export const getPoolInfo = async(poolTracker, tokenMap, userBalancePools) => {
		const web3 = await getWeb3();
		let poolInfo = [];
		for(let i=0; i < poolTracker.length; i++){
			let JCPoolInstance = new web3.eth.Contract(
				JCPool.abi,
				poolTracker[i],
			);

			let acceptedTokens = await JCPoolInstance.methods.getAcceptedTokens().call();
			let name = await JCPoolInstance.methods.getName().call();
			let receiver = await JCPoolInstance.methods.getRecipient().call();
			let about = await JCPoolInstance.methods.getAbout().call();
			const hashByteCode = await JCPoolInstance.methods.getHashByteCode().call();

			let acceptedTokenStrings = [];
			let acceptedTokenInfo = [];

			for(let j = 0; j < acceptedTokens.length; j++){
				const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === acceptedTokens[j]);
				//let {balance, amountScaled} = userBalancePools[poolTracker[i]+acceptedTokens[j]];
				let balances = userBalancePools[poolTracker[i]+acceptedTokens[j]];
				const balance = (balances) ? balances[0] : 0;
				const amountScaled = (balances) ? balances[1] : 0;

				//const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, acceptedTokens[j]);
				//const activeAccount = await web3.currentProvider.selectedAddress;
				//const allowance = await getAllowance(erc20Instance, poolTracker[i], activeAccount)
				acceptedTokenInfo.push({
					'totalDeposits': await JCPoolInstance.methods.getTotalDeposits(acceptedTokens[j]).call(),
					'userBalance':  balance,
					'amountScaled':  amountScaled,
					'unclaimedInterest': await JCPoolInstance.methods.getUnclaimedInterest(acceptedTokens[j]).call(),
					'claimedInterest': await JCPoolInstance.methods.getClaimedInterest(acceptedTokens[j]).call(),
					'reserveNormalizedIncome': await JCPoolInstance.methods.getReserveNormalizedIncome(acceptedTokens[j]).call(),
					'aTokenAddress': await JCPoolInstance.methods.getATokenAddress(acceptedTokens[j]).call(),
					'liquidityIndex': await JCPoolInstance.methods.getAaveLiquidityIndex(acceptedTokens[j]).call(),
					'acceptedTokenString': tokenString,
					'decimals': tokenMap[tokenString].decimals,
					'depositAPY': tokenMap[tokenString] && tokenMap[tokenString].depositAPY,
					'address': acceptedTokens[j],
				});
				acceptedTokenStrings.push(tokenString);
			}

			poolInfo.push({
							receiver: receiver,
							name: name,
							about: about,
							address: poolTracker[i],
							acceptedTokens: acceptedTokenStrings,
							acceptedTokenInfo: acceptedTokenInfo,
			});
		}
		return poolInfo;
	}

	export const searchPools = async(poolTrackerAddress, activeAccount, tokenMap) => {
		const web3 = await getWeb3();
		let searchAddr = prompt("Enter pool address or name to search for pool (must be exact match):");

		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			poolTrackerAddress,
		);

		if(!web3.utils.isAddress(searchAddr)){
			searchAddr = await PoolTrackerInstance.methods.getAddressFromName(searchAddr).call();
		}

		if(searchAddr !== '0x0000000000000000000000000000000000000000'){
			const found = await PoolTrackerInstance.methods.checkPool(searchAddr).call();
			console.log('searchResult', found);
			if(found){
				const depositBalancePools = await getDepositorAddress(activeAccount, poolTrackerAddress);
				const userBalancePools = depositBalancePools.balances;
				const resultPool = await getPoolInfo([searchAddr], tokenMap, userBalancePools);
				console.log('searchResult', resultPool);
				return resultPool
			}
			else{
				alert('Pool not found, double check address or name');
			}
		}
		else{
			alert('Pool not found, double check address or name');
		}
		return []
	}

	export const getDepositorAddress = async(activeAccount, poolTrackerAddress) => {
		const web3 = await getWeb3();
		let userDepositPools = [];
		let userBalancePools = {};

		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			poolTrackerAddress,
		);
		console.log('poolTrackerAddress', poolTrackerAddress);
		const ERCAddr = await PoolTrackerInstance.methods.getDepositorERC721Address().call();
		const ERCInstance = new web3.eth.Contract(
			JCDepositorERC721.abi,
			ERCAddr,
		);

		let balance = await ERCInstance.methods.balanceOf(activeAccount).call();
		console.log('ERCAddr:', ERCAddr);

		for(let i = 0; i < balance; i++){
			const tokenId = await ERCInstance.methods.tokenOfOwnerByIndex(activeAccount, i).call();
			console.log('tokenId:', tokenId);
			const depositInfo = await ERCInstance.methods.getDepositInfo(tokenId).call();
			console.log('pool:', depositInfo);
			//if(depositInfo.balance > 0){
				console.log('depositInfo', depositInfo);
				userDepositPools.push(depositInfo.pool);
				userBalancePools[depositInfo.pool+depositInfo.asset] = [depositInfo.balance, depositInfo.amountScaled, depositInfo.timeStamp, depositInfo.pool, depositInfo.asset];
				//userBalancePools[depositInfo.pool+depositInfo.asset] = depositInfo.balance;
			//}
		}

		return {'depositPools':[...new Set(userDepositPools)], 'balances':userBalancePools};
	}

	export const getVerifiedPools = async(networkId) => {
		const web3 = await getWeb3();
		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			PoolTracker.networks[networkId] && PoolTracker.networks[networkId].address,
		);

		const verifiedPools = await PoolTrackerInstance.methods.getVerifiedPools().call();
		return verifiedPools;
	}

	export const getUserOwned = async(activeAccount, networkId) => {
		const web3 = await getWeb3();
		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			PoolTracker.networks[networkId] && PoolTracker.networks[networkId].address,
		);

		const ownerPools = await PoolTrackerInstance.methods.getUserOwned(activeAccount).call();
		return ownerPools;
	}

	export const getUserDeposits = async(activeAccount, networkId) => {
		const web3 = await getWeb3();
		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			PoolTracker.networks[networkId] && PoolTracker.networks[networkId].address,
		);

		let userDepositPools = await PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();
		return [...new Set(userDepositPools)];
	}

	const mapStateToProps = state => ({
		pendingTx: state.pendingTx,
	})

	const mapDispatchToProps = dispatch => ({
		updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	})

	export default connect(mapStateToProps, mapDispatchToProps)
