import React, {Component, Fragment} from "react";
import { connect } from "react-redux"
import Web3 from "web3";

import Logo from "./Logo";
import { Button, ButtonSmall } from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import { updateActiveAccount } from "../actions/activeAccount"
import { updateConnect } from "../actions/connect"
import { checkLocationForAppDeploy, displayTVL, getConnection } from "../func/ancillaryFunctions"

import { web3Modal } from "../App"

class Header extends Component {

  connectToWeb3 = async() => {
		let addresses;
		let provider;
		try {
			// Will open the MetaMask UI
			// You should disable this button while the request is pending!

			provider = await web3Modal.connect();
			//addresses = await provider.request({ method: 'eth_requestAccounts' });
		}
		catch (error) {
			console.error(error);
		}
		//return {addresses, provider};
    return provider;
	}

	connectButtonHit = async() => {
    if(this.props.activeAccount === "Connect"){
      const provider = await this.connectToWeb3();
      const web3 = new Web3(provider);
		  const addresses = await web3.eth.getAccounts();
      if(addresses){
        this.props.updateActiveAccount(addresses[0]);
        this.props.updateConnect(true);
      }

      window.location.reload(false);
    }
    else{
        await web3Modal.clearCachedProvider();
        window.location.reload(false);
    }
	}

  generateNav = () => {
    if("outsideApp" === checkLocationForAppDeploy()){
      return (
        <Fragment className="theme--white">
          <NavLink className="theme--white" exact to={"/howitworks"}>
            <TextLink className="theme--white" text="How it works"/>
          </NavLink>
          <a className="theme--white" href="https://docs.justcause.finance/" target="_blank">
            <TextLink text="Docs"/>
          </a>

        </Fragment>
      )
    }
    else{
      return (
        <Fragment>
          <NavLink className="theme--white" exact to={"/dashboard"}>
            <div title="create and fund causes">
            <TextLink text="Dashboard"/>
            </div>
          </NavLink>
          <NavLink className="theme--white" exact to={"/search"}>
          <div title="find a pool by name or address">
            <TextLink text="Find Pool"/>
          </div>
          </NavLink >
          <a className="theme--white" title="user documentation" href="https://docs.justcause.finance/" target="_blank">
            <TextLink text="Docs"/>
          </a>
        </Fragment>
      )
    }
  }

  getHomeLink = () => {
    if("outsideApp" === checkLocationForAppDeploy()){
      return (
        <NavLink exact to={"/"} className="app-bar__left tdn theme--white">
          <Logo/>
            <h2 className="mb0">JustCause</h2>
        </NavLink>
      );
    }
    else{
      return (
        <div className="app-bar__left tdn theme--white">
          <Logo/>
          <h2 className="mb0">JustCause</h2>
        </div>
      );
    }
  }

  getLaunchButton = () => {
    if(web3Modal.cachedProvider)
      return <ButtonSmall text={"Lauch App"} icon={"poolShape5"} callback={this.connectButtonHit}/>;

    return <ButtonSmall text={"Lauch App"} icon={"poolShape5"}/>;
  }

  getConnectButton = () => {
    if("outsideApp" === checkLocationForAppDeploy()){
      return (
        <NavLink className="theme--white" exact to={"/dashboard"}>
          {this.getLaunchButton()}
        </NavLink>
        )
    }
    else{
      return <div title={this.displayInfo(this.props.activeAccount)}> <ButtonSmall text={this.displayAddress(this.props.activeAccount)} icon={"wallet"} callback={this.connectButtonHit}/> </div>
    }
  }
  displayAddress = (address) => {
    if(address === 'Connect')
      return address;

    return address.slice(0, 6) + "..."+address.slice(-4);
  }

  displayInfo= (address) => {
    if(address === 'Connect')
      return "connect wallet";

    return "disconnect wallet";
  }

	render() {
    const { isMobile } = this.props;

    const nav = this.generateNav();

		return (
      <header className="app-bar horizontal-padding theme--white">
        <Takeover>
          { nav }
        </Takeover>
        {this.getHomeLink()}
          <h2 title="USD value donated by JustCause (approx.)" className="mb0 horizontal-padding-sm" style={{fontSize:11, paddingLeft: "32px", paddingRight: "0px"}}>{  displayTVL('totalDonated', 'Donated:', this.props.tokenMap, 3) }</h2>
          <h2 title="USD value deposited (approx.)" className="mb0 horizontal-padding-sm" style={{fontSize:11, paddingRight: "0px"}}>{  displayTVL('tvl', 'Deposited:', this.props.tokenMap, 3) }</h2>
          <h2 title="connected" className="mb0 horizontal-padding-sm" style={{fontSize:11, paddingRight: "0px", color: "green"}}> {getConnection(this.props.tokenMap, this.props.networkId)} </h2>
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
  networkId: state.networkId,
})

const mapDispatchToProps = dispatch => ({
	updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
  updateConnect: (bool) => dispatch(updateConnect(bool)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)