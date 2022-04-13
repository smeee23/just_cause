import React, {Component} from "react"
import classNames from "classnames";
//import { Fragment } from "react";

import { connect } from "react-redux";

import Icon from "./Icon";
import palette from "../utils/palette";

import { Button, ButtonSmall } from '../components/Button';
import TextLink from "./TextLink";

import getWeb3 from "../../getWeb3NotOnLoad";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";

import { updatePendingTx } from "../actions/pendingTx";
import { updateTxResult } from  "../actions/txResult";
import { updateDepositAmount } from  "../actions/depositAmount";
import { updateWithdrawAmount } from  "../actions/withdrawAmount";
import { updateTokenMap } from "../actions/tokenMap"
import { updateVerifiedPoolInfo } from "../actions/verifiedPoolInfo"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"

import {getBalance} from '../func/contractInteractions';
import { precise, delay, getHeaderValuesInUSD, getFormatUSD, displayLogo, displayLogoLg, redirectWindowBlockExplorer, redirectWindowTwitterShare} from '../func/ancillaryFunctions';
import { Modal } from "../components/Modal";
import DepositModal from '../components/modals/DepositModal'
import WithdrawModal from '../components/modals/WithdrawModal'
import PendingTxModal from "../components/modals/PendingTxModal";
import DeployTxModal from "../components/modals/DeployTxModal";


class Card extends Component {

	constructor(props) {
		super(props);

		this.state = {
			open: false,
			selectedTokenIndex: 0,
			tokenButtons: []
		}
	}

  componentDidMount() {
		window.scrollTo(0,0);
	}

	displayWithdraw = (item, address, tokenString) => {
	if(item.userBalance > 0){
		let isDisabled = false;
		if(this.props.pendingTx) isDisabled = true;
		return <Button text={"Withdraw "+tokenString} disabled={isDisabled} callback={async() => await this.withdrawDeposit(address, item.address, item.userBalance)}/>
		}
	}

	displayClaim = (item, address) => {
		if(item.unclaimedInterest > 0){
			let isDisabled = false;
			if(this.props.pendingTx) isDisabled = true;
			return <Button text="Claim Interest" disabled={isDisabled} callback={async() => await this.claim(address, item.address, this.props.poolTrackerAddress)}/>
		}
	}
	displayDepositOrApprove = (poolAddress, tokenAddress, isEth, tokenString, allowance) => {
		let isDisabled = false;
		if(this.props.pendingTx) isDisabled = true;
		if(isEth){
			return <Button text={"Deposit "+tokenString} disabled={isDisabled} callback={async() => await this.deposit(poolAddress, tokenAddress)}/>
		}
		if(Number(allowance) === 0){
			return <Button text={"Approve "+tokenString} disabled={isDisabled} callback={async() => await this.approve(tokenAddress, this.props.poolTrackerAddress, tokenString, poolAddress)}/>
		}
		return <Button text={"Deposit "+tokenString} disabled={isDisabled} callback={async() => await this.deposit(poolAddress, tokenAddress)}/>
	}
	toggleCardOpen = () => {
		this.setState({
			open: !this.state.open
		})
	}

	setSelectedToken = (index) => {
		this.setState({
			selectedTokenIndex: index,
		});
	}

	createTokenButtons = (acceptedTokenInfo) => {
		if(!this.state.open) return;
		if (!acceptedTokenInfo) return 'no data';
		let buttonHolder = [];
		for(let i = 0; i < acceptedTokenInfo.length; i++){
			const tokenName = acceptedTokenInfo[i].acceptedTokenString;
			let isDisabled = false;
			if(i === this.state.selectedTokenIndex) isDisabled = true;
			buttonHolder.push(<ButtonSmall text={tokenName} logo={displayLogo(tokenName)} disabled={isDisabled} key={i} callback={() => this.setSelectedToken(i)}/>)
		}
		return buttonHolder;
	}

	notifyLoad = () => {
		console.log('image Loaded')
	}
	getPoolImage = (picHash) => {
		if(!picHash){
			//default JustCause image
			picHash = "bafybeigop55rl4tbkhwt4k4cvd544kz2zfkpdoovrsflqqkal2v4ucixxu"
		}
		return <img alt="" style={{width:'auto', maxWidth:'300px', height:'auto'}} src={'https://ipfs.io/ipfs/'+picHash} onLoad={this.notifyLoad()}/>
	}

