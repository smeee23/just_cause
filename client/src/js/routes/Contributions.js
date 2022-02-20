import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import { Modal } from "../components/Modal";
import PendingTxModal from "../components/modals/PendingTxModal";
import TxResultModal from "../components/modals/TxResultModal";
import DeployTxModal from "../components/modals/DeployTxModal";

class Contributions extends Component {

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

	getTxResultModal = () => {
		if(this.props.txResult){
			let modal = <Modal isOpen={true}><TxResultModal txDetails={this.props.txResult}/></Modal>;
			return modal;
		}
	}
	getPendingTxModal = () => {
		if(this.props.pendingTx){
			let modal = <Modal isOpen={true}><PendingTxModal txDetails={this.props.pendingTx}/></Modal>;
			return modal;
		}
	}
	getDeployTxModal = () => {
		if(this.props.deployTxResult){
			let modal = <Modal isOpen={true}><DeployTxModal txDetails={this.props.deployTxResult}/></Modal>;
			return modal;
		}
	}

	createCardInfo = () => {
		if(this.props.userDepositPoolInfo === "No Verified Pools") return
		let cardHolder = [];
		for(let i = 0; i < this.props.userDepositPoolInfo.length; i++){
			console.log('a', (this.props.userDepositPoolInfo[i].name));
			const item = this.props.userDepositPoolInfo[i];
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
					<section className="page-section horizontal-padding bw0">
						{this.getPendingTxModal()}
						{this.getTxResultModal()}
						{this.getDeployTxModal()}
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
	userDepositPoolAddrs: state.userDepositPoolAddrs,
	userDepositPoolInfo: state.userDepositPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	txResult: state.txResult,
	deployTxResult: state.deployTxResult,
})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(Contributions)