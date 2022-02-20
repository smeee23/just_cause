import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import Button from '../components/Button'
import { Modal } from "../components/Modal";
import PendingTxModal from "../components/modals/PendingTxModal";
import TxResultModal from "../components/modals/TxResultModal";
import DeployTxModal from "../components/modals/DeployTxModal";

import {searchPools} from '../func/contractInteractions';

class Search extends Component {

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

	setSearchResults = async() => {
		let results = await searchPools(this.props.poolTrackerAddress, this.props.activeAccount, this.props.tokenMap);
		console.log('results', results);
		this.setState({
			searchResults: this.createCardInfo(results)
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
		return (
			<Fragment>
				<article>
				<section className="page-section page-section--center horizontal-padding bw0">
					<Button icon="plus" text="Search" lg callback={async() => await this.setSearchResults(this.props.poolTrackerAddress, this.props.activeAccount, this.props.tokenMap)}/>
				</section>
					<section className="page-section horizontal-padding bw0">
						{this.getPendingTxModal()}
						{this.getTxResultModal()}
						{this.getDeployTxModal()}
						{this.state.searchResults}
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
	pendingTx: state.pendingTx,
	txResult: state.txResult,
	deployTxResult: state.deployTxResult,
})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(Search)