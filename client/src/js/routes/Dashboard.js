import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import Button from '../components/Button'

import getWeb3 from "../../getWeb3";
import JCPool from "../../contracts/JustCausePool.json";
import ERC20Instance from "../../contracts/IERC20.json";

class Dashboard extends Component {

	componentDidMount = async () => {
		try{
		window.scrollTo(0,0);
		// Get network provider and web3 instance.
		//web3 = await getWeb3();
		//console.log('************web3', web3, getWeb3());
		// Use web3 to get the user's accounts.
		//this.accounts = await web3.eth.getAccounts();
		//console.log(this.accounts);

		//this.networkId = await web3.eth.net.getId();

		//console.log("network ID", typeof this.networkId);
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

	deploy = async() => {
		const web3 = await getWeb3();
		const activeAccount = web3.currentProvider.selectedAddress;
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
			gas: web3.utils.toHex(3000000),
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

		this.setPoolTracker();
	}

	approve = async(erc20Instance, address, activeAccount, amountInGwei) => {
		const web3 = await getWeb3();
		console.log('approve clicked');
		const parameter = {
			from: activeAccount ,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
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
		const web3 = await getWeb3();
		const activeAccount = web3.currentProvider.selectedAddress;
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		const balance = await erc20Instance.methods.balanceOf(activeAccount).call();
		return balance;
	}

	getAmountBase = (amount, decimals) => {
		console.log('amount in base', amount*10**decimals);
		return (amount*10**decimals).toString();
	}
	
	deposit = async(address, tokenAddress) => {
		console.log('deposit clicked');
		const web3 = await getWeb3();
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		console.log('token map', this.props.tokenMap);
		const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === tokenAddress);
		console.log('tokenString:', tokenString, this.props.tokenMap[tokenString].decimals);
		const amount = prompt("enter amount to deposit");
		const amountInBase = this.getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
		const activeAccount = web3.currentProvider.selectedAddress;
		console.log("amountInGwei", amountInBase);
		console.log(this.getAmountBase(amount, this.props.tokenMap[tokenString].decimals));
		const allowance = await this.getAllowance(erc20Instance, address, activeAccount)
		if(parseInt(amountInBase) > parseInt(allowance)){
			alert("must approve token to deposit");
			console.log("approve test", parseInt(amountInBase), parseInt(allowance), (parseInt(amountInBase) > parseInt(this.getAllowance(erc20Instance, address, activeAccount))))
			await this.approve(erc20Instance, address, activeAccount, amountInBase);
		}
		else{
			console.log("else");
		}
		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};

		let JCPoolInstance = new web3.eth.Contract(
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
		const web3 = await getWeb3();
		const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === tokenAddress);
		const amount = prompt("enter amount to withdraw");
		const donateAmount = prompt("enter amount to donate if desired");
		const amountInBase = this.getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
		const activeAccount = web3.currentProvider.selectedAddress;
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

		console.log(JCPoolInstance.options.address, address);
		let result = await JCPoolInstance.methods.withdraw(tokenAddress, amountInBase, donateAmountInGwei).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('withdraw result ' + result[0]);
	}

	claim = async(address, assetAddress) => {
		console.log('claim interest clicked', address);
		const web3 = await getWeb3();
		const activeAccount = web3.currentProvider.selectedAddress;
		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			address,
		);
		let result = await JCPoolInstance.methods.withdrawDonations(assetAddress).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});

		console.log('claim result', result);
	}

	createCardInfo = () => {
		if(this.props.verifiedPoolInfo === "No Verified Pools") return
		let cardHolder = [];
		for(let i = 0; i < this.props.verifiedPoolInfo.length; i++){
			console.log('a', (this.props.verifiedPoolInfo[i].name));
			const item = this.props.verifiedPoolInfo[i];
			cardHolder.push(
				<Card
					key={item.address}
					title={item.name}
					idx={i}
					receiver={item.receiver}
					address={item.address}
					acceptedTokenInfo={item.acceptedTokenInfo}
					onApprove = {this.approve}
					onDeposit = {this.deposit}
					onWithdrawDeposit = {this.withdrawDeposit}
					onClaim = {this.claim}
				/>
			);
		}
		return cardHolder;
	}

	render() {

		console.log("*********verifiedPoolInfo:", this.props.verifiedPoolInfo);
		const cardHolder = this.createCardInfo();
		return (
			<Fragment>
				<article>
				<section className="page-section page-section--center horizontal-padding bw0">
                        <Button text="Deploy" icon="wallet" callback={this.deploy}/>
				</section>
					<section className="page-section page-section--center horizontal-padding bw0">
						{cardHolder}
					</section>
				</article>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ({
	daiAddress: state.daiAddress,
	activeAccount: state.activeAccount,
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
