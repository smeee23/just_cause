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

import {deposit, withdrawDeposit, claim} from '../func/contractInteractions';

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
		return <Button text="Withdraw Deposit" callback={async() => await withdrawDeposit(address, item.address,  this.props.tokenMap, this.props.poolTrackerAddress, item.userBalance)}/>
		}
	}

	displayClaim = (item, address) => {
		if(item.unclaimedInterest > 0){
			return <Button text="Claim Interest" callback={async() => await claim(address, item.address, this.props.poolTrackerAddress)}/>
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

	createTokenInfo = (address, receiver, acceptedTokenInfo) => {
		if (!acceptedTokenInfo) return 'no data';
		if (!this.props.tokenMap) return 'no token data';

		const item = acceptedTokenInfo[this.state.selectedTokenIndex];

		const isETH = (item.acceptedTokenString === 'ETH') ? true : false;
		const tokenInfo =
			<div className="card__body" key={item.acceptedTokenString}>
				<div className="card__body__column">
				<h3 className="mb0">{item.acceptedTokenString } </h3>
				{this.displayLogo(item.acceptedTokenString)}
					<p>{"address: " + address.slice(0, 6) + "..."+address.slice(-4)+' '}</p>
					<p>{"receiver: "+receiver.slice(0, 6) + "..."+receiver.slice(-4)+' '}</p>
					<p>{"APY: "+ this.getAPY(item.depositAPY)}</p>
					<Button text="Contribute" callback={async() => await deposit(address, item.address, isETH, this.props.tokenMap, this.props.poolTrackerAddress)}/>
					{this.displayWithdraw(item, address)}
				</div>
				<div className="card__body__column">
					<p>{"user balance: "+this.precise(item.userBalance, item.decimals)}</p>
					<p>{"total balance: "+this.precise(item.totalDeposits, item.decimals)}</p>
					<p>{"amountScaled: "+item.amountScaled}</p>
					<p>{"liq Index: "+item.liquidityIndex}</p>
					<p>{"atokens: "+ this.rayMul(item.amountScaled, item.reserveNormalizedIncome/*this.props.tokenMap[item.acceptedTokenString].liquidityIndex*/)}</p>
					<p>{"user interest earned: "+ (this.rayMul(item.amountScaled, item.reserveNormalizedIncome) - item.userBalance)}</p>
					<p>{"claimed donation: "+this.precise(item.claimedInterest, item.decimals)}</p>
					<p>{"unclaimed donation: "+this.precise(item.unclaimedInterest, item.decimals)}</p>
					{this.displayClaim(item, address)}
				</div>
			</div>
		return tokenInfo;
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

		const userBalance = this.getUserBalancesInUSD(acceptedTokenInfo);
		const totalBalance = this.getTotalBalancesInUSD(acceptedTokenInfo);
		const tokenButtons = this.createTokenButtons(acceptedTokenInfo);
		const tokenInfo = this.createTokenInfo(address, receiver, acceptedTokenInfo);

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
})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(Card)
