import React, {Component, Fragment} from "react";
import { connect } from "react-redux"

import Logo from "./Logo";
import Button from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

class Header extends Component {
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
          <Button text={isMobile ? null : "Connect"} icon={"wallet"}/>
        </nav>
      </header>
		);
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
})

export default connect(mapStateToProps)(Header)