import React, {Component} from "react"
import { Fragment } from "react";

import Card from '../components/Card'
import Button from '../components/Button'

class Dashboard extends Component {
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

	claim = () => {
		console.log('claim interest clicked');
	}

	render() {
		return (
			<Fragment>
				<article>
					<section className="page-section page-section--center horizontal-padding bw0">
						<Card title="Charity 1"/>
						<Card title="Charity 2"/>
						<Card title="Charity 3"/>
						<Card title="Charity 4"/>
						<Card title="Charity 5"/>
						<Card title="Charity 6"/>
						<Button text="Deploy" icon="wallet" callback={this.deploy}/>
						<Button text="Approve" icon="wallet" callback={this.approve}/>
						<Button text="Deposit" icon="wallet" callback={this.deposit}/>
						<Button text="Withdraw Deposit" icon="wallet" callback={this.withdrawDeposit}/>
						<Button text="Claim Interest" icon="wallet" callback={this.claim}/>
					</section>
				</article>
			</Fragment>
		);
	}
}

export default Dashboard