	createTokenInfo = (address, receiver, acceptedTokenInfo, about, picHash) => {
		if (!acceptedTokenInfo) return 'no data';
		if (!this.props.tokenMap) return 'no token data';

		const item = acceptedTokenInfo[this.state.selectedTokenIndex];
		const isETH = (item.acceptedTokenString === 'ETH' || item.acceptedTokenString === 'MATIC') ? true : false;

		const priceUSD = this.props.tokenMap[item.acceptedTokenString] && this.props.tokenMap[item.acceptedTokenString].priceUSD;

		const tokenInfo =
			<div className="card__body" key={item.acceptedTokenString}>
				<div className="card__body__column_one">
					{this.getPoolImage(picHash)}
				</div>
				<div /*style={{fontSize:17}}*/ className="card__body__column__three">
					<p>{"pool balance"}</p>
					<p>{"your balance"}</p>
					<p>{"claimed"}</p>
					<p>{"unclaimed"}</p>
				</div>

				<div className="card__body__column__six">
					{this.displayDepositOrApprove(address, item.address, isETH, item.acceptedTokenString, this.props.tokenMap[item.acceptedTokenString].allowance)}
					{this.displayWithdraw(item, address, item.acceptedTokenString)}
					{this.displayClaim(item, address)}
					<TextLink /*style={{fontSize:17}}*/ text={"address: "+address.slice(0, 6) + "..."+address.slice(-4)} callback={() => redirectWindowBlockExplorer(address, 'address')}/>
					<TextLink /*style={{fontSize:17}}*/ text={"receiver: "+receiver.slice(0, 6) + "..."+receiver.slice(-4)} callback={() => redirectWindowBlockExplorer(receiver, 'address')}/>
				</div>
				<div className="card__body__column__nine">
					<p /*style={{fontSize:17}}*/>{" "+ item.depositAPY+'% APY'}</p>
					<h3 className="mb0"> {displayLogoLg(item.acceptedTokenString)} {item.acceptedTokenString} </h3>
				</div>
				<div /*style={{fontSize:17}}*/ className="card__body__column__eight">
					<p className="mr">{about}</p>
					<Button tweet="tweet" callback={() => redirectWindowTwitterShare("https://twitter.com/share?url="+encodeURIComponent("https://www.justcause.finance/#/just_cause/search?address=") + address)}/>
				</div>

				<div /*style={{fontSize:17}}*/ className="card__body__column__seven">
					<p>{precise(item.totalDeposits, item.decimals)+"  (" +getFormatUSD(precise(item.totalDeposits, item.decimals),priceUSD)+")"}</p>
					<p>{precise(item.userBalance, item.decimals)+"  (" +getFormatUSD(precise(item.userBalance, item.decimals), priceUSD)+")"}</p>
					<p>{precise(item.claimedInterest, item.decimals)+"  (" +getFormatUSD(precise(item.claimedInterest, item.decimals), priceUSD)+")" }</p>
					<p>{precise(item.unclaimedInterest, item.decimals) +"  (" +getFormatUSD(precise(item.unclaimedInterest, item.decimals), priceUSD)+")"}</p>
				</div>
			</div>
		return tokenInfo;
		/*
		<p>{"amountScaled: "+item.amountScaled}</p>
		<p>{"liq Index: "+item.liquidityIndex}</p>
		*/
	}
	getDepositAmountModal = () => {
		if(this.props.depositAmount){
			let modal = <Modal isOpen={true}><DepositModal depositInfo={this.props.depositAmount}/></Modal>
			return modal;
		}
	}

