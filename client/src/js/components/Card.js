import React, {Component} from "react"
import classNames from "classnames";
//import { Fragment } from "react";

import Icon from "./Icon";
import palette from "../utils/palette";

import Button from '../components/Button';

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

	withdrawDeposit = () => {
		console.log('withdraw deposit clicked');
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
					<Button text="Contribute" callback={() => onDeposit(address, item.address, isETH)}/>
					<Button text="Withdraw Deposit" callback={() => onWithdrawDeposit(address, item.address)}/>
				</div>
				<div className="card__body__column">
					<p>{"claimed donation: "+this.precise(item.claimedInterest, item.decimals)}</p>
					<p>{"unclaimed donation: "+this.precise(item.unclaimedInterest, item.decimals)}</p>
					<Button text="Claim Interest" callback={() => onClaim(address, item.address)}/>
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
						</div>
						<p></p>
						<div className="card__body">
								{tokenInfo}
						</div>
				<div className="card__bar"/>
      		</div>
		);
	}
}

export default Card
