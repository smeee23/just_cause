import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import Button from '../components/Button'
import { AlertModal, Modal } from "../components/Modal";
import PendingTxModal from "../components/modals/PendingTxModal";
import TxResultModal from "../components/modals/TxResultModal";
import DeployTxModal from "../components/modals/DeployTxModal";

import getWeb3 from "../../getWeb3NotOnLoad";
import PoolTracker from "../../contracts/PoolTracker.json";

import { updateDeployTxResult } from  "../actions/deployTxResult";

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

	getTxResultModal = () => {
		if(this.props.txResult){
			console.log('TX RESULT', this.props.txResult);
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
	deploy = async(tokenMap, poolTrackerAddress) => {
		let result;
		let txInfo;
		try{
			const web3 = await getWeb3();
			const activeAccount = await web3.currentProvider.selectedAddress;
			const poolName = prompt("Enter pool name:");
			let acceptedTokens = prompt("Enter accepted tokens for pool (e.g. DAI USDC...)", 'ETH DAI USDC');
			const about = prompt("Type a short summary of your cause", 'This is a test pool');
			acceptedTokens = acceptedTokens.split(" ");
			console.log("acceptedTokens", acceptedTokens, tokenMap);
			let tokenAddrs = [];
			for(let i = 0; i < acceptedTokens.length; i++){
				tokenAddrs.push(tokenMap[acceptedTokens[i]].address);
			}
			console.log('poolTrackerAddress', poolTrackerAddress);
			const receiver = prompt("Enter the address to recieve the interest", activeAccount);
			console.log("receiver", receiver, typeof receiver);
			console.log("token addresses", tokenAddrs);
			const parameter = {
				from: activeAccount,
				gas: web3.utils.toHex(3200000),
				gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
			};

			let PoolTrackerInstance = new web3.eth.Contract(
				PoolTracker.abi,
				poolTrackerAddress,
			);
			result = await PoolTrackerInstance.methods.createJCPoolClone(tokenAddrs, poolName, about, receiver).send(parameter , (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
				txInfo = {txHash: transactionHash, status: 'pending', poolAddress: '...', poolName: poolName, receiver: receiver};
				this.props.updateDeployTxResult(txInfo);
			});
			txInfo.poolAddress = result.events.AddPool.returnValues.pool;
			txInfo.status = 'success';
			console.log('deploy', result);
			console.log('txInfo', txInfo);
		}
		catch (error) {
			txInfo.status = 'failed';
			console.error(error);
		}
		console.log('txInfo', txInfo);
		this.displayDeployInfo(txInfo);
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
	ownerPoolAddrs: state.ownerPoolAddrs,
	ownerPoolInfo: state.ownerPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	txResult: state.txResult,
	deployTxResult: state.deployTxResult,
})

const mapDispatchToProps = dispatch => ({
	//updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateDeployTxResult: (res) => dispatch(updateDeployTxResult(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(YourCause)