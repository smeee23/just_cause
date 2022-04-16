import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Footer from "../components/Footer";
import Shapes from '../components/Shapes';

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
								<h1 style={{marginBottom: "0px",}} >JustCause</h1>
								<h2 style={{fontSize:17}} >Future of crowdfunding</h2>
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
