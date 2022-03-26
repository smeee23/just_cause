import { connect } from "react-redux";

import getWeb3 from "../../getWeb3NotOnLoad";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";
import JCDepositorERC721 from "../../contracts/JCDepositorERC721.json";
import PoolAddressesProvider from "../../contracts/IPoolAddressesProvider.json";
import Pool from "../../contracts/IPool.json";

	export const getLiquidityIndexFromAave = async(tokenAddress, poolAddressesProviderAddress) => {
		const web3 = await getWeb3();
		const PoolAddressesProviderInstance = new web3.eth.Contract(
			PoolAddressesProvider.abi,
			poolAddressesProviderAddress,
		);

		let poolAddr = await PoolAddressesProviderInstance.methods.getPool().call();

		const PoolInstance = new web3.eth.Contract(
			Pool.abi,
			poolAddr,
		);
		let aaveTokenInfo = await PoolInstance.methods.getReserveData(tokenAddress).call();
		console.log('result', aaveTokenInfo.liquidityIndex);
		return aaveTokenInfo;
	}

	export const getAllowance = async(erc20Instance, address, activeAccount) => {
		const allowance = await erc20Instance.methods.allowance(activeAccount, address).call();
		return allowance;
	}

	const getWalletBalance = async(tokenAddress, activeAccount) => {
		const web3 = await getWeb3();
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		const balance = await erc20Instance.methods.balanceOf(activeAccount).call();
		return balance;
	}

	export const getAmountBase = (amount, decimals) => {
		console.log('amount in base', amount*10**decimals);
		return (amount*10**decimals).toString();
	}

	export const getBalance = async(tokenAddress, decimals, tokenString, activeAccount) => {
		if(tokenString === 'ETH' || 'MATIC'){
			const web3 = await getWeb3()
			let balance = await web3.eth.getBalance(activeAccount);
			console.log('balance', balance);
			balance = await web3.utils.fromWei(balance, "ether");
			return Number.parseFloat(balance).toPrecision(6);
		}
		else{
			let balance = await getWalletBalance(tokenAddress, activeAccount);
			balance = balance / 10**decimals;
			console.log('balance', balance);
			return Number.parseFloat(balance).toPrecision(6);
		}
	}

	export const addDeployedPool = async(poolAddress, activeAccount, poolTrackerAddress, tokenMap, poolLists) => {

		const depositBalancePools = await getDepositorAddress(activeAccount, poolTrackerAddress); //await this.PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();
		const userBalancePools = depositBalancePools.balances;

		const poolInfo = await getPoolInfo([poolAddress], tokenMap,  userBalancePools);

		console.log('poolLists 1', poolLists)
		for(let i = 0; i < poolLists.length; i++){
			poolLists[i].push(poolInfo[0]);
		}

		console.log('poolLists 2', poolLists)
		return poolLists;
	}

	export const addUserDepositedPool = async(poolAddress, activeAccount, poolTrackerAddress, tokenMap, userDepositPoolInfo) => {

		for(let i = 0; i < userDepositPoolInfo.length; i++){
			if(userDepositPoolInfo[i].address === poolAddress){
				return;
			}
		}

		const depositBalancePools = await getDepositorAddress(activeAccount, poolTrackerAddress); //await this.PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();
		const userBalancePools = depositBalancePools.balances;
		const poolInfo = await getPoolInfo([poolAddress], tokenMap,  userBalancePools);
		userDepositPoolInfo.push(poolInfo[0]);
		console.log(' userDepositPoolInfo', userDepositPoolInfo);
		return userDepositPoolInfo;
	}

	export const updatePoolInfo = async(poolAddress, activeAccount, poolTrackerAddress, tokenMap, poolLists) => {

		const depositBalancePools = await getDepositorAddress(activeAccount, poolTrackerAddress); //await this.PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();
		const userBalancePools = depositBalancePools.balances;

		const poolInfo = await getPoolInfo([poolAddress], tokenMap,  userBalancePools);
		console.log('poolLists');
		for(let i=0; i < poolLists.length; i++){
			if(poolLists[i]){
				for(let j=0; j < poolLists[i].length; j++){
					if(poolLists[i][j].address === poolAddress){
						console.log(poolLists[i][j].address);
						console.log(poolInfo[0]);
						console.log(poolLists[i][j]);
						poolLists[i][j] = poolInfo[0];
					}
				}
			}
		}
		console.log('poolLists', poolLists)
		return poolLists;
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

		console.log('poolTracker', poolTracker);

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
				let balances = userBalancePools[poolTracker[i]+acceptedTokens[j]];
				const balance = (balances) ? balances[0] : 0;
				const amountScaled = (balances) ? balances[1] : 0;

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
					'allowance': tokenMap[tokenString].allowance,
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
		console.log('end');
		return poolInfo;
	}

	export const getExternalPoolInfo = async(poolTrackerAddress, activeAccount, tokenMap, address) => {
		const depositBalancePools = await getDepositorAddress(activeAccount, poolTrackerAddress);
		const userBalancePools = depositBalancePools.balances;
		const resultPool = await getPoolInfo([address], tokenMap, userBalancePools);
		return resultPool;
	}

	export const searchPools = async(poolTrackerAddress, activeAccount, tokenMap, searchAddr) => {
		const web3 = await getWeb3();

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

		for(let i = 0; i < balance; i++){
			const tokenId = await ERCInstance.methods.tokenOfOwnerByIndex(activeAccount, i).call();
			const depositInfo = await ERCInstance.methods.getDepositInfo(tokenId).call();
			//if(depositInfo.balance > 0){
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
