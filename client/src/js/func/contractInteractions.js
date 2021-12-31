import getWeb3 from "../../getWeb3";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";

deploy = async() => {
		const web3 = await getWeb3();
		const activeAccount = this.props.activeAccount;//await web3.currentProvider.selectedAddress;
		const poolName = prompt("Enter pool name:");
		let acceptedTokens = prompt("Enter accepted tokens for pool (e.g. DAI USDC...)");
		const about = prompt("Type a short summary of your cause");
		acceptedTokens = acceptedTokens.split(" ");
		console.log("acceptedTokens", acceptedTokens, this.props.tokenMap);
		let tokenAddrs = [];
		for(let i = 0; i < acceptedTokens.length; i++){
			tokenAddrs.push(this.props.tokenMap[acceptedTokens[i]].address);
		}
		console.log('poolTrackerAddress', this.props.poolTrackerAddress);
		const receiver = prompt("Enter the address to recieve the interest");
		console.log("receiver", receiver, typeof receiver);
		console.log("token addresses", tokenAddrs);
		const payload = {data: JCPool.bytecode,
						arguments: [
							tokenAddrs,
							poolName,
							about,
							this.props.poolTrackerAddress,
							receiver
						]
		};
		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(3200000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};

		console.log(payload.arguments)
		await new web3.eth.Contract(JCPool.abi).deploy(payload).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			});
			/*.on('confirmation', () => {}).then((newContractInstance) => {
			console.log('Deployed Contract Address : ', newContractInstance.options.address);
			this.setState({contractAddress: newContractInstance.options.address});
			});*/


		/*console.log("deployed", JCPoolInstance.options.address);*/
		//console.log("events", JCPoolInstance);

		//this.setPoolTracker();

		//this.setPoolState(activeAccount);
	}

	approve = async(erc20Instance, address, activeAccount, amountInGwei) => {
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

	getAllowance = async(erc20Instance, address, activeAccount) => {
		const allowance = await erc20Instance.methods.allowance(activeAccount, address).call();
		console.log("allowance", allowance, typeof allowance);
		return allowance;
	}

	getWalletBalance = async(tokenAddress) => {
		const web3 = await getWeb3();
		const activeAccount = await web3.currentProvider.selectedAddress;
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		const balance = await erc20Instance.methods.balanceOf(activeAccount).call();
		return balance;
	}

	getAmountBase = (amount, decimals) => {
		console.log('amount in base', amount*10**decimals);
		return (amount*10**decimals).toString();
	}

	deposit = async(address, tokenAddress, isETH) => {
		console.log('deposit clicked');
		const web3 = await getWeb3();
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		console.log('token map', this.props.tokenMap);
		const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === tokenAddress);
		console.log('tokenString:', tokenString, this.props.tokenMap[tokenString].decimals);
		const amount = prompt("enter amount to deposit");
		const amountInBase = this.getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
		const activeAccount = await web3.currentProvider.selectedAddress;
		console.log("amountInGwei", amountInBase);
		console.log(this.getAmountBase(amount, this.props.tokenMap[tokenString].decimals));
		if(!isETH){
			const allowance = await this.getAllowance(erc20Instance, address, activeAccount)
			if(parseInt(amountInBase) > parseInt(allowance)){
				alert("must approve token to deposit");
				console.log("approve test", parseInt(amountInBase), parseInt(allowance), (parseInt(amountInBase) > parseInt(this.getAllowance(erc20Instance, address, activeAccount))))
				await this.approve(erc20Instance, address, activeAccount, amountInBase);
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

	withdrawDeposit = async(address, tokenAddress, isETH) => {
		console.log('withdraw deposit clicked');
		const web3 = await getWeb3();
		const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === tokenAddress);
		const amount = prompt("enter amount to withdraw");
		const donateAmount = prompt("enter amount to donate if desired");
		const amountInBase = this.getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
		const activeAccount = await web3.currentProvider.selectedAddress;
		const donateAmountInGwei = this.getAmountBase(donateAmount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(donateAmount, 'ether');

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
		let result = await JCPoolInstance.methods.withdraw(tokenAddress, amountInBase, donateAmountInGwei, isETH).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('withdraw result ' + result[0]);
	}

	claim = async(address, assetAddress, isETH) => {
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
		let result = await JCPoolInstance.methods.withdrawDonations(assetAddress, isETH).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});

		console.log('claim result', result);
	}

    export default {deploy, deposit, claim, withdrawDonations};