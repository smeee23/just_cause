import React, {Component} from "react"
import { Fragment } from "react";

import Card from '../components/Card'
import Button from '../components/Button'

import getWeb3 from "../../getWeb3";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";
import { getPoolInfo } from '../func/functions.js';

class Dashboard extends Component {
	state = {
		daiAddress: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
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

		console.log(this.networkId);

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
		let poolTracker = this.state.poolTracker;
		let poolInfo = this.state.poolInfo;
		this.setState({poolInfo, poolTracker});
		}
		catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to load web3, accounts, or contract. Check console for details.`,
			);
			console.error(error);
		}
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
			let unclaimedInterest = await JCPoolInstance.methods.getUnclaimedInterest(this.state.daiAddress).call();
			let receiver = await JCPoolInstance.methods.getRecipient().call();
			let claimedInterest = await JCPoolInstance.methods.getClaimedInterest(this.state.daiAddress).call();

			console.log("pool address:", JCPoolInstance.options.address)
			console.log("accepted tokens:", acceptedTokens);
			let totalDeposits = [];
			let activeUserBalance = [];
			for(let j = 0; j < acceptedTokens.length; j++){
				totalDeposits.push(await JCPoolInstance.methods.getTotalDeposits(acceptedTokens[j]).call());
				activeUserBalance.push(await JCPoolInstance.methods.getUserBalance(activeAccount, acceptedTokens[j]).call());
				console.log("total deposits for", acceptedTokens[j], " :", totalDeposits);
				console.log(activeAccount, "balance:", activeUserBalance);
			}

			poolInfo.push({
							receiver: receiver,
							unclaimedInterest: unclaimedInterest,
							claimedInterest: claimedInterest,
							name: name,
							address: poolTracker[i],
							acceptedTokens: acceptedTokens,
							totalDeposits: totalDeposits,
							activeUserBalance: activeUserBalance,
							});
		}
		console.log("pool info", poolInfo);
		console.log("pool tracker", poolTracker);
		this.setState({poolTracker: poolTracker, poolInfo: poolInfo});
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

	deposit = async(address) => {
		console.log('deposit clicked');
		const amount = prompt("enter amount to deposit");
		const amountInGwei = this.web3.utils.toWei(amount, 'ether');
		const erc20Instance = await new this.web3.eth.Contract(ERC20Instance.abi,this.state.daiAddress);
		const activeAccount = this.web3.currentProvider.selectedAddress;
		console.log("amountInGwei", amountInGwei, typeof amountInGwei);
		const allowance = await this.getAllowance(erc20Instance, address, activeAccount)
		if(parseInt(amountInGwei) > parseInt(allowance)){
			alert("must approve token to deposit");
			console.log("approve test", parseInt(amountInGwei), parseInt(allowance), (parseInt(amountInGwei) > parseInt(this.getAllowance(erc20Instance, address, activeAccount))))
			this.approve(erc20Instance, address, activeAccount, amountInGwei);
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
		let result = await JCPoolInstance.methods.deposit(this.state.daiAddress, amountInGwei).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('deposit result ' + result);
	}

	withdrawDeposit = async(address) => {
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

	claim = async(address) => {
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
		let result = await JCPoolInstance.methods.withdrawDonations(this.state.daiAddress).send(parameter , (err, transactionHash) => {
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
						{listItems}
					</section>
				</article>
			</Fragment>
		);
	}
}

export default Dashboard
