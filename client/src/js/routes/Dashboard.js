import React, {Component} from "react"
import { Fragment } from "react";

import Card from '../components/Card'
//import Button from '../components/Button'

//import getWeb3 from "../../getWeb3";
//import JCPool from "../../contracts/JustCausePool.json"

class Dashboard extends Component {
	componentDidMount = async () => {
		window.scrollTo(0,0);
	}

	render() {

		const {poolInfo, onApprove, onDeposit, onWithdrawDeposit, onClaim} = this.props;
		const listItems = poolInfo.map((pt) => <Card

								key={pt.address}
								title="test charity"
								address={pt.address}
								userBalance={pt.activeUserBalance}
								onApprove = {onApprove}
								onDeposit = {onDeposit}
								onWithdrawDeposit = {onWithdrawDeposit}
								onClaim = {onClaim}
														  />
														  );
		return (
			<Fragment>
				<article>
					<section className="page-section page-section--center horizontal-padding bw0">
					{listItems}
					</section>
				</article>
			</Fragment>
		);
	}
}

export default Dashboard
