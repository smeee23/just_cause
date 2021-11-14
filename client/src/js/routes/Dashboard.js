import React, {Component} from "react"
import { Fragment } from "react";

import Card from '../components/Card'
//git stash import Button from '../components/Button'

import getWeb3 from "../../getWeb3";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";
//import { getPoolInfo } from '../func/functions.js';

class Dashboard extends Component {
	state = {
		tokenMap: {},
		poolTracker: [],
		poolInfo: [],
	};
	componentDidMount = async () => {
		try{
		window.scrollTo(0,0);
		// Get network provider and web3 instance.
		this.web3 = await getWeb3();

		// Use web3 to get the user's accounts.
		this.accounts = await this.web3.eth.getAccounts();
		console.log(this.accounts);

		this.networkId = await this.web3.eth.net.getId();

		console.log("network ID", typeof this.networkId);

		if(this.networkId === 42){
			this.setState({tokenMap: kovanTokenMap});
			console.log("tokenMap", Object.keys(kovanTokenMap));
		}

		this.PoolTrackerInstance = new this.web3.eth.Contract(
			PoolTracker.abi,
			PoolTracker.networks[this.networkId] && PoolTracker.networks[this.networkId].address,
		);

		this.poolTrackerAddress = PoolTracker.networks[this.networkId].address;
		console.log("Pool Tracker Address:", this.poolTrackerAddress);

		/*const loadedContractName = localStorage.getItem('contractName')
		if(loadedContractName){
			this.setState({contractName: loadedContractName});
		}*/
		this.setPoolTracker();
		//let poolTracker = this.state.poolTracker;
		//let poolInfo = this.state.poolInfo;
		//this.setState({poolInfo, poolTracker});
		console.log("component did mount", this.state.poolInfo);
		}
		catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to load web3, accounts, or contract. Check console for details.`,
			);
			console.error(error);
		}
	}

	componentDidUpdate = () => {
		console.log('component did update');
	}
	setPoolTracker = async() => {
		const activeAccount = this.web3.currentProvider.selectedAddress;
		let poolTracker = await this.PoolTrackerInstance.methods.getVerifiedPools().call();

		//let poolInfo = getPoolInfo(poolTracker, activeAccount, this.web3);
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
				const tokenString = Object.keys(this.state.tokenMap).find(key => this.state.tokenMap[key].address === acceptedTokens[j]);
				acceptedTokenInfo.push({
					'totalDeposits': await JCPoolInstance.methods.getTotalDeposits(acceptedTokens[j]).call(),
					'userBalance': await JCPoolInstance.methods.getUserBalance(activeAccount, acceptedTokens[j]).call(),
					'unclaimedInterest': await JCPoolInstance.methods.getUnclaimedInterest(acceptedTokens[j]).call(),
					'claimedInterest': await JCPoolInstance.methods.getClaimedInterest(acceptedTokens[j]).call(),
					'aTokenAddress': await JCPoolInstance.methods.getATokenAddress(acceptedTokens[j]).call(),
					'acceptedTokenString': tokenString,
					'decimals': this.state.tokenMap[tokenString].decimals,
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
		this.setState({poolTracker: poolTracker, poolInfo: poolInfo});
	}

	deploy = async() => {
		const activeAccount = this.web3.currentProvider.selectedAddress;
		const poolName = prompt("Enter pool name:");
		let acceptedTokens = prompt("Enter accepted tokens for pool (e.g. DAI USDC...)");
		acceptedTokens = acceptedTokens.split(" ");
		console.log("acceptedTokens", acceptedTokens, this.state.tokenMap);
		let tokenAddrs = [];
		for(let i = 0; i < acceptedTokens.length; i++){
			tokenAddrs.push(this.state.tokenMap[acceptedTokens[i]].address);
		}
		console.log(tokenAddrs);
		const receiver = prompt("Enter the address to recieve the interest");
		console.log("receiver", receiver, typeof receiver);
		const payload = {data: JCPool.bytecode,
						arguments: [
							tokenAddrs,
							poolName,
							this.poolTrackerAddress,
							receiver
						]
		};
		const parameter = {
			from: activeAccount,
			gas: this.web3.utils.toHex(3000000),
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('30', 'gwei'))
		};

		console.log(payload.arguments)
		let JCPoolInstance = await new this.web3.eth.Contract(JCPool.abi).deploy(payload).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			});
			/*.on('confirmation', () => {}).then((newContractInstance) => {
			console.log('Deployed Contract Address : ', newContractInstance.options.address);
			this.setState({contractAddress: newContractInstance.options.address});
			});*/


		/*console.log("deployed", JCPoolInstance.options.address);*/
		//console.log("events", JCPoolInstance);

		this.setPoolTracker();
	}

	approve = async(erc20Instance, address, activeAccount, amountInGwei) => {
		console.log('approve clicked');
		const parameter = {
			from: activeAccount ,
			gas: this.web3.utils.toHex(1000000),
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('30', 'gwei'))
			};

		let results_1 = await erc20Instance.methods.approve(address, amountInGwei).send(parameter, (err, transactionHash) => {
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
		const activeAccount = this.web3.currentProvider.selectedAddress;
		const erc20Instance = await new this.web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		const balance = await erc20Instance.methods.balanceOf(activeAccount).call();
		return balance;
	}

	getAmountBase = (amount, decimals) => {
		return (amount*10**decimals).toString();
	}
	deposit = async(address, tokenAddress) => {
		console.log('deposit clicked');
		const erc20Instance = await new this.web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		const tokenString = Object.keys(this.state.tokenMap).find(key => this.state.tokenMap[key].address === tokenAddress);
		console.log('tokenString:', tokenString, this.state.tokenMap[tokenString].decimals);
		const amount = prompt("enter amount to deposit");
		const amountInBase = this.web3.utils.toWei(amount, 'ether');//this.getAmountBase(amount, this.state.tokenMap[tokenString].decimals);
		const activeAccount = this.web3.currentProvider.selectedAddress;
		console.log("amountInGwei", amountInBase, typeof amountInBase);
		const allowance = await this.getAllowance(erc20Instance, address, activeAccount)
		if(parseInt(amountInBase) > parseInt(allowance)){
			alert("must approve token to deposit");
			console.log("approve test", parseInt(amountInBase), parseInt(allowance), (parseInt(amountInBase) > parseInt(this.getAllowance(erc20Instance, address, activeAccount))))
			this.approve(erc20Instance, address, activeAccount, amountInBase);
		}
		else{
			console.log("else");
		}
		const parameter = {
			from: activeAccount,
			gas: this.web3.utils.toHex(1000000),
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('30', 'gwei'))
		};

		let JCPoolInstance = new this.web3.eth.Contract(
			JCPool.abi,
			address,
		);

		console.log(JCPoolInstance.options.address);
		let result = await JCPoolInstance.methods.deposit(tokenAddress, amountInBase).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('deposit result ' + result);
	}

	withdrawDeposit = async(address, tokenAddress) => {
		console.log('withdraw deposit clicked');
		const amount = prompt("enter amount to withdraw");
		const donateAmount = prompt("enter amount to donate if desired");
		const amountInGwei = this.web3.utils.toWei(amount, 'ether');
		const activeAccount = this.web3.currentProvider.selectedAddress;
		const donateAmountInGwei = this.web3.utils.toWei(donateAmount, 'ether');

		const parameter = {
			from: activeAccount,
			gas: this.web3.utils.toHex(1000000),
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('30', 'gwei'))
		};

		let JCPoolInstance = new this.web3.eth.Contract(
			JCPool.abi,
			address,
		);

		console.log(JCPoolInstance.options.address, address);
		let result = await JCPoolInstance.methods.withdraw(this.state.daiAddress, amountInGwei, donateAmountInGwei).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('withdraw result ' + result[0]);
	}

	claim = async(address, assetAddress) => {
		console.log('claim interest clicked', address);
		const activeAccount = this.web3.currentProvider.selectedAddress;
		const parameter = {
			from: activeAccount,
			gas: this.web3.utils.toHex(1000000),
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('30', 'gwei'))
		};

		let JCPoolInstance = new this.web3.eth.Contract(
			JCPool.abi,
			address,
		);
		let result = await JCPoolInstance.methods.withdrawDonations(assetAddress).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});

		console.log('claim result', result);
	}

	stringifyPoolTracker = () => {
		let poolTrackerString = ""
		for(let i = 0; i < this.state.poolTracker.length; i++){
			poolTrackerString = poolTrackerString + '\n' + this.state.poolTracker[i];
		}
		console.log("pool tracker string", poolTrackerString);
		this.setState({poolTrackerString: poolTrackerString});
	}

	render() {
		const listItems = this.state.poolInfo.map((pt, i) =>
			<Card
				key={pt.address}
				title={pt.name}
				idx={i}
				unclaimedInterest={pt.unclaimedInterest}
				claimedInterest={pt.claimedInterest}
				receiver={pt.receiver}
				totalDeposits={pt.totalDeposits}
				address={pt.address}
				userBalance={pt.activeUserBalance}
				onApprove = {this.approve}
				onDeposit = {this.deposit}
				onWithdrawDeposit = {this.withdrawDeposit}
				onClaim = {this.claim}
			/>
		);

		return (
			<Fragment>
				<article>
				<section className="page-section page-section--center horizontal-padding bw0">
                        <Button text="Deploy" icon="wallet" callback={this.deploy}/>
				</section>
					<section className="page-section page-section--center horizontal-padding bw0">
						{listItems}
					</section>
				</article>
			</Fragment>
		);
	}
}

export default Dashboard
