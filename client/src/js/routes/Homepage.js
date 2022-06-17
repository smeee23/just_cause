import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Footer from "../components/Footer";
import Shapes from '../components/Shapes';

import LogoCard from "../components/logos/LogoCard";
import { Button } from '../components/Button';

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
						<div style={{width:500, height:window.innerHeight/1.2, /*background: "#3FA7D6", border:"20px", borderRadius:"50%",*/ display:"flex", gap:"2", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>

								<div style={{display:"flex", flexDirection: "wrap", alignItems:"center", justifyContent:"center"}}>
									<LogoCard/>
									<div style={{display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>

										<h1 style={{marginBottom: "5px", marginLeft: "20px"}} >JustCause</h1>
										<h2 style={{marginBottom: "5px", fontSize:17, marginLeft: "20px", marginRight: "auto"}} >Future of crowdfunding</h2>
										<div style={{marginBottom: "5px", marginLeft: "20px", display:"flex", flexDirection: "wrap", alignItems:"left", justifyContent:"left"}}>
											<a href="https://github.com/smeee23/just_cause" target="_blank"><Button github="github"/></a>
											<a style={{marginLeft: "20px"}} href="https://twitter.com/JustCauseDev" target="_blank"><Button tweet="tweet"/></a>
											<a style={{marginLeft: "20px"}} href="https://docs.justcause.finance/" target="_blank"><Button discord="discord"/></a>
											<a style={{marginLeft: "20px"}} href="https://docs.justcause.finance/" target="_blank"><Button facebook="facebook"/></a>
											<a style={{marginLeft: "20px"}} href="https://docs.justcause.finance/" target="_blank"><Button instagram="instagram"/></a>
										</div>
									</div>
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
