import getWeb3 from "../../getWeb3NotOnLoad";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import BurnPit from "../../contracts/not_truffle/BurnPit.json";
import ERC20Instance from "../../contracts/IERC20.json";
import JCDepositorERC721 from "../../contracts/JCDepositorERC721.json";
import PoolAddressesProvider from "../../contracts/IPoolAddressesProvider.json";
import UniswapV2Router02 from "../../contracts/IUniswapV2Router02.json";
import Pool from "../../contracts/IPool.json";
import { getIpfsData } from "./ipfs";
import { tempFixForDescriptions } from "./verifiedPoolMap";
import { getSushiRouterAddress, getBurnPitAddress } from "./tokenMaps"

	export const getAavePoolAddress = async(poolAddressesProviderAddress) => {
		const web3 = await getWeb3();
		const PoolAddressesProviderInstance = new web3.eth.Contract(
			PoolAddressesProvider.abi,
			poolAddressesProviderAddress,
		);

		const poolAddr = await PoolAddressesProviderInstance.methods.getPool().call();
		return poolAddr;
	}

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
		return (amount*10**decimals).toString();
	}

	export const getBalance = async(tokenAddress, decimals, tokenString, activeAccount) => {
		if(tokenString === 'ETH' || tokenString === 'MATIC'){
			const web3 = await getWeb3()
			let balance = await web3.eth.getBalance(activeAccount);
			balance = await web3.utils.fromWei(balance, "ether");
			return Number.parseFloat(balance).toPrecision(6);
		}
		else{
			let balance = await getWalletBalance(tokenAddress, activeAccount);
			balance = balance / 10**decimals;
			return Number.parseFloat(balance).toPrecision(6);
		}
	}

	export const addDeployedPool = async(poolAddress, activeAccount, poolTrackerAddress, tokenMap, poolLists) => {

		const depositBalancePools = await getDepositorAddress(activeAccount, poolTrackerAddress);
		const userBalancePools = depositBalancePools.balances;

		const poolInfo = await getPoolInfo([poolAddress], tokenMap,  userBalancePools);


		for(let i = 0; i < poolLists.length; i++){
			if(i !== 0 || poolInfo[0].isVerified){
				poolLists[i].push(poolInfo[0]);
			}
		}

		return poolLists;
	}

	export const addPoolToPoolInfo = async(poolAddress, activeAccount, poolTrackerAddress, tokenMap, prevInfo) => {
		const depositBalancePools = await getDepositorAddress(activeAccount, poolTrackerAddress);
		const userBalancePools = depositBalancePools.balances;
		const poolInfo = await getPoolInfo([poolAddress], tokenMap,  userBalancePools);
		prevInfo.push(poolInfo[0]);
		return prevInfo;
	}

	export const updatePoolInfo = async(poolAddress, activeAccount, poolTrackerAddress, tokenMap, poolLists) => {

		const depositBalancePools = await getDepositorAddress(activeAccount, poolTrackerAddress);
		const userBalancePools = depositBalancePools.balances;

		const poolInfo = await getPoolInfo([poolAddress], tokenMap,  userBalancePools);
		for(let i=0; i < poolLists.length; i++){
			if(poolLists[i]){
				for(let j=0; j < poolLists[i].length; j++){
					if(poolLists[i][j].address === poolAddress){
						poolLists[i][j] = poolInfo[0];
					}
				}
			}
		}
		return poolLists;
	}

	export const getContractInfo = async(poolAddress) => {
		const web3 = await getWeb3();

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			poolAddress,
		);

		return await JCPoolInstance.methods.getPoolInfo().call();
	}

	export const getAmountSwapOut = async(path, amount) => {
		const web3 = await getWeb3();

		const routerAddress = getSushiRouterAddress();
        let SushiRouterInstance = new web3.eth.Contract(
			UniswapV2Router02.abi,
			routerAddress
		);

        const amt = web3.eth.abi.encodeParameter('uint256', amount);
        var mycall = await SushiRouterInstance.methods.getAmountsOut(amt, path).call({});
        return(mycall);
	}

	export const getBurnBalances = async(tokenMap) => {
		if(tokenMap){
		const web3 = await getWeb3();
		const acceptedTokens = [
								tokenMap["USDC"] && tokenMap['USDC'].address,
								tokenMap["WETH"] && tokenMap['WETH'].address,
								tokenMap["MATIC"] && tokenMap['MATIC'].address
							   ];

		const burnPitAddress = getBurnPitAddress();

		const wmaticBalance = await getWalletBalance(acceptedTokens[2], burnPitAddress);
		console.log("WMATIC BALANCE", wmaticBalance);

		const wethBalance = await getWalletBalance(acceptedTokens[1], burnPitAddress);
		console.log("WETH BALANCE", wethBalance);

		const usdcBalance = await getWalletBalance(acceptedTokens[0], burnPitAddress);
		console.log("USDC BALANCE", usdcBalance);

		const ethBalance = await web3.eth.getBalance(burnPitAddress);
		console.log("MATIC BALANCE", ethBalance);

		return { wmaticBalance, wethBalance, usdcBalance, ethBalance };
		}
	}

	export const checkTransactions = async(pendingList) => {
		const web3 = await getWeb3();
		let truePendings = [];
		pendingList.forEach(async(x) => {
			const receipt = await web3.eth.getTransactionReceipt(x.txHash);
			if(!receipt){
				truePendings.push(x);
			}
		});
		console.log("truePendings", truePendings)
		return truePendings;
	}

	export const burn = async(tokenMap, activeAccount) => {
		const web3 = await getWeb3();
		const carbonToken = '0xD838290e877E0188a4A44700463419ED96c16107';
		const acceptedTokens = [
								tokenMap["USDC"] && tokenMap['USDC'].address,
								tokenMap["WETH"] && tokenMap['WETH'].address,
								tokenMap["MATIC"] && tokenMap['MATIC'].address
							   ];

		const burnPitAddress = getBurnPitAddress();
		const wmaticBalance = await getWalletBalance(acceptedTokens[2], burnPitAddress);
		let wmaticAmount = '0';
		if(wmaticBalance > 0){
			wmaticAmount = (await getAmountSwapOut([acceptedTokens[2], acceptedTokens[0], carbonToken], wmaticBalance))[2];
		}
		console.log("AMOUNT SWAP OUT", wmaticAmount, wmaticBalance);

		const wethBalance = await getWalletBalance(acceptedTokens[1], burnPitAddress);
		let wethAmount = 0;
		if(wethBalance > 0){
			wethAmount = (await getAmountSwapOut([acceptedTokens[1], acceptedTokens[0], carbonToken], wethBalance))[2];
		}
		console.log("AMOUNT SWAP OUT", wethAmount, wethBalance);

		const usdcBalance = await getWalletBalance(acceptedTokens[0], burnPitAddress);
		let usdcAmount = 0;
		if(usdcBalance > 0){
			usdcAmount = (await getAmountSwapOut([acceptedTokens[0], carbonToken], usdcBalance))[1];
		}
		console.log("AMOUNT SWAP OUT", usdcAmount, usdcBalance);
		const amountsWithSlippage = [
										(web3.utils.toBN(usdcAmount).mul(web3.utils.toBN(95)).div(web3.utils.toBN(100))).toString(),
										(web3.utils.toBN(wethAmount).mul(web3.utils.toBN(95)).div(web3.utils.toBN(100))).toString(),
										(web3.utils.toBN(wmaticAmount).mul(web3.utils.toBN(95)).div(web3.utils.toBN(100))).toString()
									];
		const BurnPitInstance = new web3.eth.Contract(
			BurnPit.abi,
			burnPitAddress,
		);

		const gasPrice = (await web3.eth.getGasPrice()).toString();
		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1500000),
			gasPrice: web3.utils.toHex(gasPrice)
		};

		let result = await BurnPitInstance.methods.burnTokens(amountsWithSlippage, carbonToken).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash, err);
		});

		console.log("BURN call result", result);
	}

	export const getDirectFromPoolInfo = async(poolAddress, tokenMap, activeAccount, tokenAddress) => {
		const web3 = await getWeb3();
		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			poolAddress,
		);

		const aboutHash = await JCPoolInstance.methods.getAbout().call();
		const metaHash = await JCPoolInstance.methods.getMetaUri().call();
		const groupedPoolInfo = await JCPoolInstance.methods.getPoolInfo().call();
		let about = await getIpfsData(aboutHash);
		//let metaUri = await getIpfsData(metaHash);
		if(groupedPoolInfo[6] === "Jiggity's Pool"){
			console.log("about from contract", groupedPoolInfo);
		}

		//const acceptedTokens = groupedPoolInfo[0];

		if(groupedPoolInfo[6] === "Healthcare & Research Fund"){
			about = tempFixForDescriptions[0];
		}

		const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
		const groupedPoolTokenInfo = await JCPoolInstance.methods.getPoolTokenInfo(tokenAddress).call();

		const ercAddr = await JCPoolInstance.methods.getERC721Address().call();
		//const assets = await JCPoolInstance.getAcceptedTokens().call();
		const ERCInstance = new web3.eth.Contract(
			JCDepositorERC721.abi,
			ercAddr,
		);

		let tokenIds = await ERCInstance.methods.getUserTokens(activeAccount).call();

		let depositInfo;
		const totalDeposits = groupedPoolTokenInfo[5];;
		let userBalance = 0;
		const unclaimedInterest = groupedPoolTokenInfo[4];
		const claimedInterest = groupedPoolTokenInfo[3];
		for(let j = 0; j < tokenIds.length; j++){
			const tokenId = tokenIds[j].toString();
			if(tokenId !== "0"){
				depositInfo = await ERCInstance.methods.getDepositInfo(tokenId).call();
				if(depositInfo.asset === tokenAddress){
					userBalance =  depositInfo.balance;
				}
			}
		}
		return { about, totalDeposits, userBalance, unclaimedInterest, claimedInterest, tokenString, poolAddress, tokenAddress };
	}

	export const getDirectFromPoolInfoAllTokens = async(poolAddress, tokenMap, activeAccount) => {
		const web3 = await getWeb3();
		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			poolAddress,
		);

		const aboutHash = await JCPoolInstance.methods.getAbout().call();
		const metaHash = await JCPoolInstance.methods.getMetaUri().call();
		const groupedPoolInfo = await JCPoolInstance.methods.getPoolInfo().call();
		let about = await getIpfsData(aboutHash);
		//let metaUri = await getIpfsData(metaHash);
		if(groupedPoolInfo[6] === "Jiggity's Pool"){
			console.log("about from contract", groupedPoolInfo[6], about, metaHash);
		}

		//const acceptedTokens = groupedPoolInfo[0];

		if(groupedPoolInfo[6] === "Healthcare & Research Fund"){
			about = tempFixForDescriptions[0];
		}

		const acceptedTokens = groupedPoolInfo[0];
		let newTokenInfo = {};

		for(let i = 0; i < acceptedTokens.length; i++){
			const tokenAddress = acceptedTokens[i];
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
			const groupedPoolTokenInfo = await JCPoolInstance.methods.getPoolTokenInfo(tokenAddress).call();

			const ercAddr = await JCPoolInstance.methods.getERC721Address().call();
			//const assets = await JCPoolInstance.getAcceptedTokens().call();
			const ERCInstance = new web3.eth.Contract(
				JCDepositorERC721.abi,
				ercAddr,
			);

			let tokenIds = await ERCInstance.methods.getUserTokens(activeAccount).call();

			let depositInfo;
			const totalDeposits = groupedPoolTokenInfo[5];
			let userBalance = 0;
			const unclaimedInterest = groupedPoolTokenInfo[4];
			const claimedInterest = groupedPoolTokenInfo[3];
			for(let j = 0; j < tokenIds.length; j++){
				const tokenId = tokenIds[j].toString();
				if(tokenId !== "0"){
					depositInfo = await ERCInstance.methods.getDepositInfo(tokenId).call();
					if(depositInfo.asset === tokenAddress){
						userBalance =  depositInfo.balance;
					}
				}
			}
			newTokenInfo[tokenAddress] = { totalDeposits, userBalance, unclaimedInterest, claimedInterest, tokenString};
		}
		return { about, poolAddress, newTokenInfo };
	}

	export const getDirectAboutOnly = async(poolAddress) => {
		const web3 = await getWeb3();
		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			poolAddress,
		);

		const aboutHash = await JCPoolInstance.methods.getAbout().call();
		return await getIpfsData(aboutHash);
	}

	export const getPoolInfo = async(poolTracker, tokenMap, userBalancePools, knownPoolInfo) => {
		const web3 = await getWeb3();
		let knownAddrs = [];
		if(knownPoolInfo){
			for(const key in knownPoolInfo){
				knownAddrs.push(knownPoolInfo[key].address);
			}
		}

		let poolInfo = [];
		for(let i=0; i < poolTracker.length; i++){
			if(knownPoolInfo && knownAddrs.includes(poolTracker[i])){
				const key = Object.keys(knownPoolInfo).find(key => knownPoolInfo[key].address === poolTracker[i]);
				poolInfo.push(knownPoolInfo[key]);
			}
			else{
				let JCPoolInstance = new web3.eth.Contract(
					JCPool.abi,
					poolTracker[i],
				);

				const groupedPoolInfo = await JCPoolInstance.methods.getPoolInfo().call();

				let acceptedTokens = groupedPoolInfo[0];
				const receiver = groupedPoolInfo[1];
				const isVerified = groupedPoolInfo[2];
				let aboutHash = groupedPoolInfo[5];
				let about = await getIpfsData(aboutHash);
				const picHash =  groupedPoolInfo[4];
				const name = groupedPoolInfo[6];

				let acceptedTokenStrings = [];
				let acceptedTokenInfo = [];

				if(name === "Healthcare & Research Fund"){
					about = tempFixForDescriptions[0];
				}

				for(let j = 0; j < acceptedTokens.length; j++){
					const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === acceptedTokens[j]);
					let balances = userBalancePools[poolTracker[i]+acceptedTokens[j]];
					const balance = (balances) ? balances[0] : 0;
					const amountScaled = (balances) ? balances[1] : 0;
					const groupedPoolTokenInfo = await JCPoolInstance.methods.getPoolTokenInfo(acceptedTokens[j]).call();
					acceptedTokenInfo.push({
						'totalDeposits': groupedPoolTokenInfo[5],
						'userBalance':  balance,
						'amountScaled':  amountScaled,
						'unclaimedInterest': groupedPoolTokenInfo[4],
						'claimedInterest': groupedPoolTokenInfo[3],
						'reserveNormalizedIncome': groupedPoolTokenInfo[1],
						'aTokenAddress': groupedPoolTokenInfo[2],
						'liquidityIndex': groupedPoolTokenInfo[0],
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
								picHash: picHash,
								isVerified: isVerified,
								address: poolTracker[i],
								acceptedTokens: acceptedTokenStrings,
								acceptedTokenInfo: acceptedTokenInfo,
				});
			}
		}
		return poolInfo;
	}

	export const nameExists = async(poolName, poolTrackerAddress) => {
		const web3 = await getWeb3();
		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			poolTrackerAddress,
		);
		const result = await PoolTrackerInstance.methods.getAddressFromName(poolName).call();
		if(result !== '0x0000000000000000000000000000000000000000'){
			return "Pool Name already exists, please choose another";
		}
	}
	export const checkValidAddress = async(address) => {
		const web3 = await getWeb3();
		const result = web3.utils.isAddress(address);
		if(!result) return "The receiver address is not a valid address, please recheck"

	}
	export const checkInputError = async(input, poolTrackerAddress) => {
			const poolName = input.poolName;
			const receiver = input.receiver;
			const about = input.about;

			if(!poolName) return "Pool Name cannot be blank"
			if(poolName.length > 30) return "Pool Name cannot exceed 30 characters"
			if(!about) return "Describe section cannot be blank"
			if(!receiver) return "Receiver section cannot be blank"
			let error = await nameExists(poolName, poolTrackerAddress);
			if(error) return error;
			error = await checkValidAddress(receiver);
			if(error) return error;

			return "";
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
			if(found){
				const depositBalancePools = await getDepositorAddress(activeAccount, poolTrackerAddress);
				const userBalancePools = depositBalancePools.balances;
				const resultPool = await getPoolInfo([searchAddr], tokenMap, userBalancePools);
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
		//const ERCAddr = await PoolTrackerInstance.methods.getDepositorERC721Address().call();
		const depositList = await PoolTrackerInstance.methods.getContributions(activeAccount).call();

		for(let i = 0; i < depositList.length; i++){
			const JCPoolInstance = new web3.eth.Contract(
				JCPool.abi,
				depositList[i],
			);

			const ercAddr = await JCPoolInstance.methods.getERC721Address().call();
			//const assets = await JCPoolInstance.getAcceptedTokens().call();
			const ERCInstance = new web3.eth.Contract(
				JCDepositorERC721.abi,
				ercAddr,
			);

			let tokenIds = await ERCInstance.methods.getUserTokens(activeAccount).call();
			for(let j = 0; j < tokenIds.length; j++){
				const tokenId = tokenIds[j].toString();
				if(tokenId !== "0"){
					const depositInfo = await ERCInstance.methods.getDepositInfo(tokenId).call();

					userDepositPools.push(depositList[i]);
					userBalancePools[depositList[i]+depositInfo.asset] = [depositInfo.balance, depositInfo.amountScaled, depositInfo.timeStamp, depositList[i], depositInfo.asset];
				}
			}
		}

		/*let balance = await ERCInstance.methods.balanceOf(activeAccount).call();

		for(let i = 0; i < balance; i++){
			const tokenId = await ERCInstance.methods.tokenOfOwnerByIndex(activeAccount, i).call();
			const depositInfo = await ERCInstance.methods.getDepositInfo(tokenId).call();
				userDepositPools.push(depositInfo.pool);
				userBalancePools[depositInfo.pool+depositInfo.asset] = [depositInfo.balance, depositInfo.amountScaled, depositInfo.timeStamp, depositInfo.pool, depositInfo.asset];
		}*/

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
