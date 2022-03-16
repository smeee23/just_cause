import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card';
import { Modal } from "../components/Modal";
import PendingTxModal from "../components/modals/PendingTxModal";
import TxResultModal from "../components/modals/TxResultModal";
import DeployTxModal from "../components/modals/DeployTxModal";

import { updateVerifiedPoolInfo } from "../actions/verifiedPoolInfo"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"

import { updatePoolInfo } from '../func/contractInteractions';

class Dashboard extends Component {

	componentDidMount = async () => {
		try{
			window.scrollTo(0,0);
		}
		catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				error,
			);
			console.error(error);
		}
	}

	componentDidUpdate = () => {
		console.log('component did update');
	}

	getTxResultModal = () => {
		if(this.props.txResult){
			let modal = <Modal isOpen={true}>
				<TxResultModal txDetails={this.props.txResult}/>
				</Modal>;

			//const poolLists = [this.props.verifiedPoolInfo, this.props.ownerPoolInfo, this.props.userDepositPoolInfo];
			if(this.props.txResult.success){
				let poolLists = updatePoolInfo(this.props.txResult.poolAddress,
												this.props.activeAccount,
												this.props.poolTrackerAddress,
												this.props.tokenMap,
												[this.props.verifiedPoolInfo,this.props.ownerPoolInfo, this.props.userDepositPoolInfo]);

				if(poolLists[0]) this.props.updateVerifiedPoolInfo(poolLists[0]);
				if(poolLists[1]) this.props.updateOwnerPoolInfo(poolLists[1]);
				if(poolLists[2]) this.props.updateUserDepositPoolInfo(poolLists[2]);
			}
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

		console.log("*********verifiedPoolInfo:", this.props.verifiedPoolInfo);
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
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolInfo: state.ownerPoolInfo,
	userDepositPoolInfo: state.userDepositPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	txResult: state.txResult,
	deployTxResult: state.deployTxResult,
	depositAmount: state.depositAmount,
})

const mapDispatchToProps = dispatch => ({
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
