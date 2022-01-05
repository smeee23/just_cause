import React, {Component} from "react"
import classNames from "classnames";
//import { Fragment } from "react";

import { connect } from "react-redux";

import Icon from "./Icon";
import palette from "../utils/palette";

import Button from '../components/Button';

import getWeb3 from "../../getWeb3NotOnLoad.js";
import JCPool from "../../contracts/JustCausePool.json";
import ERC20Instance from "../../contracts/IERC20.json";
//import {deposit, claim, withdrawDonations} from '../func/contractInteractions';

class Card extends Component {

	constructor(props) {
		super(props);

		this.state = {
			open: false,
			selectedTokenIndex: 0
		}
	}

  componentDidMount() {
		window.scrollTo(0,0);
	}

	/*onDeposit = async(poolAddress, address, isETH) => {
		console.log('deposit clicked');
		await deposit(poolAddress, address, isETH);
	}*/

	approve = async(erc20Instance, address, activeAccount, amountInGwei) => {
		const web3 = await getWeb3();
		console.log('approve clicked');
		const parameter = {
			from: activeAccount ,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
			};
		console.log(typeof amountInGwei);
		const amount = '10000000000000000000000000000000';
		let results_1 = await erc20Instance.methods.approve(address, amount).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			});
		console.log("approve", results_1);
	}

	getAllowance = async(erc20Instance, address, activeAccount) => {
		const allowance = await erc20Instance.methods.allowance(activeAccount, address).call();
		console.log("allowance", allowance, typeof allowance);
		return allowance;
	}

	getWalletBalance = async(tokenAddress) => {
		const web3 = await getWeb3();
		const activeAccount = await web3.currentProvider.selectedAddress;
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		const balance = await erc20Instance.methods.balanceOf(activeAccount).call();
		return balance;
	}

	getAmountBase = (amount, decimals) => {
		console.log('amount in base', amount*10**decimals);
		return (amount*10**decimals).toString();
	}

	deposit = async(address, tokenAddress, isETH) => {
		console.log('deposit clicked');
		const web3 = await getWeb3();
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		console.log('token map', this.props.tokenMap);
		const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === tokenAddress);
		console.log('tokenString:', tokenString, this.props.tokenMap[tokenString].decimals);
		const amount = prompt("enter amount to deposit");
		const amountInBase = this.getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
		const activeAccount = await web3.currentProvider.selectedAddress;
		console.log("amountInGwei", amountInBase);
		console.log(this.getAmountBase(amount, this.props.tokenMap[tokenString].decimals));
		if(!isETH){
			const allowance = await this.getAllowance(erc20Instance, address, activeAccount)
			if(parseInt(amountInBase) > parseInt(allowance)){
				alert("must approve token to deposit");
				console.log("approve test", parseInt(amountInBase), parseInt(allowance), (parseInt(amountInBase) > parseInt(this.getAllowance(erc20Instance, address, activeAccount))))
				await this.approve(erc20Instance, address, activeAccount, amountInBase);
			}
		}
		else{
			console.log("else");
		}
		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};
		const parameterETH = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
			value: amountInBase
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			address,
		);

		console.log(JCPoolInstance.options.address);
		if(!isETH){
			await JCPoolInstance.methods.deposit(tokenAddress, amountInBase).send(parameter, (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
			});
		}
		else{
			await JCPoolInstance.methods.depositETH(tokenAddress).send(parameterETH, (err, transactionHash) => {
				console.log('Transaction Hash :', transactionHash);
			});
		}
		console.log('deposit');
	}

	withdrawDeposit = async(address, tokenAddress) => {
		console.log('withdraw deposit clicked');
		const web3 = await getWeb3();
		const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === tokenAddress);
		const amount = prompt("enter amount to withdraw");
		const donateAmount = prompt("enter amount to donate if desired");
		const amountInBase = this.getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
		const activeAccount = await web3.currentProvider.selectedAddress;
		const donateAmountInGwei = this.getAmountBase(donateAmount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(donateAmount, 'ether');

		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			address,
		);

		console.log('amount to withdraw', amountInBase, amount);
		console.log(JCPoolInstance.options.address, address);
		let result = await JCPoolInstance.methods.withdraw(tokenAddress, amountInBase, donateAmountInGwei).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('withdraw result ' + result[0]);
	}

	claim = async(address, assetAddress) => {
		console.log('claim interest clicked', address);
		const web3 = await getWeb3();
		const activeAccount = await web3.currentProvider.selectedAddress;
		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			address,
		);
		let result = await JCPoolInstance.methods.withdrawDonations(assetAddress).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});

		console.log('claim result', result);
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

	toggleCardOpen = () => {
		this.setState({
			open: !this.state.open
		})
	}

	setSelectedToken = (index) => {
		this.setState({
			selectedTokenIndex: index
		});
		console.log('setSelectedToken', index);
	}

	createTokenButtons = (acceptedTokenInfo) => {
		if (!acceptedTokenInfo) return 'no data';
		let buttonHolder = [];
		for(let i = 0; i < acceptedTokenInfo.length; i++){
			const tokenName = acceptedTokenInfo[i].acceptedTokenString;
			buttonHolder.push(<Button text={tokenName} key={i} callback={() => this.setSelectedToken(i)}/>)
		}
		return buttonHolder;
	}

	createTokenInfo = (address, onDeposit, onWithdrawDeposit, onClaim, receiver, acceptedTokenInfo) => {
		if (!acceptedTokenInfo) return 'no data';
		const item = acceptedTokenInfo[this.state.selectedTokenIndex];
		const isETH = (item.acceptedTokenString === 'ETH') ? true : false;
		const tokenInfo =
			<div className="card__body" key={item.acceptedTokenString}>
				<div className="card__body__column">

				<h3 className="mb0">{ item.acceptedTokenString }</h3>
					<p>{"address: " + address.slice(0, 6) + "..."+address.slice(-4)}</p>
					<p>{"receiver: "+receiver.slice(0, 6) + "..."+receiver.slice(-4)}</p>
					<p>{"user balance: "+this.precise(item.userBalance, item.decimals)}</p>
					<p>{"total balance: "+this.precise(item.totalDeposits, item.decimals)}</p>
					<Button text="Contribute" callback={() => this.deposit(address, item.address, isETH)}/>
					<Button text="Withdraw Deposit" callback={() => this.withdrawDeposit(address, item.address)}/>
				</div>
				<div className="card__body__column">
					<p>{"claimed donation: "+this.precise(item.claimedInterest, item.decimals)}</p>
					<p>{"unclaimed donation: "+this.precise(item.unclaimedInterest, item.decimals)}</p>
					<Button text="Claim Interest" callback={() => this.claim(address, item.address)}/>
				</div>
			</div>
		return tokenInfo;
	}

	render() {
		const { title, about, idx, address, onDeposit, onWithdrawDeposit, onClaim, receiver, acceptedTokenInfo} = this.props;

		console.log('acceptedtokenInfo', acceptedTokenInfo);

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

		//let tokenInfo = [];

		let formatUserBalance = 0;
		let formatTotalDeposits = 0;
		if(acceptedTokenInfo){
			formatUserBalance = this.precise(acceptedTokenInfo[0].userBalance, acceptedTokenInfo[0].decimals);
			formatTotalDeposits = this.precise(acceptedTokenInfo[0].totalDeposits, acceptedTokenInfo[0].decimals);
		}

		let tokenButtons = this.createTokenButtons(acceptedTokenInfo);
		let tokenInfo = this.createTokenInfo(address, onDeposit, onWithdrawDeposit, onClaim, receiver, acceptedTokenInfo);

		return (
			<div className={classnames}>
				<div className="card__header">
							<Icon name={randomPoolIcon.name} size={32} color={randomPoolIcon.color} strokeWidth={3}/>
				<h3 className="mb0">
								{ title }
							</h3>
				<div className="card__header--right">
					<p className="mb0">{ about }</p>
				</div>
				<div className="card__header--right">
								<p className="mb0">{"your balance: " + formatUserBalance + ","}</p>
								<p className="mb0">{"total deposits: "+formatTotalDeposits}</p>
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
})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(Card)
