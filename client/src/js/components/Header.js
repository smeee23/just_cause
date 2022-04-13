import React, {Component, Fragment} from "react";
import { connect } from "react-redux"

import Logo from "./Logo";
import { Button } from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import { updateActiveAccount } from "../actions/activeAccount"
import { formatDollars } from "../func/ancillaryFunctions"
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
			}
			catch (error) {
				console.error(error);
			}
		}
	}

  displayAddress = (address) => {
    if(address === 'Connect')
      return address;

    return address.slice(0, 6) + "..."+address.slice(-4);
  }

  displayTVL = (id, label) => {
    const tokenMap = this.props.tokenMap
    if(tokenMap){
      let total = 0.0;

      let acceptedTokens = Object.keys(tokenMap);
		  for(let i = 0; i < acceptedTokens.length; i++){
			  const key = acceptedTokens[i];

        const priceUSD = tokenMap[key] && tokenMap[key].priceUSD;
        const tokenAmount = tokenMap[key][id];
        console.log('tvl header', tokenAmount, priceUSD);
        if(tokenAmount && priceUSD){
          total += tokenAmount * priceUSD;
        }

      }
      const s = formatDollars(total);
      return label + ' ' + s.substring(0, s.length - 3);
    }
  }

	render() {
    const { isMobile } = this.props;

    const nav = (
      <Fragment>
        <NavLink exact to={"/dashboard"}>
          <TextLink text="Dashboard"/>
        </NavLink>
        <NavLink exact to={"/search"}>
          <TextLink text="Search"/>
        </NavLink>
        <NavLink exact to={"/"}>
          <TextLink text="How it works"/>
        </NavLink>
      </Fragment>
    )
		return (
      <header className="app-bar horizontal-padding">
        <Takeover>
          { nav }
        </Takeover>
        <NavLink exact to={"/"} className="app-bar__left tdn">
          <Logo/>
          <h2 className="mb0">JustCause</h2>
        </NavLink>
          <h2 className="mb0 horizontal-padding-med" style={{fontSize:15}}>{  this.displayTVL('totalEarned', 'Donated:') }</h2>
          <h2 className="mb0 horizontal-padding-med" style={{fontSize:15}}>{  this.displayTVL('tvl', 'TVL:') }</h2>
        <nav className="app-bar__items">
          { nav }
          <Button text={isMobile ? null : this.displayAddress(this.props.activeAccount)} icon={"wallet"} callback={this.connectToWeb3}/>
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