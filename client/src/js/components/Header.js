import React, {Component} from "react"

import Logo from "./Logo";
import Button from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'

class Header extends Component {

	render() {
		return (
      <header className="header-bar horizontal-padding">
        <NavLink exact to={"/"} className="tdn" style={{'display': 'flex', 'alignItems': 'center'}}>
          <Logo/>
          <h2 className="mb0">JustCause</h2>
        </NavLink>
        <nav>
          <NavLink exact to={"/dashboard"}>
            <TextLink text="Dashboard"/>
          </NavLink>
          <NavLink exact to={"/"}>
            <TextLink text="How it works"/>
          </NavLink>
          <Button text={"Connect"} icon={"wallet"}/>
        </nav>
      </header>
		);
	}
}

export default Header