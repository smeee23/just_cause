import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card';
import { Modal } from "../components/Modal";
import Button from '../components/Button';
import PendingTxModal from "../components/modals/PendingTxModal";
import TxResultModal from "../components/modals/TxResultModal";
import DeployTxModal from "../components/modals/DeployTxModal";
import NewPoolModal from "../components/modals/NewPoolModal";

import { updateVerifiedPoolInfo } from "../actions/verifiedPoolInfo"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"
import { updateDeployTxResult } from  "../actions/deployTxResult";
import {updateDeployInfo} from "../actions/deployInfo";
import { updateDepositAmount } from  "../actions/depositAmount";
import { updateWithdrawAmount } from  "../actions/withdrawAmount";

import { updatePoolInfo, addDeployedPool } from '../func/contractInteractions';

class Dashboard extends Component {

	constructor(props) {
		super(props);

		this.state = {
			selectedTokenIndex: 0,
		}
	}
	componentDidMount = async () => {
		try{
			window.scrollTo(0,0);
			if(this.props.deployInfo) this.props.updateDeployInfo('');

			if(this.props.depositAmount) this.props.updateDepositAmount('');

			if(this.props.withdrawAmount) this.props.updateWithdrawAmount('');
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

			if(this.props.deployTxResult.status === 'success'){
				console.log('deployTxResult', this.props.deployTxResult);
				let poolLists = addDeployedPool(this.props.deployTxResult.poolAddress,
												this.props.activeAccount,
												this.props.poolTrackerAddress,
												this.props.tokenMap,
												[this.props.verifiedPoolInfo,this.props.ownerPoolInfo]);
				if(poolLists[0]) this.props.updateVerifiedPoolInfo(poolLists[0]);
				if(poolLists[1]) this.props.updateOwnerPoolInfo(poolLists[1]);
				console.log('(poolLists 3', poolLists);
			}

			return modal;
		}
	}
	getNewPoolModal = () => {
		console.log('deployInfo outer', this.props.deployInfo);
		if(this.props.deployInfo){
			console.log('deployInfo', this.props.deployInfo);
			let modal = <Modal isOpen={true}><NewPoolModal poolInfo={this.props.deployInfo}/></Modal>;
			return modal;
		}
	}
	deploy = async() => {
		await this.props.updateDeployInfo('');
		console.log('deploy reached', this.props.deployInfo);
		const activeAccount = this.props.activeAccount;
		this.props.updateDeployInfo({activeAccount: activeAccount});
		console.log('deploy reached 22', this.props.deployInfo);
	}

	displayDeployInfo = async(txInfo) => {
		this.props.updateDeployTxResult('');
		this.props.updateDeployTxResult(txInfo);
		await this.delay(5000);
		this.props.updateDeployTxResult('');
	}
	delay = (delayInms) => {
		return new Promise(resolve => {
		  setTimeout(() => {
			resolve(2);
		  }, delayInms);
		});
	}
	setSelectedToken = (index) => {
		this.setState({
			selectedTokenIndex: index,
		});
	}
	createOptionButtons = () => {
		let buttonHolder = [];
		const buttonStrings = ['Verified Causes', 'Your Causes', 'Contributions'];
		for(let i = 0; i < buttonStrings.length; i++){
			const tokenName = buttonStrings[i];
			let isDisabled = false;
			if(i === this.state.selectedTokenIndex) isDisabled = true;
			buttonHolder.push(<Button text={tokenName} disabled={isDisabled} key={i} callback={() => this.setSelectedToken(i)}/>)
		}
		buttonHolder.push(<Button text="Create Pool" callback={async() => await this.deploy(this.props.tokenMap, this.props.poolTrackerAddress)}/>);
		return buttonHolder;
	}
	createCardInfo = () => {
		const poolInfo = [this.props.verifiedPoolInfo, this.props.ownerPoolInfo, this.props.userDepositPoolInfo][this.state.selectedTokenIndex];

		if(poolInfo === "No Verified Pools") return
		let cardHolder = [];
		for(let i = 0; i < poolInfo.length; i++){
			console.log('a', (poolInfo[i].name));
			const item = poolInfo[i];
			cardHolder.push(
				<Card
					key={item.address}
					title={item.name}
					idx={i}
					receiver={item.receiver}
					address={item.address}
					acceptedTokenInfo={item.acceptedTokenInfo}
					about={item.about}
				/>
			);
		}
		return cardHolder;
	}

	render() {

		console.log("*********verifiedPoolInfo:", this.props.verifiedPoolInfo);
		const cardHolder = this.createCardInfo();
		const optionButtons = this.createOptionButtons();

		return (
			<Fragment>
				<article>
					<section className="page-section page-section--center horizontal-padding bw0">
						<div style={{display:"flex"}}>
							{optionButtons}
						</div>
					</section>
					<section className="page-section horizontal-padding bw0">
						{this.getPendingTxModal()}
						{this.getTxResultModal()}
						{this.getDeployTxModal()}
						{this.getNewPoolModal()}
						{cardHolder}
					</section>
					<section className="page-section page-section--center horizontal-padding bw0">

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
	deployInfo: state.deployInfo,
})

const mapDispatchToProps = dispatch => ({
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateDeployTxResult: (res) => dispatch(updateDeployTxResult(res)),
	updateDeployInfo: (res) => dispatch(updateDeployInfo(res)),
	updateDepositAmount: (amnt) => dispatch(updateDepositAmount(amnt)),
	updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
