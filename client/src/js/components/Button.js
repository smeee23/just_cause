import React, {Component} from "react"
import classNames from 'classnames'

import Icon from "./Icon";

import Twitter from "./logos/Twitter";

class Button extends Component {

  displayLine = (tweet) => {
    if(!tweet){
      return  <div className="button__bar--outer">
                <div className="button__bar--inner"/>
              </div>
    }
  }
	render() {
		const { text, icon, tweet, href, callback, disabled, lg } = this.props;

    const classnames = classNames({
      "button": true,
      "button--icon-only": !text,
      "button--lg": lg,
      "button--disabled": disabled,
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
          { tweet ? (
              <Twitter/>
          ) : null }
        </div>
        {this.displayLine(tweet)}
      </button>
		);
	}
}

export default Button
