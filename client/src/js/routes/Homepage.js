import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Button from '../components/Button'
import Footer from "../components/Footer";
import Shapes from '../components/Shapes'

import { updateDaiAddress } from "../actions/daiAddress";

class Homepage extends Component {
	componentDidMount() {
		window.scrollTo(0,0);
	}

	render() {
		return (
			<Fragment>
				<Shapes/>
				<Footer/>
				<article>
					<section className="page-section page-section--center horizontal-padding">
						<h1>Donate interest earned in crypto to good causes with JustCause.</h1>
						<Button text={ this.props.daiAddress } icon="wallet" callback={ () => this.props.updateDaiAddress('Updated Address') }/>
					</section>
					<section className="page-section horizontal-padding">
						<h2>How it works</h2>
						<div className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">JustCause allows you to leverage the power of smart contracts to donate ETH to charities. Join charity pools with your friends and JustCause will automatically donate interest earned on any ETH added to the pool.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
							</div>
						</div>
					</section>
					<section className="page-section bw0 horizontal-padding">
						<div className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<h2>Find us elsewhere</h2>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="lh1 mb0">
									<a href="google.com" target="_blank">Facebook</a> /&nbsp;
									<a href="google.com" target="_blank">Instagram</a> /&nbsp;
									<a href="google.com" target="_blank">Twitter</a>
								</p>
							</div>
						</div>
					</section>
				</article>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ({
	daiAddress: state.daiAddress,
})

const mapDispatchToProps = dispatch => ({
	updateDaiAddress: (s) => dispatch(updateDaiAddress(s)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Homepage)
