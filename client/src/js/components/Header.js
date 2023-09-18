import React, {Component, Fragment} from "react";
import { connect } from "react-redux"
import Web3 from "web3";
import { withRouter } from 'react-router-dom';

import Logo from "./Logo";
import { Button, ButtonSmall } from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import { updateActiveAccount } from "../actions/activeAccount"
import { updateConnect } from "../actions/connect"
import { displayTVL, getConnection, redirectWindowBlockExplorer } from "../func/ancillaryFunctions"
import Profile from "../func/wagmiDisplay"
import Disconnect from "../func/wagmiDisconnect"

class Header extends Component {

  constructor(props) {
		super(props);

    const loc = window.location.href;
    let index;
    if(loc.includes("dashboard")) index = 0;
    if(loc.includes("search")) index = 1;

    this.state = {
      index: this.getNavIndex(index),
    }
	}

  getNavIndex = (index) => {
    let i;
    if(!["/howitworks", "/"].includes(this.props.location.pathname)){
      const loc = window.location.href;
      if(loc.includes("search") && index === 1){
        console.log("search", loc);
        i = 1;
      }
      else if (loc.includes("dashboard") && index === 0){
        i = 0;
      }
    }
    return i;
  }

  resetNavDash = ()=> {
    this.setState({
      index: 0,
    })
  }

  resetNavSearch = () => {
    this.setState({
      index: 1,
    })
  }

  connectToWeb3 = async() => {
		let provider;
		try {
			// Will open the MetaMask UI
			// You should disable this button while the request is pending!

			//provider =
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
      this.props.updateActiveAccount("Pending")
    }
    else{
        redirectWindowBlockExplorer(this.props.activeAccount, 'address', this.props.networkId);
    }
	}

  generateNav = () => {
    if(["/howitworks", "/"].includes(this.props.location.pathname)){
      return (
        <Fragment>
          <NavLink className="theme--white" exact to={"/howitworks"}>
            <TextLink className="theme--white" text="How it works"/>
          </NavLink>
          <a className="theme--white" href="https://docs.justcause.finance/" target="_blank" rel="noopener noreferrer">
            <TextLink text="Docs"/>
          </a>
          <a className="theme--white" href="https://github.com/smeee23/just_cause/tree/main/security/audits" target="_blank" rel="noopener noreferrer">
            <TextLink text="Audits"/>
          </a>

        </Fragment>
      )
    }
    else{
      return (
        <Fragment>
          <NavLink className="theme--white" exact to={"/dashboard"}>
            <div title="create and fund causes">
              <TextLink text="Dashboard" navOn={this.state.index === 0 ? "on" : "off"} callback={() => this.resetNavDash()}/>
            </div>
          </NavLink>
          <NavLink className="theme--white" exact to={"/search"}>
            <div title="find a pool by name or address">
              <TextLink text="Find Pool" navOn={this.state.index === 1 ? "on" : "off"} callback={() => this.resetNavSearch()}/>
            </div>
          </NavLink >
          <a className="theme--white" title="user documentation" href="https://docs.justcause.finance/" target="_blank" rel="noopener noreferrer">
            <TextLink text="Docs"/>
          </a>
        </Fragment>
      )
    }
  }

  getHomeLink = () => {
    if(["/howitworks", "/"].includes(this.props.location.pathname)){
      return (
        <div style={{width: "100%"}}>
        <div className="app-bar__logo">
          <NavLink exact to={"/"} className="app-bar__left tdn theme--white">
            <Logo/>
              <h2 className="mb0">JustCause</h2>
          </NavLink>
          <div className="app-bar__connect">
            {this.getConnectButton()}
          </div>
        </div>
        </div>
      );
    }
    else{
      return (
        <div className="app-bar__left tdn theme--white" style={{width: "100%"}}>
          <div className="app-bar__logo">
            <div style={{display: "flex"}}>
              <Logo/>
              <h2 className="mb0">JustCause</h2>
            </div>
            <div className="app-bar__tvl">
              <h2 title="USD value donated by JustCause (approx.)" className="mb0" style={{fontSize:11}}>{  displayTVL('totalDonated', 'Donated', this.props.tokenMap, 3) }</h2>
              <h2 title="USD value deposited (approx.)" className="mb0 horizontal-padding-sm" style={{fontSize:11, paddingRight: "0px"}}>{  displayTVL('tvl', 'Deposited', this.props.tokenMap, 3) }</h2>
            </div>
            <div className="app-bar__connect" >
              <h2 title="connected" className="mb0" style={{fontSize:11, color: "green"}}> {getConnection(this.props.tokenMap, this.props.networkId, this.props.activeAccount)} </h2>
              <div >
                {this.getConnectButton()}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  getLaunchButton = () => {
    if(this.props.connect)
      return <ButtonSmall forceDisplay="true" text={"Lauch App"} icon={"poolShape5"} callback={this.connectButtonHit}/>;

    return <ButtonSmall forceDisplay="true" text={"Lauch App"} icon={"poolShape5"}/>;
  }

  getAccountButtons = () => {
    if(["Connect", "Pending"].includes(this.props.activeAccount)){
      return(
        <div title={"connect to web3"}>
          <ButtonSmall text={this.displayAddress(this.props.activeAccount)} icon={"wallet"} callback={this.connectButtonHit}/>
        </div>
      );
    }
    else{
      return(
        <div style={{display: "flex", flexDirection: "wrap", gap: "2px"}}>
          <div title={"view address on block explorer"} >
            <ButtonSmall text={this.displayAddress(this.props.activeAccount)} logo={getConnection(this.props.networkId, this.props.activeAccount)} icon={this.props.connect} callback={this.connectButtonHit}/>
          </div>
          <div title={"disconnect"} style={{marginTop: "-5px"}}>
            <Disconnect/>
          </div>
        </div>
      );
    }
  }

  getConnectButton = () => {
    if(["/howitworks", "/"].includes(this.props.location.pathname)){
      return (
        <NavLink className="theme--white" exact to={"/dashboard"}>
          {this.getLaunchButton()}
        </NavLink>
      )
    }
    else{
      return this.getAccountButtons();
    }
  }
  displayAddress = (address) => {
    if(['Connect', 'Pending'].includes(address))
      return address;

    return address.slice(0, 6) + "..."+address.slice(-4);
  }

  displayInfo= (address) => {
    if(address === 'Connect')
      return "connect web3";

    return "disconnect";
  }

	render() {
    const { isMobile } = this.props;

    const nav = this.generateNav();
    const profile = <Profile/>;

		return (
      <header className="app-bar horizontal-padding theme--white">
        <Takeover/>
        {this.getHomeLink()}
        <nav className="app-bar__items__left">
          { nav }
        </nav>
        <nav className="app-bar__items__right">
        <div style={{display: "flex", gap: "3px"}} >
                {this.getConnectButton()}
            </div>
        </nav>
      </header>
		);
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
  activeAccount: state.activeAccount,
  tokenMap: state.tokenMap,
  connect: state.connect,
  networkId: state.networkId,
})

const mapDispatchToProps = dispatch => ({
	updateActiveAccount: (s) => {
    console.log('Dispatching updateActiveAccount with:', s);
    dispatch(updateActiveAccount(s));
  },
  updateConnect: (bool) => dispatch(updateConnect(bool)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header))