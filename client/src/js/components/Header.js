import React, {Component, Fragment} from "react";
import { connect } from "react-redux"
import Web3Modal from "web3modal";

import Logo from "./Logo";
import { Button, ButtonSmall } from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import { updateActiveAccount } from "../actions/activeAccount"
import { checkLocationForAppDeploy, displayTVL } from "../func/ancillaryFunctions"
import { connectToWeb3 } from "../func/web3ModalConnect"

const providerOptions = {
	/* See Provider Options Section */
};

const web3Modal = new Web3Modal({
	//network: "mainnet", // optional
	//cacheProvider: true, // optional
	providerOptions // required
});

class Header extends Component {

	connectToWeb3Hit = async() => {
    const {addresses, provider} = await connectToWeb3();
    this.props.updateActiveAccount(addresses[0]);
    window.location.reload(false);
	}

  generateNav = () => {
    console.log("pathname header", window.location.pathname);
    if("outsideApp" === checkLocationForAppDeploy()){
      return (
        <Fragment>
          <NavLink exact to={"/howitworks"}>
            <TextLink text="How it works"/>
          </NavLink>
          <a href="https://docs.justcause.finance/" target="_blank">
            <TextLink text="Docs"/>
          </a>

        </Fragment>
      )
    }
    else{
      return (
        <Fragment>
          <NavLink exact to={"/dashboard"}>
            <TextLink text="Dashboard"/>
          </NavLink>
          <NavLink exact to={"/search"}>
            <TextLink text="Search"/>
          </NavLink>
          <a href="https://docs.justcause.finance/" target="_blank">
            <TextLink text="Docs"/>
          </a>
        </Fragment>
      )
    }
  }

  getHomeLink = () => {
    if("outsideApp" === checkLocationForAppDeploy()){
      return (
        <NavLink exact to={"/"} className="app-bar__left tdn">
          <Logo/>
            <h2 className="mb0">JustCause</h2>
        </NavLink>
      );
    }
    else{
      return (
        <div className="app-bar__left tdn">
          <Logo/>
          <h2 className="mb0">JustCause</h2>
        </div>
      );
    }
  }

  getConnectButton = () => {
    if("outsideApp" === checkLocationForAppDeploy()){
      return (
        <NavLink exact to={"/dashboard"}>
          <ButtonSmall text={"Lauch App"} icon={"poolShape5"} callback={this.connectToWeb3Hit}/>
        </NavLink>
        )
    }
    else{
      return <ButtonSmall text={this.displayAddress(this.props.activeAccount)} icon={"wallet"} callback={this.connectToWeb3Hit}/>
    }
  }
  displayAddress = (address) => {
    if(address === 'Connect')
      return address;

    return address.slice(0, 6) + "..."+address.slice(-4);
  }

	render() {
    const { isMobile } = this.props;

    const nav = this.generateNav();

		return (
      <header className="app-bar horizontal-padding">
        <Takeover>
          { nav }
        </Takeover>
        {this.getHomeLink()}
          <h2 className="mb0 horizontal-padding-sm" style={{fontSize:11}}>{  displayTVL('totalDonated', 'Donated:', this.props.tokenMap, 3) }</h2>
          <h2 className="mb0 horizontal-padding-sm" style={{fontSize:11}}>{  displayTVL('tvl', 'Deposited:', this.props.tokenMap, 3) }</h2>
        <nav className="app-bar__items">
          { nav }
        {this.getConnectButton()}
        </nav>
      </header>
		);
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
  activeAccount: state.activeAccount,
  tokenMap: state.tokenMap,
})

const mapDispatchToProps = dispatch => ({
	updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)