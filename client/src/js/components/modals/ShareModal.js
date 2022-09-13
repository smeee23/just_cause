import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import { Button } from '../Button'

import { updateTokenMap } from "../../actions/tokenMap"

import {twitterShare, facebookShare, linkedInShare, copyToClipboard} from '../../func/ancillaryFunctions';

class ShareModal extends Component {


  constructor(props) {
		super(props);

		this.state = {
			copied: false,
		}
	}

  copyToClipboard = (receiver) => {
		copyToClipboard(receiver);

		this.setState({
			copied: true,
		});
	}

  getCopyButton = (url) => {
		if(this.state.copied){
			return (
        <div title="copy receiving address to clipboard"><Button copyPaste_check="copy" disable="true" callback={() => this.copyToClipboard(url)}/></div>
      );
		}
		return (
			<div title="copy receiving address to clipboard"><Button copyPaste="copy" disable="true" callback={() => this.copyToClipboard(url)}/></div>
		);
	}

  getBody = (info) => {
    if(info.poolAddress === "homepage"){
      return(
        <div style={{display: "flex", flexDirection: "wrap", gap: "10px"}}>
            <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">"The probability that we may fall in the struggle ought not to deter us from the support of a cause we believe to be just; it shall not deter me."  - Abraham Lincoln</p>
            <Button tweet_d="tweet_d" callback={() => twitterShare("https://www.justcause.finance/#/", "Create and donate to fundraisers without spending your hard earned crypto with JustCause \n @JustCauseDev \n", "")}/>
            <Button facebook="facebook" callback={() => facebookShare("https://www.justcause.finance/#/", "")} />
            <Button linkedin="linkedin" callback={() => linkedInShare("https://www.justcause.finance/#/", "Create and donate to fundraisers without spending your hard earned crypto with JustCause \n @JustCauseDev \n", "", "test")}/>
            {this.getCopyButton("https://www.justcause.finance/#/")}
          </div>
      );
    }
    else{
      return(
        <div style={{display: "flex", flexDirection: "wrap", gap: "10px"}}>
            <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Share {info.name} with friends, family, and other like-minded individuals</p>
            <Button tweet_d="tweet_d" callback={() => twitterShare("https://www.justcause.finance/#/just_cause/search?address=", "Donate to "+info.name+" with lossless donations at JustCause crowdfunding \n @JustCauseDev \n", info.poolAddress)}/>
            <Button facebook="facebook" callback={() => facebookShare("https://www.justcause.finance/#/just_cause/search?address=", info.poolAddress)} />
            <Button linkedin="linkedin" callback={() => linkedInShare("https://www.justcause.finance/#/just_cause/search?address=", "Donate to "+info.name, info.poolAddress, "test")}/>
            {this.getCopyButton("https://www.justcause.finance/#/just_cause/search?address="+info.poolAddress)}
          </div>
      );
    }
  }
  render() {
        const { info } = this.props;
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Share {info.name}</h2>
        </ModalHeader>
        <ModalCtas>
          {this.getBody(info)}
        </ModalCtas>
      </Fragment>
		);
	}
}

const mapStateToProps = state => ({
  	tokenMap: state.tokenMap,
	poolTrackerAddress: state.poolTrackerAddress,
 	approve: state.approve,
	activeAccount: state.activeAccount,
})

const mapDispatchToProps = dispatch => ({
    updateTokenMap: (res) => dispatch(updateTokenMap(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ShareModal)