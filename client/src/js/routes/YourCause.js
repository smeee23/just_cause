import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import Button from '../components/Button'

import {deploy} from '../func/contractInteractions';

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
					<Button icon="plus" text="Add Pool" lg callback={async() => await deploy(this.props.tokenMap,
																							 this.props.poolTrackerAddress)}/>
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