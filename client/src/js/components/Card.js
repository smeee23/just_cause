import React, {Component} from "react"
import classNames from "classnames";

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

	render() {
		const { title, idx, address, userBalance, totalDeposits, onDeposit, onWithdrawDeposit, onClaim, unclaimedInterest, claimedInterest, receiver } = this.props;

		let formatUserBalance = parseFloat(userBalance) / 1000000000000000000;
		let formatTotalDeposits = parseFloat(totalDeposits) / 1000000000000000000;
		let formatUnclaimedInterest = parseFloat(unclaimedInterest) / 1000000000000000000;
		let formatClaimedInterest = parseFloat(claimedInterest) / 1000000000000000000;

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
						<div className="card__body__column">
							<p>{"address: " + address.slice(0, 6) + "..."+address.slice(-4)}</p>
							<p>{"receiver: "+receiver.slice(0, 6) + "..."+receiver.slice(-4)}</p>
							<Button text="Contribute" callback={() => onDeposit(address)}/>
							<Button text="Withdraw Deposit" callback={() => onWithdrawDeposit(address)}/>
						</div>
						<div className="card__body__column">
							<p>{"claimed donation: "+this.precise(formatClaimedInterest)}</p>
							<p>{"unclaimed donation: "+this.precise(formatUnclaimedInterest)}</p>
							<Button text="Claim Interest" callback={() => onClaim(address)}/>
						</div>
          </div>
        <div className="card__bar"/>
      </div>
		);
	}
}

export default Card
