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
	render() {
		const { title, address, userBalance, totalDeposits, onDeposit, onWithdrawDeposit, onClaim, interest, receiver } = this.props;

		return (
      <div className="card">
        <div className="card__header">
          <h3 className="mb0"><Logo/>{ title }</h3>
          <div className="card__header--right">
		  	<p className="mb0">{"address: "+address.slice(0, 6) + "..."+address.slice(-4)}</p>
			<p className="mb0">{"your balance: "+userBalance}</p>
			<p className="mb0">{"total deposits: "+totalDeposits}</p>
			<p className="mb0">{"receiver: "+receiver}</p>
            <p className="mb0">Join this pool</p>
			<Button text="Contribute" callback={() => onDeposit(address)}/>
			<Icon name={"plus"} size={32}/>
			<Button text="Withdraw Deposit" callback={() => onWithdrawDeposit(address)}/>
			<p className="mb0">{"unclaimed donation: "+interest}</p>
			<Button text="Claim Interest" callback={() => onClaim(address)}/>
          </div>
        </div>
        <div className="card__bar"/>
      </div>
		);
	}
}

export default Card
