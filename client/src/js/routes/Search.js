import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import { Button } from '../components/Button'
import { Modal } from "../components/Modal";
import AlertModal from "../components/modals/AlertModal";
import PendingTxModal from "../components/modals/PendingTxModal";
import TxResultModal from "../components/modals/TxResultModal";
import DeployTxModal from "../components/modals/DeployTxModal";
import SearchModal from "../components/modals/SearchModal";
import ConnectModal from "../components/Modal"
import ConnectPendingModal from "../components/modals/ConnectPendingModal";

import { updateVerifiedPoolInfo } from "../actions/verifiedPoolInfo"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"
import { updateSearchInfo } from "../actions/searchInfo";
import { updateAlert } from "../actions/alert";
import { getExternalPoolInfo } from '../func/contractInteractions';
import PendingTxList from "../components/PendingTxList";

class Search extends Component {

	constructor(props) {
		super(props);

		this.state = {
			openModal: false,
			linkAddress: '',
		}
	}

	componentDidMount = async () => {
		window.scrollTo(0,0);
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
	getDeployTxModal = () => {
		if(this.props.deployTxResult){
			let modal = <Modal isOpen={true}><DeployTxModal txDetails={this.props.deployTxResult}/></Modal>;
			return modal;
		}
	}

	getAlertModal = () => {
		if(this.props.alert){
			console.log("TESTING", this.props.alert)
			//let modal = <Modal isOpen={true}><AlertModal info={this.props.alert}/></Modal>;
			//return modal;
		}
	}

	getConnectModal = () => {
		if(this.props.activeAccount === "Pending"){
			let modal = <ConnectModal isOpen={true}><ConnectPendingModal/></ConnectModal>;
			return modal;
		}
	}

	getExternalLink = async() => {
		const info = await getExternalPoolInfo(this.props.poolTrackerAddress, this.props.activeAccount, this.props.tokenMap, this.state.linkAddress, this.props.connect);
		const results = this.createCardInfo(info);
		return results;
	}
	getSearchResults = () => {
		if(!["Connect", "Pending"].includes(this.props.activeAccount)){
			if(this.props.searchInfo){
				const searchResults = this.createCardInfo(this.props.searchInfo)
				return searchResults;
			}
			else{
				let modal = <Modal isOpen={true}><SearchModal linkAddress={this.state.linkAddress}/></Modal>;
				return modal;
			}
		}
	}

	openModal = () => {
		if(this.props.searchInfo){
			this.setState({openModal: false});
			this.props.updateSearchInfo('');
		}
		else{
			window.location.reload(false);
		}
	}

	getSearchModal = () => {
		if((!this.props.searchInfo || this.state.openModal) && !["Connect", "Pending"].includes(this.props.activeAccount)){
			let modal = <Modal isOpen={true}><SearchModal linkAddress={this.state.linkAddress}/></Modal>;
			return modal;
		}
	}

	isConnected = () => {
		console.log("isConnected", !["Connect", "Pending"].includes(this.props.activeAccount));
		return false;
	}

	createCardInfo = (poolInfo) => {
		if(poolInfo.length === 0){
			return
		}
		else{
			let cardHolder = [];
			const item = poolInfo;
			cardHolder.push(
				<Card
					key={item.address}
					title={item.name}
					idx={0}
					receiver={item.receiver}
					address={item.address}
					acceptedTokenInfo={item.acceptedTokenInfo}
					about={item.about}
					picHash={item.picHash}
					isVerified={item.isVerified}
				/>
			);
			return cardHolder;
		}
	}

	render() {
		const linkAddress  = this.props.match.params.address;
		if(!this.state.linkAddress){
			if(linkAddress){
				this.setState({linkAddress});
			}
			else if(window.location.href.includes('?address=') && !this.state.linkAddress){
				let addr = window.location.href;
				addr = addr.substring(addr.length - 42);
				this.setState({linkAddress: addr});
			}
		}

		return (
			<Fragment>
				<article>
				<section className="page-section page-section--center horizontal-padding bw0" style={{marginTop: "135px"}}>
					<Button
						text="Find Pool"
						icon="search"
						disabled={["Connect", "Pending"].includes(this.props.activeAccount)}
						callback={() => this.openModal()}/>
				</section>
					<section className="page-section horizontal-padding bw0">
						{this.getPendingTxModal()}
						{this.getTxResultModal()}
						{this.getDeployTxModal()}
						{this.getSearchModal()}
						{this.getAlertModal()}
						{this.getSearchResults()}
						{this.getConnectModal()}
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
	ownerPoolAddrs: state.ownerPoolAddrs,
	ownerPoolInfo: state.ownerPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	txResult: state.txResult,
	deployTxResult: state.deployTxResult,
	connect: state.connect,
	searchInfo: state.searchInfo,
	alert: state.alert,
})

const mapDispatchToProps = dispatch => ({
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateSearchInfo: (info) => dispatch(updateSearchInfo(info)),
	updateAlert: (info) => dispatch(updateAlert(info)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Search)