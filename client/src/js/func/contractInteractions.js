import getWeb3 from "../../getWeb3NotOnLoad";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";

	const approve = async(erc20Instance, address, activeAccount, amountInGwei, decimals) => {
		const web3 = await getWeb3();
		console.log('approve clicked');
		const parameter = {
			from: activeAccount ,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
			};
		console.log(typeof amountInGwei);

		const amount = '10000000000000000000000000000000';

		let results_1 = await erc20Instance.methods.approve(address, amount).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			});
		console.log("approve", results_1);
	}

	const getAllowance = async(erc20Instance, address, activeAccount) => {
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

	const getAmountBase = (amount, decimals) => {
		console.log('amount in base', amount*10**decimals);
		return (amount*10**decimals).toString();
	}

	export const deposit = async(poolAddress, tokenAddress, isETH, tokenMap, poolTrackerAddress) => {
		console.log('deposit clicked');
		const web3 = await getWeb3();
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		console.log('token map', tokenMap);
		const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
		console.log('tokenString:', tokenString, tokenMap[tokenString].decimals);
		const amount = prompt("enter amount to deposit");
		const amountInBase = getAmountBase(amount, tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
		const activeAccount = await web3.currentProvider.selectedAddress;
		console.log("amountInGwei", amountInBase);
		console.log(getAmountBase(amount, tokenMap[tokenString].decimals));
		let parameter = {};
		if(!isETH){
			const allowance = await getAllowance(erc20Instance, poolAddress, activeAccount)
			if(parseInt(amountInBase) > parseInt(allowance)){
				alert("must approve token to deposit");
				await approve(erc20Instance, poolAddress, activeAccount, amountInBase, tokenMap[tokenString].decimals);
			}
			parameter = {
				from: activeAccount,
				gas: web3.utils.toHex(1000000),
				gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
			};
		}

		else {
			parameter = {
				from: activeAccount,
				gas: web3.utils.toHex(1000000),
				gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
				value: amountInBase
			};
		}

		let PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			poolTrackerAddress,
		);

		console.log('poolTracker', poolTrackerAddress);
		console.log(PoolTrackerInstance.options.address);

		await PoolTrackerInstance.methods.addDeposit(amountInBase, tokenAddress, poolAddress, isETH).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('deposit');
	}

	export const withdrawDeposit = async(poolAddress, tokenAddress, tokenMap, poolTrackerAddress) => {
		console.log('withdraw deposit clicked');
		const web3 = await getWeb3();
		const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
		const amount = prompt("enter amount to withdraw");
		const donateAmount = prompt("enter amount to donate if desired");
		const amountInBase = getAmountBase(amount, tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
		const activeAccount = await web3.currentProvider.selectedAddress;
		const donateAmountInGwei = getAmountBase(donateAmount, tokenMap[tokenString].decimals);//web3.utils.toWei(donateAmount, 'ether');

		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};

		let PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			poolTrackerAddress,
		);

		console.log('amount to withdraw', amountInBase, amount);
		let result = await PoolTrackerInstance.methods.withdrawDeposit(amountInBase, donateAmountInGwei, tokenAddress, poolAddress).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('withdrawDeposit result', result)
	}

	export const claim = async(address, assetAddress, poolTrackerAddress) => {
		console.log('claim interest clicked', address);
		const web3 = await getWeb3();
		const activeAccount = await web3.currentProvider.selectedAddress;
		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			address,
		);
		let result = await JCPoolInstance.methods.withdrawDonations(assetAddress, false).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});

		console.log('claim result', result);
	}

	export const deploy = async(tokenMap, poolTrackerAddress) => {
		const web3 = await getWeb3();
		const activeAccount = await web3.currentProvider.selectedAddress;
		const poolName = prompt("Enter pool name:");
		let acceptedTokens = prompt("Enter accepted tokens for pool (e.g. DAI USDC...)");
		const about = prompt("Type a short summary of your cause");
		acceptedTokens = acceptedTokens.split(" ");
		console.log("acceptedTokens", acceptedTokens, tokenMap);
		let tokenAddrs = [];
		for(let i = 0; i < acceptedTokens.length; i++){
			tokenAddrs.push(tokenMap[acceptedTokens[i]].address);
		}
		console.log('poolTrackerAddress', poolTrackerAddress);
		const receiver = prompt("Enter the address to recieve the interest");
		console.log("receiver", receiver, typeof receiver);
		console.log("token addresses", tokenAddrs);
		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(3200000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};

		let PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			poolTrackerAddress,
		);

		await PoolTrackerInstance.methods.createJCPoolClone(tokenAddrs, poolName, about, receiver).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
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

	export const getPoolInfo = async(poolTracker, tokenMap, activeAccount, userBalancePools) => {
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

			console.log('hashByteCode', hashByteCode);
			console.log("pool address:", JCPoolInstance.options.address);
			console.log("accepted tokens:", acceptedTokens);
			let acceptedTokenStrings = [];
			let acceptedTokenInfo = [];

			for(let j = 0; j < acceptedTokens.length; j++){
				const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === acceptedTokens[j]);
				let balance = userBalancePools[poolTracker[i]+acceptedTokens[j]];
				balance = (balance) ? balance : 0;
				console.log("tokenString", tokenString, acceptedTokens[j]);
				acceptedTokenInfo.push({
					'totalDeposits': await JCPoolInstance.methods.getTotalDeposits(acceptedTokens[j]).call(),
					'userBalance':  balance,
					'unclaimedInterest': await JCPoolInstance.methods.getUnclaimedInterest(acceptedTokens[j]).call(),
					'claimedInterest': await JCPoolInstance.methods.getClaimedInterest(acceptedTokens[j]).call(),
					'aTokenAddress': await JCPoolInstance.methods.getATokenAddress(acceptedTokens[j]).call(),
					'acceptedTokenString': tokenString,
					'decimals': tokenMap[tokenString].decimals,
					'depositAPY': tokenMap[tokenString].depositAPY,
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

