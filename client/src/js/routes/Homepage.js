import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Footer from "../components/Footer";
import Shapes from '../components/Shapes';
import Circle from "../components/cryptoLogos/Circle";

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
						<Circle />
					</section>
					<section style={{paddingTop: "120px"}} className="page-section horizontal-padding">
						<h2 style={{margin:'auto', fontSize:50, paddingBottom: "50px"}}>What We Do</h2>
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">JustCause allows you to leverage the power of decentralized finance (Defi) to fund causes that are important to you. We use an innovative funding mechanism to allow users to contribute to public goods, charitible organizations, DAOs, local/global/personal injustice, and much more! Create and fund pools with your friends and JustCause smart contracts donate funds while preserving your initial deposit.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">Users participate as Contributors or Pool Creators. Pool Creators generate JustCause Pools which represent a cause in need of funding. Contributors deposit tokens into JustCause Pools which in turn deposit them into lending protocols. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds they simply withdraw their original deposit and the interest accrued is left behind for the cause.</p>
							</div>
						</div>
					</section>
					<section className="page-section horizontal-padding">
						<h2 style={{margin:'auto', fontSize:50,  paddingBottom: "50px"}}>Why We Do It</h2>
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">JustCause is an open source, permissionless and non-custodial protocol. This means that anyone has the freedom to create or contribute to pools with a user interface or interact directly with the smart contracts on the network. This freedom lies at the heart of the difference between permissioned (closed) and permissionless (open) systems.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">Our mission is to give users the freedom to create and fund any cause they deem worthy. Crowdfunding mechanisms based on traditional financial payment networks are inherently permissioned and custodial. This leaves the funds and users of these systems vulnerable to financial censorship. We want to solve this problem.</p>
							</div>
						</div>
					</section>
					<section className="page-section horizontal-padding">
						<h2 style={{margin:'auto', fontSize:50, paddingBottom: "50px"}}>How We Do It</h2>
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">JustCause Pools generate interest through an integration with the Aave lending protocol. Aave can be thought of as an automated system of liquidity pools. Users deposit tokens they want to lend out, which are amassed into a large lending pool. Borrowers may then draw from these pools by taking out collateralized loans. In exchange for providing liquidity to the market lenders earn a passive rate of interest on their deposits.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">The Aave Protocol has been audited, secured, and has an ongoing bug bounty program. The protocol is completely open source, allowing anyone to interact and build on top of it. Every possible step has been taken to minimize the risk as much as possible. However, no platform can be considered entirely risk free. Please see the Risks section for more details.</p>
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
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
})

const mapDispatchToProps = dispatch => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(Homepage)