	deposit = async(poolAddress, tokenAddress) => {
		this.props.updateDepositAmount('');
		console.log('deposit clicked');
		try{
			const tokenMap = this.props.tokenMap;
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);;
			const activeAccount = this.props.activeAccount;
			const userBalance = await getBalance(tokenAddress, tokenMap[tokenString].decimals, tokenString, activeAccount);
			console.log('tokenString', tokenString);
			await this.props.updateDepositAmount({tokenString: tokenString, tokenAddress: tokenAddress, userBalance: userBalance, poolAddress: poolAddress, activeAccount: activeAccount, amount: ''});
			//this.updatePoolInfo(this.props.depositAmount.poolAddress, this.props.depositAmount.activeAccount);
		}
		catch (error) {
			console.error(error);
		}
	}

	getWithdrawAmountModal = () => {
		if(this.props.withdrawAmount){
			let modal = <Modal isOpen={true}><WithdrawModal withdrawInfo={this.props.withdrawAmount}/></Modal>
			return modal;
		}
	}
	withdrawDeposit = async(poolAddress, tokenAddress, rawBalance) => {
		this.props.updateWithdrawAmount('');
		console.log('withdraw clicked');
		try{
			const tokenMap = this.props.tokenMap;
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
			const activeAccount = this.props.activeAccount;
			let formatBalance = precise(rawBalance, tokenMap[tokenString].decimals);
			console.log('compare', rawBalance, formatBalance);
			//formatBalance = Number.parseFloat(formatBalance).toPrecision(6);
			console.log('compare', rawBalance /10**tokenMap[tokenString].decimals, formatBalance);
			if(rawBalance /10**tokenMap[tokenString].decimals < formatBalance){
				alert('withdraw amount issue');
			}
			await this.props.updateWithdrawAmount({tokenString: tokenString, tokenAddress: tokenAddress, formatBalance: formatBalance, rawBalance: rawBalance, poolAddress: poolAddress, activeAccount: activeAccount, amount: ''});
		}
		catch (error) {
			console.error(error);
		}
	}

	claim = async(address, assetAddress, poolTrackerAddress) => {
		let result;
		let txInfo;
		console.log('claim interest clicked', address);
		try{
			const web3 = await getWeb3();
			const activeAccount = this.props.activeAccount;
			const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === assetAddress);
			const isETH = (tokenString === 'ETH' || tokenString === 'MATIC');

			const parameter = {
				from: activeAccount,
				gas: web3.utils.toHex(1500000),
				gasPrice: web3.utils.toHex(web3.utils.toWei('1.500000025', 'gwei'))
			};

			let PoolTrackerInstance = new web3.eth.Contract(
				PoolTracker.abi,
				poolTrackerAddress,
			);
			txInfo = {txHash: '', success: '', amount: '', tokenString: tokenString, type:"CLAIM", poolAddress: address};
			result = await PoolTrackerInstance.methods.claimInterest(assetAddress, address, isETH).send(parameter , (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
				this.props.updatePendingTx({txHash: transactionHash, amount: '', tokenString: tokenString, type:"CLAIM", poolAddress: address});
				txInfo.txHash = transactionHash;
			});
			txInfo.success = true;
			//await this.updatePoolInfo(address, activeAccount);
		}
		catch (error) {
			console.error(error);
		}
		this.displayTxInfo(txInfo);
		console.log('claim result', result);
	}

	approve = async(tokenAddress, address, tokenString, poolAddress) => {
		let result;
		let txInfo;
		try{
			const web3 = await getWeb3();
			const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
			const activeAccount = this.props.activeAccount;
			console.log('approve clicked');
			const parameter = {
				from: activeAccount ,
				gas: web3.utils.toHex(1500000),
				gasPrice: web3.utils.toHex(web3.utils.toWei('1.500000025', 'gwei'))
				};

			const amount = '10000000000000000000000000000000';
			txInfo = {txHash: '', success: '', amount: '', tokenString: tokenString, type:"APPROVE", poolAddress: poolAddress};
			result = await erc20Instance.methods.approve(address, amount).send(parameter, (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
				this.props.updatePendingTx({txHash: transactionHash, amount: '', tokenString: tokenString, type:"APPROVE", poolAddress: poolAddress});
				txInfo.txHash = transactionHash;
			});
			txInfo.success = true;

			let tempTokenMap = this.props.tokenMap;
			tempTokenMap[tokenString]['allowance'] = true;
			this.props.updateTokenMap(tempTokenMap);
		}
		catch (error) {
			console.error(error);
		}
		this.displayTxInfo(txInfo);
		console.log("approve", result);
	}
	displayTxInfo = async(txInfo,) => {
		this.props.updatePendingTx('');
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
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

	render() {
		const { title, about, picHash, idx, address, receiver, acceptedTokenInfo} = this.props;
		const poolIcons = [
			{ "name": "poolShape1", "color": palette("brand-red")},
			{ "name": "poolShape2", "color": palette("brand-yellow")},
			{ "name": "poolShape3", "color": palette("brand-blue")},
			{ "name": "poolShape4", "color": palette("brand-pink")},
			{ "name": "poolShape5", "color": palette("brand-green")},
		]

		const randomPoolIcon = poolIcons[idx % poolIcons.length];

		const classnames = classNames({
			"card": true,
			"card--open": this.state.open,
		})

		const {userBalance, interestEarned, totalBalance} = getHeaderValuesInUSD(acceptedTokenInfo, this.props.tokenMap);
		const tokenButtons = this.createTokenButtons(acceptedTokenInfo);
		const tokenInfo = this.createTokenInfo(address, receiver, acceptedTokenInfo, about, picHash);

		return (
			<div className={classnames}>
				<div className="card__header">
				<Icon name={randomPoolIcon.name} size={32} color={randomPoolIcon.color} strokeWidth={3}/>
				<h4 className="mb0">
					{ title }
				</h4>

				<div style={{paddingLeft:"10px", display:"flex", flexWrap:"wrap"}}>
					{tokenButtons}
				</div>

				<div /*style={{fontSize:17}}*/ className="card__header--right">
								<p className="mb0">{"your deposit: " + userBalance}</p>
								<p className="mb0">{"pool: "+ totalBalance}</p>
								<p className="mb0">{"total earned: "+ interestEarned}</p>
								<div className="card__open-button" onClick={this.toggleCardOpen}><Icon name={"plus"} size={32}/></div>
				</div>
				</div>
				{tokenInfo}
				<div className="card__bar"/>
				{this.getDepositAmountModal()}
				{this.getWithdrawAmountModal()}
      		</div>
		);
	}
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolAddrs: state.ownerPoolAddrs,
	ownerPoolInfo: state.ownerPoolInfo,
	userDepositPoolAddrs: state.userDepositPoolAddrs,
	userDepositPoolInfo: state.userDepositPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	depositAmount: state.depositAmount,
	withdrawAmount: state.withdrawAmount,
})

const mapDispatchToProps = dispatch => ({
	updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateDepositAmount: (amnt) => dispatch(updateDepositAmount(amnt)),
	updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
	updateTokenMap: (tokenMap) => dispatch(updateTokenMap(tokenMap)),
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Card)
