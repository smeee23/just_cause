import React, {Component, Fragment} from "react";
import { connect } from "react-redux"

import Logo from "./Logo";
import Button from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

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

	render() {
    const { isMobile } = this.props;

    const nav = (
      <Fragment>
        <NavLink exact to={"/dashboard"}>
          <TextLink text="Dashboard"/>
        </NavLink>
        <NavLink exact to={"/yourcause"}>
          <TextLink text="Your Cause"/>
        </NavLink>
        <NavLink exact to={"/contributions"}>
          <TextLink text="Contributions"/>
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
})

export default connect(mapStateToProps)(Header)