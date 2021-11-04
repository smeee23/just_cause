import React, {Component} from "react";
import { connect } from "react-redux"

import Logo from "./Logo";
import Button from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'

class Header extends Component {
	render() {
    const { isMobile } = this.props;

		return (
      <header className="app-bar horizontal-padding">
        <NavLink exact to={"/"} className="app-bar__left tdn">
          <Logo/>
          <h2 className="mb0">JustCause</h2>
        </NavLink>
        <nav>
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