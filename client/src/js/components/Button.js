import React, {Component} from "react"
import classNames from 'classnames'

import Icon from "./Icon";

class Button extends Component {
	render() {
		const { text, icon, href, callback, lg } = this.props;

    const classnames = classNames({
      "button": true,
      "button--icon-only": !text,
      "button--lg": lg
    })

		return (
      <button className={classnames} href={href} onClick={callback}>
        <div className="button__items">
          { text ? (
            <div className="button__item button__text">
              <p className="mb0">{ text }</p>
            </div>
          ) : null }
          { icon ? (
            <div className="button__item button__icon">
              <Icon name={icon} size={lg ? 64 : 32}/>
            </div>
          ) : null }
        </div>
        <div className="button__bar--outer">
          <div className="button__bar--inner"/>
        </div>
      </button>
		);
	}
}

export default Button
