import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card';
import { Modal, LargeModal } from "../components/Modal";
import { Button, ButtonSmall } from '../components/Button';
import PendingTxModal from "../components/modals/PendingTxModal";
import AlertModal from "../components/modals/AlertModal";
import TxResultModal from "../components/modals/TxResultModal";
import DeployTxModal from "../components/modals/DeployTxModal";
import NewPoolModal from "../components/modals/NewPoolModal";
import PendingTxList from "../components/PendingTxList";

import { updateVerifiedPoolInfo } from "../actions/verifiedPoolInfo"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"
import { updateDeployTxResult } from  "../actions/deployTxResult";
import { updateDeployInfo} from "../actions/deployInfo";
import { updateDepositAmount } from  "../actions/depositAmount";
import { updateWithdrawAmount } from  "../actions/withdrawAmount";
import { updateClaim } from "../actions/claim";
import { updateApprove } from "../actions/approve";
import { updateShare } from  "../actions/share";
import { updateNewAbout } from  "../actions/newAbout";

import LogoCard from "../components/logos/LogoCard";
import { precise, numberWithCommas, getHeaderValuesInUSD } from '../func/ancillaryFunctions';

import web3Modal from "../App";

class Dashboard extends Component {

	constructor(props) {
		super(props);

		this.state = {
			openTabIndex: 0,
			openVerifiedIndex: 0,
			hideLowBalance: false,
		}
	}
	componentDidMount = async () => {
		try{
			window.scrollTo(0,0);

			let currentTab = Number(localStorage.getItem('openTabIndex'));
			if(currentTab){
				this.setState({
					openTabIndex: currentTab
				});
			}

			let currentVerifiedTab = Number(localStorage.getItem('openVerifiedIndex'));
			if(currentVerifiedTab){
				this.setState({
					openVerifiedIndex: currentVerifiedTab
				});
			}

			if(this.props.deployInfo) await this.props.updateDeployInfo('');
			if(this.props.newAbout) await this.props.updateNewAbout('');
			if(this.props.depositAmount) await this.props.updateDepositAmount('');
			if(this.props.withdrawAmount) await this.props.updateWithdrawAmount('');
			if(this.props.approve) await this.props.updateApprove('');
			if(this.props.share) await this.props.updateShare("");
			if(this.props.claim)  await this.props.updateClaim('');
		}
		catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				error,
			);
			console.error(error);
		}
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
			//return modal;
		}
	}

	getAlertModal = () => {
		if(this.props.alert){
			let modal = <Modal isOpen={true}><AlertModal txDetails={this.props.alert}/></Modal>;
			return modal;
		}
	}

	getDeployTxModal = () => {
		if(this.props.deployTxResult){
			let modal = <Modal isOpen={true}><DeployTxModal txDetails={this.props.deployTxResult}/></Modal>;
			return modal;
		}
	}

	getNewPoolModal = () => {
		if(this.props.deployInfo){
			let modal = <LargeModal isOpen={true}><NewPoolModal poolInfo={this.props.deployInfo}/></LargeModal>;
			return modal;
		}
	}
	deploy = async() => {
		await this.props.updateDeployInfo('');
		const activeAccount = this.props.activeAccount;
		this.props.updateDeployInfo({activeAccount: activeAccount});
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

	setSelectedToken = async(index) => {

		if(this.props.deployInfo) await this.props.updateDeployInfo('');
		if(this.props.newAbout) await this.props.updateNewAbout('');
		if(this.props.depositAmount) await this.props.updateDepositAmount('');
		if(this.props.withdrawAmount) await this.props.updateWithdrawAmount('');

		if(this.props.approve) await this.props.updateApprove('');
		if(this.props.share) await this.props.updateShare("");
		if(this.props.claim)  await this.props.updateClaim('');
		this.setState({
			openTabIndex: index,
		});
		localStorage.setItem('openTabIndex', index);
	}

	setSelectedVerifiedTab = async(index) => {
		this.setState({
			openVerifiedIndex: index,
		});
		localStorage.setItem('openVerifiedIndex', index);
	}

	createOptionButtons = () => {
		let buttonHolder = [];
		const buttonStrings = ['Verified Causes', 'Your Causes', 'Contributions'];
		const infoStrings = ['team verified pools', 'view and update your causes', 'your donations'];
		for(let i = 0; i < buttonStrings.length; i++){
			const name = buttonStrings[i];
			let isDisabled = false;
			if(i === this.state.openTabIndex){
				isDisabled = true;
			}
			buttonHolder.push(<div title={infoStrings[i]} key={i}><ButtonSmall text={name} disabled={isDisabled} callback={() => this.setSelectedToken(i)}/></div>)
		}
		buttonHolder.push(<div style={{marginLeft: "30px"}} key={4} title="create your own cause"><ButtonSmall text="Create Pool" callback={async() => await this.deploy(this.props.tokenMap, this.props.poolTrackerAddress)}/></div>);
		return buttonHolder;
	}

	createVerifiedButtons = () => {
		if(this.state.openTabIndex !== 0) return;
		let buttonHolder = [];
		const buttonStrings = ['General', 'Crypto for Charity'];
		const infoStrings = ['miscellaneous funds', 'Crypto for Charity cause funds'];
		for(let i = 0; i < buttonStrings.length; i++){
			const name = buttonStrings[i];
			let isDisabled = false;
			if(i === this.state.openVerifiedIndex){
				isDisabled = true;
			}
			buttonHolder.push(<div title={infoStrings[i]} key={i}><ButtonSmall text={name} disabled={isDisabled} callback={() => this.setSelectedVerifiedTab(i)}/></div>)
		}
		return buttonHolder;
	}

	getTabTitle = () => {
		let title;
		if(this.state.openTabIndex === 0) title = "Verified Pools";
		else if (this.state.openTabIndex === 1) title = "Your Causes";
		else if (this.state.openTabIndex === 2) title = "Contributions";
		return (
			<div style={{marginTop: "100px", display:"flex", flexDirection: "wrap", alignItems:"center", justifyContent:"center"}}>
				<h2 style={{marginTop: "50px"}}> {title}</h2>
			</div>
		);
	}

	getVerifiedTabInfo = () => {
		if(this.state.openTabIndex !== 0) return;
		let info;
		if(this.state.openVerifiedIndex === 1){
			let info_1 = "The Crypto for Charity team is part of FreeWill, a technology company on a mission to empower both donors and nonprofits to do the most good for the people and causes they love.";
			let info_2 = "A Crypto for Charity cause fund supports a collection of nonprofits with a shared mission or area of focus. The distribution of your donation to a cause fund is an excellent option for those who want to donate more broadly to a cause."
			return (
				<div style={{marginTop: "25px", maxWidth: "600px", alignItems:"center", justifyContent:"center"}}>
					<img style={{width:"300px", border: "solid"}} src={require("../../images/c4c.jpg")} alt={"logo"}/>
					<p style={{alignItems:"center", marginTop: "25px", justifyContent:"center", marginRight:"0%"}} className="mr">{info_1}</p>
					<p style={{alignItems:"center", justifyContent:"center", marginRight:"0%"}} className="mr">{info_2}</p>
				</div>
			);
		}

		else if (this.state.openVerifiedIndex === 0){
			info = "Pools in this group consist of public goods, charities, and nonprofits.";
			return (
				<div style={{marginTop: "25px", maxWidth: "600px", alignItems:"center", justifyContent:"center"}}>
					<p style={{alignItems:"center", justifyContent:"center"}} className="mr">{info}</p>
				</div>
			);
		}
	}

	getTabInfo = () => {

		let info;
		if(this.state.openTabIndex === 0) info = "The recipients of verified pools are known and established entities";
		else if (this.state.openTabIndex === 1) info = "Causes for which you are the receiving address";
		else if (this.state.openTabIndex === 2) info = "Causes to which you have contributed";
		return (
			<div style={{marginTop: "25px", maxWidth: "300px", alignItems:"center", justifyContent:"center"}}>
				<p style={{marginRight: "0%"}} className="mr">{info}</p>
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
		if(this.state.openTabIndex === 0){
			return (
				<div style={{paddingBottom:"20px"}}/>
			);
		}
		else if (this.state.openTabIndex === 1){
			return (
				<div style={{paddingBottom:"62.5px"}}/>
			);
		}
		else if (this.state.openTabIndex === 2){
			return (
				<div title={this.state.hideLowBalance ? "show all pools contributed to" : "hide inactive pools"} style={{paddingBottom:"20px", maxWidth: "1000px", borderRadius: "8px", marginLeft: "auto", marginRight: "auto"}}>
					<ButtonSmall text={this.state.hideLowBalance ? "Show All" : "Hide Zero/Low Balances"} callback={() => this.setHideLowBalances()}/>
				</div>
			);
		}
	}

	createCardInfo = () => {
		if(this.props.activeAccount === "Connect" && !web3Modal.cachedProvider){
			return(
			<div className="card__cardholder_slide" style={{display:"flex", flexDirection: "wrap", alignItems:"center", justifyContent:"center", marginLeft:"auto", marginRight:"auto", paddingTop: "100px"}}>
				<LogoCard/>
				<div style={{display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>

					<h1 style={{marginBottom: "5px", marginLeft: "20px"}} >JustCause</h1>

					<a style={{ textDecoration: "none"}} title="New to Polygon? Follow link to learn more" href="https://polygon.technology/" target="_blank" rel="noopener noreferrer">
						<h2 style={{marginBottom: "5px", fontSize:17, marginLeft: "20px", marginRight: "auto"}} >Connect to Polygon to view causes</h2>
					</a>
				</div>
			</div>
			);
		}
		const poolInfo = [this.props.verifiedPoolInfo, this.props.ownerPoolInfo, this.props.userDepositPoolInfo][this.state.openTabIndex];

		//if(poolInfo === "No Verified Pools") return

		if(!this.props.tokenMap || !poolInfo){
			return (<div className="card__loader_wait" style={{display:"flex", flexDirection: "wrap", alignItems:"center", justifyContent:"center", marginLeft:"auto", marginRight:"auto", paddingTop: "100px"}}>
					<h2>Loading Pools...</h2>
				   </div>);
		}

		if(poolInfo.length === 0){
			return (<div className="card__loader_wait" style={{display:"flex", flexDirection: "column", alignItems:"center", justifyContent:"center", marginLeft:"auto", marginRight:"auto", paddingTop: "100px"}}>
					<h2>No Pools to Display</h2>
					<h2>{this.state.openTabIndex === 1 ? "Not Receiving Address for Any JustCause Pools" : this.state.openTabIndex === 2 ? "Not Contributed to Any JustCause Pools" : ""}</h2>
				   </div>);
		}

		let cardHolder = [];
		for(let i = 0; i < poolInfo.length; i++){
			const item = poolInfo[i];

			const {userBalance} = getHeaderValuesInUSD(item.acceptedTokenInfo, this.props.tokenMap);

			if(this.state.hideLowBalance && this.state.openTabIndex === 2){
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
			else if(this.state.openTabIndex === 0){
				const name = item.name;
				if(this.state.openVerifiedIndex === 1){
					if(name.endsWith("Cause Fund") || name === "Environment Conservation Fund" || name === "Healthcare & Research Fund"){
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
				else if(this.state.openVerifiedIndex === 0){
					if(!name.endsWith("Cause Fund") && name !== "Healthcare & Research Fund" && name !== "Environment Conservation Fund" ){
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
		}
		return (
			<div className="card__cardholder_slide">
				{cardHolder}
			</div>
		);
	}

	render() {
		const cardHolder = this.createCardInfo();
		const optionButtons = this.createOptionButtons();
		const verifiedButtons = this.createVerifiedButtons();

		return (
			<Fragment>
				<article>
					<section  className="page-section page-section--center horizontal-padding bw0" style={{paddingBottom:"0px"}}>
						<div style={{display:"flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
							<div style={{display:"flex", marginTop: "36px"}}>
								{optionButtons}
							</div>
							{this.getTabInfo()}
							<div style={{display:"flex"}}>
								{verifiedButtons}
							</div>
							{this.getVerifiedTabInfo()}
						</div>
					</section>
					<section className="page-section_no_vert_padding horizontal-padding bw0">
						{this.getPendingTxModal()}
						{this.getTxResultModal()}
						{this.getDeployTxModal()}
						{this.getAlertModal()}
						{this.getNewPoolModal()}
						{this.getApplicationLink()}
						{cardHolder}
					</section>
					<section className="page-section page-section--center horizontal-padding bw0" style={{paddingTop:"0px"}} >

					</section>
				</article>
				<PendingTxList/>
			</Fragment>

		);
	}
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolInfo: state.ownerPoolInfo,
	ownerPoolAddrs: state.ownerPoolAddrs,
	userDepositPoolInfo: state.userDepositPoolInfo,
	userDepositPoolAddrs: state.userDepositPoolAddrs,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	txResult: state.txResult,
	deployTxResult: state.deployTxResult,
	depositAmount: state.depositAmount,
	deployInfo: state.deployInfo,
	newAbout: state.newAbout,
	pendingTxList: state.pendingTxList,
	alert: state.alert,
})

const mapDispatchToProps = dispatch => ({
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateDeployTxResult: (res) => dispatch(updateDeployTxResult(res)),
	updateDeployInfo: (res) => dispatch(updateDeployInfo(res)),
	updateDepositAmount: (amnt) => dispatch(updateDepositAmount(amnt)),
	updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
	updateClaim: (txInfo) => dispatch(updateClaim(txInfo)),
	updateApprove: (txInfo) => dispatch(updateApprove(txInfo)),
	updateShare: (share) => dispatch(updateShare(share)),
	updateNewAbout: (about) => dispatch(updateNewAbout(about)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
