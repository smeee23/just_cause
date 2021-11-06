import React, { Component } from "react"
import { connect } from "react-redux"
import { ConnectedRouter } from 'connected-react-router'
import { createBrowserHistory } from 'history'

import routes from './routes'
import { detectMobile } from "./actions/mobile"

//import { load } from "dotenv";

class App extends Component {

	componentDidMount = async() => {
		try {
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
		let history;
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
			history = this.props.history;
		} else {
			history = createBrowserHistory({ basename: '/just_cause' })
		}

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