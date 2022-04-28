import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Footer from "../components/Footer";
import Shapes from '../components/Shapes';
import MaleOne from "../components/icons/MaleOne";
import FemaleOne from "../components/icons/FemaleOne";
import FemaleTwo from "../components/icons/FemaleTwo";
import Arrow from "../components/icons/Arrow";
import Charity from "../components/icons/Charity";
import LogoCard from "../components/logos/LogoCard"
import AaveLogo from "../components/cryptoLogos/AaveLogoLg"

import EthLogo from "../components/cryptoLogos/EthLogo"
import MaticLogo from "../components/cryptoLogos/MaticLogo"
import UsdcLogo from "../components/cryptoLogos/UsdcLogo"

import { Button } from '../components/Button';

class Homepage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedSlide: 0,
		}
	}

	componentDidMount() {
		window.scrollTo(0,0);
	}

	createOptionButtons = () => {
		let buttonHolder = [];
		buttonHolder.push(<Button text={'<= Back'} key={1} callback={() => this.decrementSlide()}/>);
		buttonHolder.push(<Button text={'Next =>'} key={2} callback={() => this.incrementSlide()}/>);
		return buttonHolder;
	}

	incrementSlide = () => {
		let selectedSlide = this.state.selectedSlide + 1;
		console.log(selectedSlide)
		if(selectedSlide > 5){
			selectedSlide = 0;
		}
		this.setState({selectedSlide});
	}

	decrementSlide = () => {
		let selectedSlide = this.state.selectedSlide - 1;
		if(selectedSlide < 0){
			selectedSlide = 5;
		}
		this.setState({selectedSlide});
	}

	getSlide = () => {
		const slide = this.state.selectedSlide;
		let graphic;
		if(slide === 0){
		 graphic =

				<div style={{height: "500px", flexWrap: "wrap", display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "5px", gridTemplateRows: "repeat(2, auto)", alignItems:"center", justifyContent:"center"}}>
					<h2 style={{fontSize:17, fontStyle: "italic", width:"150px", textAlign: "left", marginLeft: "10px", marginBottom: "-30px", marginTop: "30px"}}>"Don't you want to save the Rainforest?"</h2>
					<h2 style={{fontSize:17, fontStyle: "italic", paddingRight: "300px", textAlign: "right", marginRight: "10px", marginBottom: "-30px", marginTop: "30px"}}>"Yeah but I don't want to spend my sound crypto money!"</h2>
					<MaleOne/>
					<FemaleOne/>
				</div>
		}
		else if(slide === 1){
			graphic =

				<div style={{ height: "500px", flexWrap: "wrap", display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "5px", gridTemplateRows: "repeat(1, auto)", alignItems:"center", justifyContent:"center"}}>
					<div style={{gridColumn: "1", gridRow: "1"}}>
						<h1 style={{fontSize: 60, marginLeft: "50px", textAlign: "left"}}>Lossless Donations</h1>
						<h2 style={{fontSize:17, marginLeft: "50px", textAlign: "left", paddingRight: "50px", marginRight: "10px", marginTop: "30px"}}>Create and fund pools with your friends and family and JustCause smart contracts donate crypto while preserving your initial deposit.</h2>
					</div>
					<MaleOne/>
				</div>
		}
		else if(slide === 2){
			graphic =

				<div style={{height: "500px", flexWrap: "wrap", display: "grid", gridTemplateColumns: "repeat(7, auto)", gap: "5px", gridTemplateRows: "repeat(2, auto)", alignItems:"center", justifyContent:"center"}}>
					<div style={{gridColumn: "1 / 8", gridRow: "1", alignItems:"center", justifyContent:"center"}}>
					<h2 style={{fontSize:17, marginLeft: "50px", textAlign: "center", paddingRight: "50px", marginRight: "10px", marginTop: "30px"}}>Contributors deposit tokens into JustCause Pools which in turn deposit them into Aave lending protocol. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds they simply withdraw their original deposit and the interest accrued is left behind for the cause.</h2>
					</div>
					<div style={{gridColumn: "1", gridRow: "2"}}>
						<FemaleTwo/>
					</div>
					<div style={{gridColumn: "2", gridRow: "2"}}>
						<Arrow/>
						<div>
							<EthLogo/>
							<UsdcLogo/>
							<MaticLogo/>
						</div>
					</div>
					<div style={{gridColumn: "3", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
						<LogoCard/>
						<h2 style={{marginTop: "5px"}} className="mb0">JustCause</h2>
					</div>
					<div style={{gridColumn: "4", gridRow: "2"}}>
						<Arrow/>
						<div>
							<EthLogo/>
							<UsdcLogo/>
							<MaticLogo/>
						</div>
					</div>
					<div style={{gridColumn: "5", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
						<AaveLogo/>
						<h2 style={{marginTop: "5px"}} className="mb0">AAVE</h2>
					</div>
					<div style={{gridColumn: "6", gridRow: "2", display: "flex", flexDirection: "column"}}>
						<Arrow/>
						<div>
							<EthLogo/>
							<UsdcLogo/>
							<MaticLogo/>
						</div>
					</div>
					<div style={{gridColumn: "7", gridRow: "2"}}>
						<Charity/>
					</div>
				</div>
		}
		else if(slide === 3){
			graphic =

				<div style={{height: "500px", flexWrap: "wrap", display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "5px", gridTemplateRows: "repeat(1, auto)", alignItems:"center", justifyContent:"center"}}>
					<div style={{gridColumn: "1", gridRow: "1"}}>
						<h2 style={{fontSize:25, textAlign: "left", marginLeft: "50px", paddingRight: "50px", marginRight: "10px", marginTop: "30px"}}>Fundraising on JustCause is simple and frictionless</h2>
						<h2 style={{fontSize:17, textAlign: "left", marginLeft: "60px", paddingRight: "50px", marginRight: "10px", marginTop: "30px"}}>- Create a pool in just a few minutes</h2>
						<h2 style={{fontSize:17, textAlign: "left", marginLeft: "60px", paddingRight: "50px", marginRight: "10px", marginTop: "30px"}}>- we want to give you the tools to fund and share your inspiration with the world.</h2>
						<h2 style={{fontSize:17, textAlign: "left", marginLeft: "60px", paddingRight: "50px", marginRight: "10px", marginTop: "30px"}}>- open source, permissionless and non-custodial protocol</h2>
					</div>
					<div style={{gridColumn: "2", gridRow: "1"}}>
						<LogoCard/>
						<Charity/>
					</div>
				</div>
		}
		else if(slide === 4){
			graphic =

				<div style={{height: "500px", flexWrap: "wrap", display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "5px", gridTemplateRows: "repeat(1, auto)", alignItems:"center", justifyContent:"center"}}>
					<div style={{gridColumn: "1", gridRow: "1"}}>
						<FemaleOne/>
					</div>
					<div style={{gridColumn: "2", gridRow: "1"}}>
						<h2 style={{fontSize:25, textAlign: "left", paddingRight: "50px", marginRight: "10px", marginTop: "30px"}}>donating to causes you feel passionate about has never been easier</h2>
						<h2 style={{fontSize:17, textAlign: "left", marginLeft: "10px", paddingRight: "50px", marginRight: "10px", marginTop: "30px"}}>- contribute to public goods, charitible organizations, DAO's, and much more!</h2>
						<h2 style={{fontSize:17, textAlign: "left", marginLeft: "10px", paddingRight: "50px", marginRight: "10px", marginTop: "30px"}}>- lossless donations on faster and cheaper layer 2 solutions allow users to give at almost no cost to themselves</h2>
					</div>
				</div>
		}
		else if(slide === 5){
			graphic =
				<div style={{marginTop:"0px", paddingtop:"0px", height: "500px", display: "flex", alignItems:"center", justifyContent:"center"}}>
					<div style={{gridColumn: "2", gridRow: "1", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
						<h2 style={{fontSize:25, marginTop: "100px"}}>come join the future of crowdfunding with...</h2>
						<h2 style={{fontSize:60, marginTop: "30px"}}>JustCause</h2>
						<LogoCard/>
						<h2 style={{fontSize:17, marginTop: "50px"}}>Head over to the dashboard to get started funding</h2>
					</div>
				</div>
		}
		return graphic;
	}

	render() {
		const optionButtons = this.createOptionButtons();
		return (
			<Fragment>
				<Footer/>
				<article>
						<div style={{display:"flex", paddingTop:"100px", marginBottom:"5px",  alignItems:"center", justifyContent:"center"}}>
							{optionButtons}
						</div>
						<div style={{marginBottom:"150px",  alignItems:"center", justifyContent:"center"}}>
							{this.getSlide()}
						</div>
					<section className="page-section horizontal-padding">
						<h2 style={{margin:'auto', fontSize:50, paddingBottom: "50px"}}>Lossless Donations</h2>
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
						<h2 style={{margin:'auto', fontSize:50, paddingBottom: "50px"}}>How We Do It</h2>
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">JustCause Pools generate interest through an integration with the Aave lending protocol. Aave can be thought of as an automated system of liquidity pools. Users deposit tokens they want to lend out, which are amassed into a large lending pool. Borrowers may then draw from these pools by taking out collateralized loans. In exchange for providing liquidity to the market lenders earn a passive rate of interest on their deposits.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">The Aave Protocol has been audited, and has an ongoing bug bounty program. It secures tens of billions of dollars of value. The protocol is completely open source, allowing anyone to interact and build on top of it. Every possible step has been taken to minimize the risk as much as possible. However, no platform can be considered entirely risk free. Please see the Risks section for more details.</p>
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
