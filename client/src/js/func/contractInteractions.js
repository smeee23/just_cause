import getWeb3 from "../../getWeb3NotOnLoad";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";

	const approve = async(erc20Instance, address, activeAccount, amountInGwei) => {
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

	export const deposit = async(address, tokenAddress, isETH, tokenMap) => {
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
		if(!isETH){
			const allowance = await getAllowance(erc20Instance, address, activeAccount)
			if(parseInt(amountInBase) > parseInt(allowance)){
				alert("must approve token to deposit");
				console.log("approve test", parseInt(amountInBase), parseInt(allowance), (parseInt(amountInBase) > parseInt(getAllowance(erc20Instance, address, activeAccount))))
				await approve(erc20Instance, address, activeAccount, amountInBase);
			}
		}
		else{
			console.log("else");
		}
		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};
		const parameterETH = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
			value: amountInBase
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			address,
		);

		console.log(JCPoolInstance.options.address);
		if(!isETH){
			await JCPoolInstance.methods.deposit(tokenAddress, amountInBase).send(parameter, (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
			});
		}
		else{
			await JCPoolInstance.methods.depositETH(tokenAddress).send(parameterETH, (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
			});
		}
		console.log('deposit');
	}

	export const withdrawDeposit = async(address, tokenAddress, tokenMap) => {
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

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			address,
		);

		console.log('amount to withdraw', amountInBase, amount);
		console.log(JCPoolInstance.options.address, address);
		let result = await JCPoolInstance.methods.withdraw(tokenAddress, amountInBase, donateAmountInGwei).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
	}