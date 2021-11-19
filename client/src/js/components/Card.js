import React, {Component} from "react"
import classNames from "classnames";
//import { Fragment } from "react";

import Icon from "./Icon";
import palette from "../utils/palette";

import Button from '../components/Button'

class Card extends Component {

	constructor(props) {
		super(props);

		this.state = {
			open: false
		}
	}

  componentDidMount() {
		window.scrollTo(0,0);
	}

	approve = () => {
		console.log('approve clicked');
	}

	deploy = () => {
		console.log('deploy clicked');
	}

	deposit = () => {
		console.log('deposit clicked');
	}

	withdrawDeposit = () => {
		console.log('withdraw deposit clicked');
	}

	precise = (x) => {
		//return Number.parseFloat(x).toPrecision(4);
		return Number.parseFloat(x).toPrecision(6);
	}

	toggleCardOpen = () => {
		this.setState({
			open: !this.state.open
		})
	}

	createTokenInfo = (address, onDeposit, onWithdrawDeposit, onClaim, receiver, acceptedTokenInfo) => {
		if (!acceptedTokenInfo) return 'no data';
		let infoHolder = [];
		for(let i = 0; i < acceptedTokenInfo.length; i++){
			const item = acceptedTokenInfo[i];
			infoHolder.push(
				<div className="card__body" key={item.acceptedTokenString}>
					<div className="card__body__column">

					<h3 className="mb0">{ item.acceptedTokenString }</h3>
						<p>{"address: " + address.slice(0, 6) + "..."+address.slice(-4)}</p>
						<p>{"receiver: "+receiver.slice(0, 6) + "..."+receiver.slice(-4)}</p>
						<p>{"user balance: "+this.precise(item.userBalance)}</p>
						<p>{"total balance: "+this.precise(item.totalDeposits)}</p>
						<Button text="Contribute" callback={() => onDeposit(address, item.address)}/>
						<Button text="Withdraw Deposit" callback={() => onWithdrawDeposit(address, item.address)}/>
					</div>
					<div className="card__body__column">
						<p>{"claimed donation: "+this.precise(item.claimedInterest)}</p>
						<p>{"unclaimed donation: "+this.precise(item.unclaimedInterest)}</p>
						<Button text="Claim Interest" callback={() => onClaim(address, item.address)}/>
					</div>
          		</div>
			);
		}
		return infoHolder;
	}

	render() {
		const { title, idx, address, onDeposit, onWithdrawDeposit, onClaim, receiver, acceptedTokenInfo} = this.props;

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

		/*const tokenInfo = acceptedTokenInfo.map((item) =>
				<div className="card__body" key={item.acceptedTokenString}>
					<div className="card__body__column">

					<h3 className="mb0">{ item.acceptedTokenString }</h3>
						<p>{"address: " + address.slice(0, 6) + "..."+address.slice(-4)}</p>
						<p>{"receiver: "+receiver.slice(0, 6) + "..."+receiver.slice(-4)}</p>
						<p>{"user balance: "+this.precise(item.userBalance)}</p>
						<p>{"total balance: "+this.precise(item.totalDeposits)}</p>
						<Button text="Contribute" callback={() => onDeposit(address, item.address)}/>
						<Button text="Withdraw Deposit" callback={() => onWithdrawDeposit(address, item.address)}/>
					</div>
					<div className="card__body__column">
						<p>{"claimed donation: "+this.precise(item.claimedInterest)}</p>
						<p>{"unclaimed donation: "+this.precise(item.unclaimedInterest)}</p>
						<Button text="Claim Interest" callback={() => onClaim(address, item.address)}/>
					</div>
          		</div>
		);*/

		let tokenInfo = [];

		let formatUserBalance = 0;
		let formatTotalDeposits = 0;
		if(acceptedTokenInfo){
			formatUserBalance = acceptedTokenInfo[0].userBalance
			formatTotalDeposits = acceptedTokenInfo[0].totalDeposits
		}

		tokenInfo = this.createTokenInfo(address, onDeposit, onWithdrawDeposit, onClaim, receiver, acceptedTokenInfo);

		return (
      <div className={classnames}>
        <div className="card__header">
					<Icon name={randomPoolIcon.name} size={32} color={randomPoolIcon.color} strokeWidth={3}/>
          <h3 className="mb0">
						{ title }
					</h3>
          <div className="card__header--right">
						<p className="mb0">{"your balance: " + this.precise(formatUserBalance) + ","}</p>
						<p className="mb0">{"total deposits: "+this.precise(formatTotalDeposits)}</p>
						<div className="card__open-button" onClick={this.toggleCardOpen}><Icon name={"plus"} size={32}/></div>
          </div>
        </div>
				<div className="card__body">
						{tokenInfo}
          		</div>
        <div className="card__bar"/>
      </div>
		);
	}
}

export default Card
