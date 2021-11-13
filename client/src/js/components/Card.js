import React, {Component} from "react"

import Icon from "./Icon";
import Logo from "./Logo";

import Button from '../components/Button'

class Card extends Component {

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

	render() {
		const { title, address, userBalance, totalDeposits, onDeposit, onWithdrawDeposit, onClaim, unclaimedInterest, claimedInterest, receiver } = this.props;

		let formatUserBalance = parseFloat(userBalance) / 1000000000000000000;
		let formatTotalDeposits = parseFloat(totalDeposits) / 1000000000000000000;
		let formatUnclaimedInterest = parseFloat(unclaimedInterest) / 1000000000000000000;
		let formatClaimedInterest = parseFloat(claimedInterest) / 1000000000000000000;


		return (
      <div className="card">
        <div className="card__header">
          <h3 className="mb0"><Logo/>{ title }</h3>
          <div className="card__header--right">
		  	<p className="mb0">{"address: "+address.slice(0, 6) + "..."+address.slice(-4)}</p>
			<p className="mb0">{"your balance: "+this.precise(formatUserBalance)}</p>
			<p className="mb0">{"total deposits: "+this.precise(formatTotalDeposits)}</p>
			<p className="mb0">{"receiver: "+receiver.slice(0, 6) + "..."+receiver.slice(-4)}</p>
			<Button text="Contribute" callback={() => onDeposit(address)}/>
			<Button text="Withdraw Deposit" callback={() => onWithdrawDeposit(address)}/>
			<p className="mb0">{"claimed donation: "+this.precise(formatClaimedInterest)}</p>
			<p className="mb0">{"unclaimed donation: "+this.precise(formatUnclaimedInterest)}</p>
			<Button text="Claim Interest" callback={() => onClaim(address)}/>
          </div>
        </div>
        <div className="card__bar"/>
      </div>
		);
	}
}

export default Card
