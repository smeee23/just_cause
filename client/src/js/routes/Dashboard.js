import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card';
import { Modal, LargeModal } from "../components/Modal";
import { Button, ButtonSmall, ButtonExtraSmall} from '../components/Button';
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

import LogoCard from "../components/logos/LogoCard";
import { updatePoolInfo, addDeployedPool } from '../func/contractInteractions';
import { getHeaderValuesInUSD } from '../func/ancillaryFunctions';

class Dashboard extends Component {

	constructor(props) {
		super(props);

		this.state = {
			selectedTokenIndex: 0,
			hideLowBalance: false,
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
			let modal = <LargeModal isOpen={true}><NewPoolModal poolInfo={this.props.deployInfo}/></LargeModal>;
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
		const infoStrings = ['team verified pools', 'receiving pools', 'your donations'];
		for(let i = 0; i < buttonStrings.length; i++){
			const name = buttonStrings[i];
			let isDisabled = false;
			if(i === this.state.selectedTokenIndex) isDisabled = true;
			buttonHolder.push(<div title={infoStrings[i]} key={i}><Button text={name} disabled={isDisabled} callback={() => this.setSelectedToken(i)}/></div>)
		}
		buttonHolder.push(<div style={{marginLeft: "30px"}} key={4} title="create your own cause"><Button text="Create Pool" callback={async() => await this.deploy(this.props.tokenMap, this.props.poolTrackerAddress)}/></div>);
		return buttonHolder;
	}

	getTabTitle = () => {
		console.log("spot", this.state.selectedTokenIndex );
		let title;
		if(this.state.selectedTokenIndex === 0) title = "Verified Pools"
		else if (this.state.selectedTokenIndex === 1) title = "Your Causes"
		else if (this.state.selectedTokenIndex === 2) title = "Contributions"
		return (
			<div style={{marginTop: "100px", display:"flex", flexDirection: "wrap", alignItems:"center", justifyContent:"center"}}>
				<h2 style={{marginTop: "50px"}}> {title}</h2>
			</div>
		);
	}

	getTabInfo = () => {
		console.log("spot", this.state.selectedTokenIndex );

		let info;
		if(this.state.selectedTokenIndex === 0) info = "The recipients of verified pools are known and established entities";
		else if (this.state.selectedTokenIndex === 1) info = "Causes for which you are the receiving address";
		else if (this.state.selectedTokenIndex === 2) info = "Causes to which you have contributed";
		return (
			<div style={{marginTop: "25px", maxWidth: "300px", alignItems:"center", justifyContent:"center"}}>
				<p className="mr">{info}</p>
			</div>
		);
	}

	setHideLowBalances = () => {
		let orig = this.state.hideLowBalance;

		this.setState({
			hideLowBalance: (!orig)
		});
	}
	getApplicationLink = () => {
		if(this.state.selectedTokenIndex === 0){
			return (
				<div style={{paddingBottom:"5px", maxWidth: "1000px", borderRadius: "8px", marginLeft: "auto", marginRight: "auto"}}>
					<div title="apply to create a verified pool" style={{margin: "auto"}}>
						<ButtonSmall text={"Apply"} callback={() => this.redirectWindowGoogleApplication()}/>
					</div>
				</div>
			);
		}
		else if (this.state.selectedTokenIndex === 1){
			return (
				<div style={{paddingBottom:"64.5px"}}>

				</div>
			);
		}
		else if (this.state.selectedTokenIndex === 2){
			return (
				<div title={this.state.hideLowBalance ? "show all pools contributed to" : "hide inactive pools"} style={{paddingBottom:"5px", maxWidth: "1000px", borderRadius: "8px", marginLeft: "auto", marginRight: "auto"}}>
					<ButtonSmall text={this.state.hideLowBalance ? "Show All" : "Hide Zero/Low Balances"} callback={() => this.setHideLowBalances()}/>
				</div>
			);
		}
	}

	redirectWindowGoogleApplication = () => {
		window.open("https://docs.google.com/forms/d/e/1FAIpQLSfvejwW-3zNhy4H3hvcIDZ2WGUH422Zj1_yVouRH4tTN8kQFg/viewform?usp=sf_link", "_blank")
	  }
	createCardInfo = () => {
		if(this.props.activeAccount === "Connect"){
			return(
			<div style={{display:"flex", flexDirection: "wrap", alignItems:"center", justifyContent:"center", marginLeft:"auto", marginRight:"auto", paddingTop: "100px"}}>
				<LogoCard/>
				<div style={{display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>

					<h1 style={{marginBottom: "5px", marginLeft: "20px"}} >JustCause</h1>
					<h2 style={{marginBottom: "5px", fontSize:17, marginLeft: "20px", marginRight: "auto"}} >Connect to Polygon</h2>
				</div>
			</div>
			);
		}
		const poolInfo = [this.props.verifiedPoolInfo, this.props.ownerPoolInfo, this.props.userDepositPoolInfo][this.state.selectedTokenIndex];

		if(poolInfo === "No Verified Pools") return
		let cardHolder = [];
		for(let i = 0; i < poolInfo.length; i++){
			console.log('a', (poolInfo[i].name));
			const item = poolInfo[i];

			const {userBalance, interestEarned, totalBalance} = getHeaderValuesInUSD(item.acceptedTokenInfo, this.props.tokenMap);
			console.log("userBalance", userBalance);

			if(this.state.hideLowBalance && this.state.selectedTokenIndex === 2){
				if(userBalance !== "<$0.01" && userBalance !== "$0.00"){
					cardHolder.push(
						<Card
							key={item.address}
							title={item.name}
							idx={i}
							receiver={item.receiver}
							address={item.address}
							acceptedTokenInfo={item.acceptedTokenInfo}
							about={item.about}
							picHash={item.picHash}
							isVerified={item.isVerified}
						/>
					);
				}
			}
			else{
				cardHolder.push(
					<Card
						key={item.address}
						title={item.name}
						idx={i}
						receiver={item.receiver}
						address={item.address}
						acceptedTokenInfo={item.acceptedTokenInfo}
						about={item.about}
						picHash={item.picHash}
						isVerified={item.isVerified}
					/>
				);
			}
			console.log("CARD", cardHolder[cardHolder.length - 1]);
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
					<section  className="page-section page-section--center horizontal-padding bw0" style={{paddingBottom:"0px"}}>
						<div style={{display:"flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
							<div style={{display:"flex"}}>
								{optionButtons}
							</div>
							{this.getTabInfo()}
						</div>
					</section>
					<section className="page-section_no_vert_padding horizontal-padding bw0">
						{this.getPendingTxModal()}
						{this.getTxResultModal()}
						{this.getDeployTxModal()}
						{this.getNewPoolModal()}
						{this.getApplicationLink()}
						{cardHolder}
					</section>
					<section className="page-section page-section--center horizontal-padding bw0" style={{paddingTop:"0px"}} >

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
