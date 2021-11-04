import React, { Component } from "react"
import { connect } from "react-redux";
import { ConnectedRouter } from 'connected-react-router'

import routes from './routes'
import { detectMobile } from "./actions/mobile"

//import { load } from "dotenv";

class App extends Component {

  	componentDidMount = async() => {
		try{
			window.addEventListener('resize', this.props.detectMobile);
		}
		catch (error) {
		// Catch any errors for any of the above operations.
		alert(
			`Failed to load web3, accounts, or contract. Check console for details.`,
		);
		console.error(error);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.props.detectMobile);
	}

	render() {
		const { history } = this.props;
		/*const listItems = this.state.poolInfo.map((pt) =>
							<Card
								key={pt.address}
								title="test charity"
								address={pt.address}
								userBalance={pt.activeUserBalance}
								onApprove = {this.approve}
								onDeposit = {this.deposit}
								onWithdrawDeposit = {this.withdrawDeposit}
								onClaim = {this.claim}
							/>
						  );*/

		/*return(
			<React.Fragment>
			<Button text="Deploy" icon="wallet" callback={this.deploy}/>
			{listItems}
			</React.Fragment>
		)*/
		return (
    	<ConnectedRouter history={history}>
        	{ routes }
      	</ConnectedRouter>

		)
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
})

const mapDispatchToProps = dispatch => ({
	detectMobile: () => dispatch(detectMobile()),
})

export default connect(mapStateToProps, mapDispatchToProps)(App)