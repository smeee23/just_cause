import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import Button from '../components/Button'

import getWeb3 from "../../getWeb3NotOnLoad.js";
import JCPool from "../../contracts/JustCausePool.json";

class YourCause extends Component {

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

	createCardInfo = () => {
		if(this.props.ownerPoolInfo === "No Verified Pools") return
		let cardHolder = [];
		for(let i = 0; i < this.props.ownerPoolInfo.length; i++){
			console.log('a', (this.props.ownerPoolInfo[i].name));
			const item = this.props.ownerPoolInfo[i];
			cardHolder.push(
				<Card
					key={item.address}
					title={item.name}
					idx={i}
					receiver={item.receiver}
					address={item.address}
					acceptedTokenInfo={item.acceptedTokenInfo}
					about={item.about}
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
		const cardHolder = this.createCardInfo();
		return (
			<Fragment>
				<article>
				<section className="page-section page-section--center horizontal-padding bw0">
					<Button icon="plus" text="Add Pool" lg callback={this.deploy}/>
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
	ownerPoolAddrs: state.ownerPoolAddrs,
	ownerPoolInfo: state.ownerPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(YourCause)