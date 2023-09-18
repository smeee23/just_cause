import React, {Component, Fragment} from "react";
import classNames from 'classnames'

import { Button, ButtonSmall } from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'

import { withRouter } from 'react-router-dom';

class Takeover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    }
  }

  toggle = () => {
    this.setState({
      open: !this.state.open
    })
  }

  generateNav = () => {
    if(["/howitworks", "/"].includes(this.props.location.pathname)){
      return (
        <Fragment>
          <NavLink className="theme--white" exact to={"/howitworks"}>
            <TextLink className="theme--white" text="How it works" callback={() => this.toggle()}/>
          </NavLink>
          <a className="theme--white" href="https://docs.justcause.finance/" target="_blank" rel="noopener noreferrer" onClick={() => this.toggle()}>
            <TextLink text="Docs"/>
          </a>
          <a className="theme--white" href="https://github.com/smeee23/just_cause/tree/main/security/audits" target="_blank" rel="noopener noreferrer" onClick={() => this.toggle()}>
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
            <TextLink text="Dashboard" navOn={this.state.index === 0 ? "on" : "off"} callback={() => this.toggle()}/>
            </div>
          </NavLink>
          <NavLink className="theme--white" exact to={"/search"}>
            <div title="find a pool by name or address">
              <TextLink text="Find Pool" navOn={this.state.index === 1 ? "on" : "off"} callback={() => this.toggle()}/>
            </div>
          </NavLink >
          <a className="theme--white" title="user documentation" href="https://docs.justcause.finance/" target="_blank" rel="noopener noreferrer" onClick={() => this.toggle()}>
            <TextLink text="Docs"/>
          </a>
        </Fragment>
      )
    }
  }

	render() {
    const classnames = classNames({
      "takeover": true,
      "takeover--open": this.state.open,
    })

		return (
      <div className={classnames}>
        <nav className='takeover__panel horizontal-padding'>
          { this.generateNav() }
        </nav>
        <div className='takeover__hamburger' onClick={this.toggle}>
          <div className="takeover__hamburger__line"/>
          <div className="takeover__hamburger__line"/>
          <div className="takeover__hamburger__line"/>
        </div>
      </div>
		);
	}
}

export default withRouter(Takeover)
