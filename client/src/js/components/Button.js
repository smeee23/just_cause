import React, {Component} from "react"
import classNames from 'classnames'

import Icon from "./Icon";

import TwitterLight from "./logos/TwitterLight";
import TwitterDark from "./logos/TwitterDark";
import ShareDark from "./logos/ShareDark";
import Github from "./logos/Github";
import Discord from "./logos/Discord";
import Facebook from "./logos/Facebook";
import LinkedIn from "./logos/LinkedIn";
import Share from "./logos/Share";
import Copy from "./logos/Copy"

class ButtonExtraSmall extends Component {

  displayLine = (tweet, github) => {
    if(!tweet && ! github){
      return  <div className="button__bar--outer">
                <div className="button__bar--inner"/>
              </div>
    }
  }
	render() {
		const { text, icon, tweet, href, callback, disabled, lg, logo, github, info } = this.props;

    const classnames = classNames({
      "button": true,
      "button--icon-only": !text,
      "button--lg": lg,
      "button--disabled": disabled,
    })

		return (
      <button title={info} className={classnames} href={href} onClick={callback}>
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
		const { text, icon, tweet, href, callback, disabled, lg, logo, info } = this.props;

    const classnames = classNames({
      "button": true,
      "button--icon-only": !text,
      "button--lg": lg,
      "button--disabled": disabled,
    })

		return (
      <button title={info} className={classnames} href={href} onClick={callback}>
        <div className="button__items">
          { text ? (
            <div className="button__itemsm button__text">
             <div style={{paddingRight: "5px"}}> {logo} </div>
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

  displayLine = (tweet, github, discord, facebook, linkedin, share, tweet_d, copy) => {
    if(!tweet && !github && !discord && !facebook && !linkedin && !share && !tweet_d && !copy){
      return  <div className="button__bar--outer">
                <div className="button__bar--inner"/>
              </div>
    }
  }
	render() {
		const { text, icon, tweet, tweet_d, share_d, github, discord, facebook, linkedin, share, href, callback, disabled, lg, logo, copy, info } = this.props;

    const classnames = classNames({
      "button": true,
      "button--icon-only": !text,
      "button--lg": lg,
      "button--disabled": disabled,
    })

		return (
      <button title={info} className={classnames} href={href} onClick={callback}>
        <div className="button__items">
          { text ? (
            <div className="button__item button__text">
              <div style={{paddingRight: "5px"}}>{logo}</div>
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
          { share_d ? (
              <ShareDark/>
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
          { copy ? (
              <Copy/>
          ) : null }
        </div>
        {this.displayLine(tweet, github, discord, facebook, linkedin, share, tweet_d, share_d, copy)}
      </button>
		);
	}
}

export { Button, ButtonSmall, ButtonExtraSmall }
