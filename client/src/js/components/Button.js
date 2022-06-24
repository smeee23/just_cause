import React, {Component} from "react"
import classNames from 'classnames'

import Icon from "./Icon";

import TwitterLight from "./logos/TwitterLight";
import TwitterDark from "./logos/TwitterDark";
import Github from "./logos/Github";
import Discord from "./logos/Discord";
import Facebook from "./logos/Facebook";
import LinkedIn from "./logos/LinkedIn";
import Share from "./logos/Share";

class ButtonExtraSmall extends Component {

  displayLine = (tweet, github) => {
    if(!tweet && ! github){
      return  <div className="button__bar--outer">
                <div className="button__bar--inner"/>
              </div>
    }
  }
	render() {
		const { text, icon, tweet, href, callback, disabled, lg, logo, github } = this.props;

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
            <div className="button__itemxsm button__text">
              {logo}
              <p className="mb0">{ text }</p>
            </div>
          ) : null }
          { icon ? (
            <div className="button__itemxsm button__icon">
              <Icon name={icon} size={lg ? 64 : 32}/>
            </div>
          ) : null }
          { tweet ? (
              <TwitterLight/>
          ) : null }
          { github ? (
              <Github/>
          ) : null }
        </div>
        {this.displayLine(tweet, github)}
      </button>
		);
	}
}

class ButtonSmall extends Component {

  displayLine = (tweet) => {
    if(!tweet){
      return  <div className="button__bar--outer">
                <div className="button__bar--inner"/>
              </div>
    }
  }
	render() {
		const { text, icon, tweet, href, callback, disabled, lg, logo } = this.props;

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
            <div className="button__itemsm button__text">
              {logo}
              <p className="mb0">{ text }</p>
            </div>
          ) : null }
          { icon ? (
            <div className="button__itemsm button__icon">
              <Icon name={icon} size={lg ? 64 : 32}/>
            </div>
          ) : null }
          { tweet ? (
              <TwitterLight/>
          ) : null }
        </div>
        {this.displayLine(tweet)}
      </button>
		);
	}
}

class Button extends Component {

  displayLine = (tweet, github, discord, facebook, linkedin, share, tweet_d) => {
    if(!tweet && !github && !discord && !facebook && !linkedin && !share && !tweet_d){
      return  <div className="button__bar--outer">
                <div className="button__bar--inner"/>
              </div>
    }
  }
	render() {
		const { text, icon, tweet, tweet_d, github, discord, facebook, linkedin, share, href, callback, disabled, lg, logo } = this.props;

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
              {logo}
              <p className="mb0">{ text }</p>
            </div>
          ) : null }
          { icon ? (
            <div className="button__item button__icon">
              <Icon name={icon} size={lg ? 64 : 32}/>
            </div>
          ) : null }
          { tweet ? (
              <TwitterLight/>
          ) : null }
          { tweet_d ? (
              <TwitterDark/>
          ) : null }
          { github ? (
              <Github/>
          ) : null }
          { discord ? (
              <Discord/>
          ) : null }
          { facebook ? (
              <Facebook/>
          ) : null }
          { linkedin ? (
              <LinkedIn/>
          ) : null }
          { share ? (
              <Share/>
          ) : null }
        </div>
        {this.displayLine(tweet, github, discord, facebook, linkedin, share, tweet_d)}
      </button>
		);
	}
}

export { Button, ButtonSmall, ButtonExtraSmall }
