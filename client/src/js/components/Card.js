import React, {Component} from "react"
import classNames from "classnames";
//import { Fragment } from "react";

import { connect } from "react-redux";

import Icon from "./Icon";
import palette from "../utils/palette";

import Button from '../components/Button';

import getWeb3 from "../../getWeb3NotOnLoad";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";

import { updatePendingTx } from "../actions/pendingTx";
import { updateTxResult } from  "../actions/txResult";
import { updateDepositAmount } from  "../actions/depositAmount";
import { updateWithdrawAmount } from  "../actions/withdrawAmount";

import {getAllowance, getBalance, getAmountBase} from '../func/contractInteractions';
import { rayMul, precise, delay, getHeaderValuesInUSD, displayLogo} from '../func/ancillaryFunctions';

import { Modal } from "../components/Modal";
import DepositModal from '../components/modals/DepositModal'
import WithdrawModal from '../components/modals/WithdrawModal'


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

	displayWithdraw = (item, address) => {
	if(item.userBalance > 0){
		let isDisabled = false;
		if(this.props.pendingTx) isDisabled = true;
		return <Button text="Withdraw Deposit" disabled={isDisabled} callback={async() => await this.withdrawDeposit(address, item.address, item.userBalance)}/>
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
			return <Button text="Deposit" disabled={isDisabled} callback={async() => await this.deposit(poolAddress, tokenAddress)}/>
		}
		if(Number(allowance) === 0){
			return <Button text="Approve" disabled={isDisabled} callback={async() => await this.approve(tokenAddress, this.props.poolTrackerAddress, tokenString)}/>
		}
		return <Button text="Deposit" disabled={isDisabled} callback={async() => await this.deposit(poolAddress, tokenAddress)}/>
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
		console.log('setSelectedToken', index);
	}

	createTokenButtons = (acceptedTokenInfo) => {
		if (!acceptedTokenInfo) return 'no data';
		let buttonHolder = [];
		for(let i = 0; i < acceptedTokenInfo.length; i++){
			const tokenName = acceptedTokenInfo[i].acceptedTokenString;
			let isDisabled = false;
			if(i === this.state.selectedTokenIndex) isDisabled = true;
			buttonHolder.push(<Button text={tokenName} disabled={isDisabled} key={i} callback={() => this.setSelectedToken(i)}/>)
		}
		return buttonHolder;
	}

	createTokenInfo = (address, receiver, acceptedTokenInfo, about) => {
		if (!acceptedTokenInfo) return 'no data';
		if (!this.props.tokenMap) return 'no token data';

		const item = acceptedTokenInfo[this.state.selectedTokenIndex];
		const isETH = (item.acceptedTokenString === 'ETH') ? true : false;
		const tokenInfo =
			<div className="card__body" key={item.acceptedTokenString}>
				<div className="card__body__column">
					<h3 className="mb0"> {displayLogo(item.acceptedTokenString)} {item.acceptedTokenString } </h3>
					<p>{"address: " + address.slice(0, 6) + "..."+address.slice(-4)+' '}</p>
					<p>{"receiver: "+receiver.slice(0, 6) + "..."+receiver.slice(-4)+' '}</p>
					<p>{"APY: "+ item.depositAPY+'%'}</p>
					{this.displayDepositOrApprove(address, item.address, isETH, item.acceptedTokenString, this.props.tokenMap[item.acceptedTokenString].allowance)}
					{this.displayWithdraw(item, address)}
				</div>
				<div className="card__body__column">
					<p>{"pool balance: "+precise(item.totalDeposits, item.decimals)}</p>
					<p>{"your balance: "+precise(item.userBalance, item.decimals)}</p>
					<p>{"donated: "+precise(rayMul(item.amountScaled, item.reserveNormalizedIncome) - item.userBalance, item.decimals)}</p>
					<p>{"claimed: "+precise(item.claimedInterest, item.decimals)}</p>
					<p>{"unclaimed: "+precise(item.unclaimedInterest, item.decimals)}</p>
					{this.displayClaim(item, address)}
				</div>
				<div className="card__body__column">
					<p>{about}</p>
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
			const web3 = await getWeb3();
			const tokenMap = this.props.tokenMap;
			console.log('token map', tokenMap);
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
			console.log('tokenString:', tokenString, tokenMap[tokenString].decimals);
			const activeAccount = await web3.currentProvider.selectedAddress;
			const userBalance = await getBalance(tokenAddress, tokenMap[tokenString].decimals, tokenString, activeAccount);
			await this.props.updateDepositAmount({tokenString: tokenString, tokenAddress: tokenAddress, userBalance: userBalance, poolAddress: poolAddress, amount: ''});
			console.log('this.props.depositAmount', this.props.depositAmount);
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
	withdrawDeposit = async(poolAddress, tokenAddress, userBalance) => {
		this.props.updateWithdrawAmount('');
		console.log('withdraw clicked');
		try{
			const web3 = await getWeb3();
			const tokenMap = this.props.tokenMap;
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
			let balance = userBalance / 10**tokenMap[tokenString].decimals;
			balance = Number.parseFloat(balance).toPrecision(6);
			await this.props.updateWithdrawAmount({tokenString: tokenString, tokenAddress: tokenAddress, userBalance: balance, poolAddress: poolAddress, amount: ''});
			console.log('this.props.withdrawAmount', this.props.withdrawAmount);
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
			const activeAccount = await web3.currentProvider.selectedAddress;
			const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === assetAddress);
			const parameter = {
				from: activeAccount,
				gas: web3.utils.toHex(1000000),
				gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
			};

			let PoolTrackerInstance = new web3.eth.Contract(
				PoolTracker.abi,
				poolTrackerAddress,
			);
			txInfo = {txHash: '', success: '', amount: '', tokenString: tokenString, type:"CLAIM", poolAddress: address};
			result = await PoolTrackerInstance.methods.claimInterest(assetAddress, address).send(parameter , (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
				this.props.updatePendingTx({txHash: transactionHash, amount: '', tokenString: tokenString, type:"CLAIM", poolAddress: address});
				txInfo.txHash = transactionHash;
			});
			txInfo.success = true;
		}
		catch (error) {
			console.error(error);
		}
		this.displayTxInfo(txInfo);
		console.log('claim result', result);
	}

	approve = async(tokenAddress, address, tokenString) => {
		let result;
		let txInfo;
		try{
			const web3 = await getWeb3();
			const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
			const activeAccount = await web3.currentProvider.selectedAddress;
			console.log('approve clicked');
			const parameter = {
				from: activeAccount ,
				gas: web3.utils.toHex(1000000),
				gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
				};
			console.log(typeof amountInGwei);
			const amount = '10000000000000000000000000000000';
			txInfo = {txHash: '', success: '', amount: '', tokenString: tokenString, type:"APPROVE", poolAddress: ''};
			result = await erc20Instance.methods.approve(address, amount).send(parameter, (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
				this.props.updatePendingTx({txHash: transactionHash, amount: '', tokenString: tokenString, type:"APPROVE", poolAddress: ''});
				txInfo.txHash = transactionHash;
			});
			txInfo.success = true;
		}
		catch (error) {
			console.error(error);
		}
		this.displayTxInfo(txInfo);
		console.log("approve", result);
	}
	displayTxInfo = async(txInfo) => {
		this.props.updatePendingTx('');
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}


	render() {
		const { title, about, idx, address, receiver, acceptedTokenInfo} = this.props;

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
		const tokenInfo = this.createTokenInfo(address, receiver, acceptedTokenInfo, about);

		return (
			<div className={classnames}>
				<div className="card__header">
							<Icon name={randomPoolIcon.name} size={32} color={randomPoolIcon.color} strokeWidth={3}/>
				<h3 className="mb0">
								{ title }
							</h3>
				<div className="card__header--right">
					<p className="mb0">{ about.slice(0, 20) + "..." }</p>
				</div>
				<div className="card__header--right">
								<p className="mb0">{"your deposit: " + userBalance}</p>
								<p className="mb0">{"pool : "+ totalBalance}</p>
								<p className="mb0">{"total earned : "+ interestEarned}</p>
								<div className="card__open-button" onClick={this.toggleCardOpen}><Icon name={"plus"} size={32}/></div>
				</div>
				</div>
						<div className="card__body">
								{tokenButtons}
								{tokenInfo}
						</div>
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
	ownerPoolAddrs: state.ownerPoolAddrs,
	ownerPoolInfo: state.ownerPoolInfo,
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
})

export default connect(mapStateToProps, mapDispatchToProps)(Card)
