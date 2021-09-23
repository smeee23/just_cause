import React, {Component} from "react"

import Icon from "./Icon";

class Button extends Component {

	render() {
		const { text, icon, href, callback } = this.props;

		return (
      <button className="button" href={href} onClick={() => callback}>
        { text ? (
          <div className="button__item">
            <p className="mb0">{ text }</p>
          </div>
        ) : null }
        { icon ? (
          <div className="button__item button__icon">
            <Icon name={icon} size={32}/>
          </div>
        ) : null }
        <div className="button__bar--outer">
          <div className="button__bar--inner"/>
        </div>
      </button>
		);
	}
}

export default Button
