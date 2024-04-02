import React, {Component, Fragment} from "react";
import { connect } from "react-redux"
import Web3 from "web3";
import { withRouter } from 'react-router-dom';

import ConnectPendingModal from "./modals/ConnectPendingModal";
import ConnectModal from "./Modal"
import Logo from "./Logo";
import { Button, ButtonSmall } from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import { updateActiveAccount } from "../actions/activeAccount"
import { updateConnect } from "../actions/connect"
import { updateNetworkId } from "../actions/networkId"

import { displayTVL, redirectWindowBlockExplorer } from "../func/ancillaryFunctions"
import Profile from "../func/wagmiDisplay"
import Disconnect from "../func/wagmiDisconnect"
import SwitchNetwork from "../func/wagmiNetworkSwitch"
import ArbitrumLogo from "./cryptoLogos/ArbitrumLogo";
import OptimismLogo from "./cryptoLogos/OptimismLogo";

class Header extends Component {

  constructor(props) {
		super(props);

    const loc = window.location.href;
    let index;
    if(loc.includes("dashboard")) index = 0;
    if(loc.includes("search")) index = 1;

    console.log("networkId header", this.props.networkId)
    this.state = {
      index: this.getNavIndex(index),
      chainIndex: this.props.networkId ? this.props.networkId : null,
    }
	}

  componentDidUpdate = async(prevProps) => {
    if (this.props.networkId !== prevProps.networkId) {
      const chainIndex = this.props.networkId === 10 ? 0 : 1;
      this.setState({ chainIndex })
    }
  }

  getNavIndex = (index) => {
    let i;
    if(!["/howitworks", "/"].includes(this.props.location.pathname)){
      const loc = window.location.href;
      if(loc.includes("search") && index === 1){
        i = 1;
      }
      else if (loc.includes("dashboard") && index === 0){
        i = 0;
      }
    }
    return i;
  }

  clickArb = async() => {
    this.setState({
      chainIndex: 1,
    })
    await this.setNetworkId(42161);
  }

  clickOp = async() => {
    this.setState({
      chainIndex: 0,
    })
    await this.setNetworkId(10);
  }

  setNetworkId = async(networkId) => {
    sessionStorage.setItem("ownerPoolInfo", "");
    sessionStorage.setItem("userDepositPoolInfo", "");
    sessionStorage.setItem("verifiedPoolInfo", "");
    sessionStorage.setItem("pendingTxList", "");
		await this.props.updateNetworkId(networkId);
		sessionStorage.setItem("networkId", networkId);
    window.location.reload(false);
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


  getChainButtons = () => {
    if(this.state.chainIndex === 0){
      if(["Connect", "Pending"].includes(this.props.activeAccount)){
        return(
          <div title={"switch to Arbitrum"}>
            <Button
              isLogo="arb"
              logoSize={17}
              callback={async() => await this.clickArb()}
            />
          </div>
        );
      }
      return(
        <SwitchNetwork newNetworkId={42161}/>
      );
    }
    else if(this.state.chainIndex === 1){
      if(["Connect", "Pending"].includes(this.props.activeAccount)){
        return (
          <div title={"switch to Optimism"}>
            <Button
              isLogo="op"
              disabled={this.state.chainIndex === 0 ? "true" : ""}
              logoSize={17}
              callback={async() => await this.clickOp()}
            />
          </div>
        );
      }
      return(
        <SwitchNetwork newNetworkId={10}/>
      );
    }
  }
  getAccountButtons = () => {
    if(["Connect", "Pending"].includes(this.props.activeAccount)){
      return(
        <div style={{display: "flex", flexDirection: "wrap", gap: "2px"}}>
          {this.getChainButtons()}
          <div title={"connect to web3"}>
            <ButtonSmall text={this.displayAddress(this.props.activeAccount)} logo={this.getChainLogo()} icon={"wallet"} callback={this.connectButtonHit}/>
          </div>
        </div>
      );
    }
    else{
      return(
        <div style={{display: "flex", flexDirection: "wrap", gap: "2px"}}>
          {this.getChainButtons()}
          <div title={"view address on block explorer"} >
            <ButtonSmall text={this.displayAddress(this.props.activeAccount)} logo={this.getChainLogo()} icon={this.props.connect} callback={this.connectButtonHit}/>
          </div>
          <div title={"disconnect"} style={{marginTop: "-5px"}}>
            <Disconnect logo="close"/>
          </div>
        </div>
      );
    }
  }

  getChainLogo = () => {
    if (this.state.chainIndex === 0) return <OptimismLogo size="20"/>;
    else if (this.state.chainIndex  === 1) return <ArbitrumLogo size="20"/>;
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

  getConnectModal = () => {
		if(this.props.activeAccount === "Pending"){
			let modal = <ConnectModal isOpen={true}><ConnectPendingModal chainIndex={this.state.chainIndex}/></ConnectModal>;
			return modal;
		}
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
        {this.getConnectModal()}
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
	updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
  updateConnect: (bool) => dispatch(updateConnect(bool)),
  updateNetworkId: (int) => dispatch(updateNetworkId(int)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header))