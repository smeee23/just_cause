import React, {Component} from "react"
import classNames from "classnames";
//import { Fragment } from "react";

import { connect } from "react-redux";

import Icon from "./Icon";
import palette from "../utils/palette";

import Button from '../components/Button';

import DaiLogo from "./cryptoLogos/DaiLogo";
import WbtcLogo from "./cryptoLogos/WbtcLogo";
import UsdcLogo from "./cryptoLogos/UsdcLogo";
import TetherLogo from "./cryptoLogos/TetherLogo";
import EthLogo from "./cryptoLogos/EthLogo";
import AaveLogo from "./cryptoLogos/AaveLogo";

import getWeb3 from "../../getWeb3NotOnLoad";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";

import { updatePendingTx } from "../actions/pendingTx";
import { updateTxResult } from  "../actions/txResult";

import {claim, getAllowance, getBalance, getAmountBase, approve} from '../func/contractInteractions';

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

	toFixed = (x) => {
		if (Math.abs(x) < 1.0) {
		  let e = parseInt(x.toString().split('e-')[1]);
		  if (e) {
			  x *= Math.pow(10,e-1);
			  x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
		  }
		} else {
		  let e = parseInt(x.toString().split('+')[1]);
		  if (e > 20) {
			  e -= 20;
			  x /= Math.pow(10,e);
			  x += (new Array(e+1)).join('0');
		  }
		}
		return x;
	  }

	precise = (x, decimals) => {
		let number = (Number.parseFloat(x).toPrecision(6) / (10**decimals));
		return this.toFixed(number);
	}

	rayMul = (a, b) => {
		if (a === 0 || b === 0) {
		  return 0;
		}

		const ray = 1e27;
		const halfRAY = ray / 2;
		return (a * b + halfRAY) / ray;
	  }


	getAPY = (depositAPY) => {
		if(depositAPY){
			return depositAPY + '%';
		}
		else{
			return "N/A";
		}
	}

	displayWithdraw = (item, address) => {
	if(item.userBalance > 0){
		let isDisabled = false;
		if(this.props.pendingTx) isDisabled = true;
		return <Button text="Withdraw Deposit" disabled={isDisabled} callback={async() => await this.withdrawDeposit(address, item.address,  this.props.tokenMap, this.props.poolTrackerAddress, item.userBalance)}/>
		}
	}

	displayClaim = (item, address) => {
		if(item.unclaimedInterest > 0){
			let isDisabled = false;
			if(this.props.pendingTx) isDisabled = true;
			return <Button text="Claim Interest" disabled={isDisabled} callback={async() => await this.claim(address, item.address, this.props.poolTrackerAddress)}/>
		}
	}

	toggleCardOpen = () => {
		this.setState({
			open: !this.state.open
		})
	}

	setSelectedToken = (index, button) => {
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
		let isDisabled = false;
		if(this.props.pendingTx) isDisabled = true;
		const isETH = (item.acceptedTokenString === 'ETH') ? true : false;
		const tokenInfo =
			<div className="card__body" key={item.acceptedTokenString}>
				<div className="card__body__column">
					<h3 className="mb0"> {this.displayLogo(item.acceptedTokenString)} {item.acceptedTokenString } </h3>
					<p>{"address: " + address.slice(0, 6) + "..."+address.slice(-4)+' '}</p>
					<p>{"receiver: "+receiver.slice(0, 6) + "..."+receiver.slice(-4)+' '}</p>
					<p>{"APY: "+ item.depositAPY+'%'}</p>
					<Button text="Contribute" disabled={isDisabled} callback={async() => await this.deposit(address, item.address, isETH, this.props.tokenMap, this.props.poolTrackerAddress)}/>
					{this.displayWithdraw(item, address)}
				</div>
				<div className="card__body__column">
					<p>{"pool balance: "+this.precise(item.totalDeposits, item.decimals)}</p>
					<p>{"your balance: "+this.precise(item.userBalance, item.decimals)}</p>
					<p>{"donated: "+ this.precise(this.rayMul(item.amountScaled, item.reserveNormalizedIncome) - item.userBalance, item.decimals)}</p>
					<p>{"claimed: "+this.precise(item.claimedInterest, item.decimals)}</p>
					<p>{"unclaimed: "+this.precise(item.unclaimedInterest, item.decimals)}</p>
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

	deposit = async(poolAddress, tokenAddress, isETH, tokenMap, poolTrackerAddress) => {
		let result;
		let txInfo;
		console.log('deposit clicked');
		try{
			const web3 = await getWeb3();
			const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
			console.log('token map', tokenMap);
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
			console.log('tokenString:', tokenString, tokenMap[tokenString].decimals);
			const activeAccount = await web3.currentProvider.selectedAddress;
			const balance = await getBalance(tokenAddress, tokenMap[tokenString].decimals, tokenString, activeAccount);
			const amount = prompt("enter amount to deposit, max:", balance);
			const amountInBase = getAmountBase(amount, tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
			console.log("amountInGwei", amountInBase);
			console.log(getAmountBase(amount, tokenMap[tokenString].decimals));
			let parameter = {};
			if(!isETH){
				const allowance = await getAllowance(erc20Instance, poolAddress, activeAccount)
				if(parseInt(amountInBase) > parseInt(allowance)){
					alert("must approve token to deposit");
					await this.approve(erc20Instance, poolAddress, activeAccount, amountInBase, tokenString);
				}
				parameter = {
					from: activeAccount,
					gas: web3.utils.toHex(1000000),
					gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
				};
			}

			else {
				parameter = {
					from: activeAccount,
					gas: web3.utils.toHex(1000000),
					gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
					value: amountInBase
				};
			}

			let PoolTrackerInstance = new web3.eth.Contract(
				PoolTracker.abi,
				poolTrackerAddress,
			);

			console.log('poolTracker', poolTrackerAddress);
			console.log(PoolTrackerInstance.options.address);
			txInfo = {txHash: '', success: '', amount: amount, tokenString: tokenString, type:"DEPOSIT", poolAddress: poolAddress};
			result = await PoolTrackerInstance.methods.addDeposit(amountInBase, tokenAddress, poolAddress, isETH).send(parameter, (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
				this.props.updatePendingTx({txHash: transactionHash, amount: amount, tokenString: tokenString, type:"DEPOSIT", poolAddress: poolAddress});
				txInfo.txHash = transactionHash;

			});
			txInfo.success = true;
		}
		catch (error) {
			console.error(error);
		}
		console.log('txInfo', txInfo);
		this.displayTxInfo(txInfo);
	}

	withdrawDeposit = async(poolAddress, tokenAddress, tokenMap, poolTrackerAddress, userBalance) => {
		let result;
		let txInfo;
		console.log('withdraw deposit clicked');
		try{
			const web3 = await getWeb3();
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);

			let balance = userBalance / 10**tokenMap[tokenString].decimals;
			balance = Number.parseFloat(balance).toPrecision(6);

			const amount = prompt("enter amount to withdraw, pool balance:", balance);
			//const donateAmount = prompt("enter amount to donate if desired");
			const amountInBase = getAmountBase(amount, tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
			const activeAccount = await web3.currentProvider.selectedAddress;
			//const donateAmountInGwei = getAmountBase(donateAmount, tokenMap[tokenString].decimals);//web3.utils.toWei(donateAmount, 'ether');

			const parameter = {
				from: activeAccount,
				gas: web3.utils.toHex(1000000),
				gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
			};

			let PoolTrackerInstance = new web3.eth.Contract(
				PoolTracker.abi,
				poolTrackerAddress,
			);

			console.log('amount to withdraw', amountInBase, amount);
			txInfo = {txHash: '', success: false, amount: amount, tokenString: tokenString, type:"WITHDRAW", poolAddress: poolAddress};
			result = await PoolTrackerInstance.methods.withdrawDeposit(amountInBase, tokenAddress, poolAddress).send(parameter , (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
				this.props.updatePendingTx({txHash: transactionHash, amount: amount, tokenString: tokenString, type:"WITHDRAW", poolAddress: poolAddress});
				txInfo.txHash = transactionHash;
			});
			txInfo.success = true;
		}
		catch (error) {
			console.error(error);
		}
		this.displayTxInfo(txInfo);
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

	approve = async(erc20Instance, address, activeAccount, amountInGwei, tokenString) => {
		let result;
		let txInfo;
		try{
			const web3 = await getWeb3();
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
		await this.delay(5000);
		this.props.updateTxResult('');
	}
	delay = (delayInms) => {
		return new Promise(resolve => {
		  setTimeout(() => {
			resolve(2);
		  }, delayInms);
		});
	}
	getTotalBalancesInUSD = (acceptedTokenInfo) => {
		if (!acceptedTokenInfo) return 'no data';

		let totalBalance = 0.0;

		for(let i = 0; i < acceptedTokenInfo.length; i++){
			const item = acceptedTokenInfo[i];
			const tokenString = item.acceptedTokenString;
			const priceUSD = this.props.tokenMap[tokenString] && this.props.tokenMap[tokenString].priceUSD;
			const totalDeposits = this.precise(item.totalDeposits, item.decimals);
			totalBalance += totalDeposits * priceUSD;
		}
		totalBalance = totalBalance.toFixed(2);

		if(isNaN(totalBalance)){
			return "0.00";
		}
		return totalBalance;
	}

	getUserBalancesInUSD = (acceptedTokenInfo) => {
		if (!acceptedTokenInfo) return 'no data';

		let userBalance = 0.0;

		for(let i = 0; i < acceptedTokenInfo.length; i++){
			const item = acceptedTokenInfo[i];
			const tokenString = item.acceptedTokenString;
			const priceUSD = this.props.tokenMap[tokenString] && this.props.tokenMap[tokenString].priceUSD;
			const userDeposits = this.precise(item.userBalance, item.decimals);
			userBalance += userDeposits * priceUSD;
		}
		userBalance = userBalance.toFixed(2);

		if(isNaN(userBalance)){
			return "0.00";
		}
		return userBalance;
	}

	displayLogo = (acceptedTokenString) => {
		let logo = '';
		if(acceptedTokenString === 'ETH'){
			logo = <EthLogo/>;
		}
		else if (acceptedTokenString === 'USDT'){
			logo = <TetherLogo/>;
		}
		else if (acceptedTokenString === 'USDC'){
			logo = <UsdcLogo/>;
		}
		else if (acceptedTokenString === 'WBTC'){
			logo = <WbtcLogo/>;
		}
		else if (acceptedTokenString === 'DAI'){
			logo = <DaiLogo/>;
		}
		else if (acceptedTokenString === 'AAVE'){
			logo = <AaveLogo/>;
		}

		return logo;
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

		const userBalance = this.getUserBalancesInUSD(acceptedTokenInfo);
		const totalBalance = this.getTotalBalancesInUSD(acceptedTokenInfo);
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
								<p className="mb0">{"your contribution: $" + userBalance}</p>
								<p className="mb0">{"total contribution: $"+ totalBalance}</p>
								<div className="card__open-button" onClick={this.toggleCardOpen}><Icon name={"plus"} size={32}/></div>
				</div>
				</div>
						<div className="card__body">
								{tokenButtons}
								{tokenInfo}
						</div>
				<div className="card__bar"/>
      		</div>
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
})

const mapDispatchToProps = dispatch => ({
	updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Card)
