import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import { Button } from '../components/Button'
import { Modal } from "../components/Modal";
import TxResultModal from "../components/modals/TxResultModal";
import PendingTxModal from "../components/modals/PendingTxModal";
import DeployTxModal from "../components/modals/DeployTxModal";
import NewPoolModal from "../components/modals/NewPoolModal";

import { updateDeployTxResult } from  "../actions/deployTxResult";
import {updateDeployInfo} from "../actions/deployInfo";

import { addDeployedPool } from '../func/contractInteractions';

import { updateVerifiedPoolInfo } from "../actions/verifiedPoolInfo"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"

import { updatePoolInfo } from '../func/contractInteractions';

class YourCause extends Component {

	constructor(props) {
		super(props);

		this.state = {
			searchResults: [],
		}
	}

	componentDidMount = async () => {
		window.scrollTo(0,0);
	}

	componentDidUpdate = () => {
		console.log('component did update');
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
			}

			return modal;
		}
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

	getNewPoolModal = () => {
		console.log('deployInfo outer', this.props.deployInfo);
		if(this.props.deployInfo){
			console.log('deployInfo', this.props.deployInfo);
			let modal = <Modal isOpen={true}><NewPoolModal poolInfo={this.props.deployInfo}/></Modal>;
			return modal;
		}
	}
	deploy = async() => {
		this.props.updateDeployInfo('');
		console.log('deploy reached 1', this.props.deployInfo);
		const activeAccount = this.props.activeAccount;
		await this.props.updateDeployInfo({activeAccount: activeAccount});
		console.log('deploy reached 2', this.props.deployInfo);
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

	createCardInfo = (poolInfo) => {
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
		const cardHolder = this.createCardInfo(this.props.ownerPoolInfo);
		return (
			<Fragment>
				<article>
				<section className="page-section page-section--center horizontal-padding bw0">
					<Button icon="plus" text="Add Pool" lg callback={async() => await this.deploy(this.props.tokenMap, this.props.poolTrackerAddress)}/>
				</section>
					<section className="page-section horizontal-padding bw0">
						{this.getDeployTxModal()}
						{this.getNewPoolModal()}
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
	verifiedPoolInfo: state.verifiedPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	txResult: state.txResult,
	deployTxResult: state.deployTxResult,
	deployInfo: state.deployInfo,
})

const mapDispatchToProps = dispatch => ({
	updateDeployTxResult: (res) => dispatch(updateDeployTxResult(res)),
	updateDeployInfo: (res) => dispatch(updateDeployInfo(res)),
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
})

export default connect(mapStateToProps, mapDispatchToProps)(YourCause)