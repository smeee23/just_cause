import React, {Component, Fragment} from "react";
import { connect } from "react-redux"

import Logo from "./Logo";
import { Button, ButtonSmall } from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import { updateActiveAccount } from "../actions/activeAccount"
import { checkLocationForAppDeploy, displayTVL } from "../func/ancillaryFunctions"

class Header extends Component {

  isMetaMaskInstalled = () => {
		//Have to check the ethereum binding on the window object to see if it's installed
		const { ethereum } = window;
		return Boolean(ethereum && ethereum.isMetaMask);
	}

	connectToWeb3 = async() => {
		if(this.isMetaMaskInstalled()){
			try {
				// Will open the MetaMask UI
				// You should disable this button while the request is pending!
				const { ethereum } = window;
				let request = await ethereum.request({ method: 'eth_requestAccounts' });
        this.props.updateActiveAccount(request[0]);
				console.log('request', request);

        window.location.reload(false);

			}
			catch (error) {
				console.error(error);
			}
		}
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
          <ButtonSmall text={"Lauch App"} icon={"poolShape5"} callback={this.connectToWeb3}/>
        </NavLink>
        )
    }
    else{
      return <ButtonSmall text={this.displayAddress(this.props.activeAccount)} icon={"wallet"} callback={this.connectToWeb3}/>
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