import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import { Button } from '../Button'

import { updateTokenMap } from "../../actions/tokenMap"

import {twitterShare, facebookShare, linkedInShare} from '../../func/ancillaryFunctions';

class ShareModal extends Component {

  copyToClipboard = (str) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    if(navigator.clipboard.writeText(str)){
      alert("url copied to clipboard")
      return navigator.clipboard.writeText(str);
    }
    return Promise.reject('The Clipboard API is not available.');
  }

  getBody = (info) => {
    if(info.poolAddress === "homepage"){
      return(
        <div style={{display: "flex", flexDirection: "wrap", gap: "10px"}}>
            <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">"The probability that we may fall in the struggle ought not to deter us from the support of a cause we believe to be just; it shall not deter me."  - Abraham Lincoln</p>
            <Button tweet_d="tweet_d" callback={() => twitterShare("https://www.justcause.finance/#/", "Create and donate to fundraisers without spending your hard earned crypto with JustCause \n @JustCauseDev \n", "")}/>
            <Button facebook="facebook" callback={() => facebookShare("https://www.justcause.finance/#/", "")} />
            <Button linkedin="linkedin" callback={() => linkedInShare("https://www.justcause.finance/#/", "Create and donate to fundraisers without spending your hard earned crypto with JustCause \n @JustCauseDev \n", "", "test")}/>
            <div title="copy link to main page"><Button copy="copy" disable="true" callback={() => this.copyToClipboard("https://www.justcause.finance/#/")}/></div>
          </div>
      );
    }
    else{
      return(
        <div style={{display: "flex", flexDirection: "wrap", gap: "10px"}}>
            <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Share {info.name} with freinds, family, and other like minded individuals</p>
            <Button tweet_d="tweet_d" callback={() => twitterShare("https://www.justcause.finance/#/just_cause/search?address=", "Donate to "+info.name+" with lossless donations at JustCause crowdfunding \n @JustCauseDev \n", info.poolAddress)}/>
            <Button facebook="facebook" callback={() => facebookShare("https://www.justcause.finance/#/just_cause/search?address=", info.poolAddress)} />
            <Button linkedin="linkedin" callback={() => linkedInShare("https://www.justcause.finance/#/just_cause/search?address=", "Donate to "+info.name, info.poolAddress, "test")}/>
            <div title="copy link to pool"><Button copy="copy"  callback={() => this.copyToClipboard("https://www.justcause.finance/#/just_cause/search?address="+info.poolAddress)}/></div>
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