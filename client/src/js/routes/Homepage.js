import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Footer from "../components/Footer";
import Shapes from '../components/Shapes';

import LogoCard from "../components/logos/LogoCard";
import { Button } from '../components/Button';
import ShareModal from "../components/modals/ShareModal";
import {SmallModal } from "../components/Modal";
import { updateShare } from  "../actions/share";

class Homepage extends Component {
	componentDidMount() {
		window.scrollTo(0,0);
	}

	getShareModal = () => {
		if(this.props.share){
			console.log("reached 2");
			let modal = <SmallModal isOpen={true}><ShareModal info={this.props.share}/></SmallModal>
			return modal;
		}
	}

	share = async() => {
		console.log("reached 1");
		await this.props.updateShare("");
		await this.props.updateShare({poolAddress: "homepage", name: "JustCause"});
	}
	render() {
		return (
			<Fragment>
				<Shapes/>

				<Footer/>
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
											<div style={{marginLeft: "20px"}}>
												<Button share="share" callback={async() => await this.share()}/>
											</div>
										</div>
									</div>
							    </div>
						</div>
					</section>
					{this.getShareModal()}
			</Fragment>
		);
	}
}

const mapStateToProps = state => ({
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
	share: state.share,
})

const mapDispatchToProps = dispatch => ({
	updateShare: (share) => dispatch(updateShare(share)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Homepage)
