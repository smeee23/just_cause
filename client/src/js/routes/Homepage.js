import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

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
			let modal = <SmallModal isOpen={true}><ShareModal info={this.props.share}/></SmallModal>
			return modal;
		}
	}

	share = async() => {
		await this.props.updateShare("");
		await this.props.updateShare({poolAddress: "homepage", name: "JustCause"});
	}
	render() {
		return (
			<Fragment>
				<Shapes/>


					<section className="page-section page-section--center horizontal-padding">
						<div style={{width:500, textAlign: "left", height:window.innerHeight/1.2, /*background: "#3FA7D6", border:"20px", borderRadius:"50%",*/ display:"flex", gap:"2", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>

								<div style={{display:"flex", flexDirection: "wrap", alignItems:"center", justifyContent:"center", gap: "8px"}}>
									<LogoCard/>
									<div style={{display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>

										<h1 style={{marginBottom: "5px", marginLeft: "0px"}} >JustCause</h1>
										<h2 style={{marginBottom: "5px", fontSize:17, marginRight: "auto"}} >defi crowdfunding</h2>
										<div style={{marginBottom: "5px", display:"flex", flexDirection: "wrap", alignItems:"left", justifyContent:"left"}}>
											<a title="source code" href="https://github.com/smeee23/just_cause" target="_blank" rel="noopener noreferrer"><Button isLogo="github"/></a>
											<a title="Twitter" style={{marginLeft: "20px"}} href="https://twitter.com/JustCauseDev" target="_blank" rel="noopener noreferrer"><Button isLogo="tweet"/></a>
											{/*<a title="Discord" style={{marginLeft: "20px"}} href="https://docs.justcause.finance/" target="_blank"><Button isLogo="discord"/></a>*/}
											<div title="share JustCause" style={{marginLeft: "20px"}}>
												<Button isLogo="share" callback={async() => await this.share()}/>
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
