import React, {Component} from "react"

class TextLink extends Component {

  getNavHighlight = (navOn) => {
    console.log("navOn", navOn);
    if(0 === navOn || 1 === navOn){
      return(
        <div className="button__bar--outer">
          <div className="button__bar--inner-nav"/>
        </div>
      );
    }
    else {
      return(
        <div className="button__bar--outer">
          <div className="button__bar--inner"/>
        </div>
      );
    }
  }
	render() {
		const { text, href, callback, navOn } = this.props;

		return (
      <button className="button button--text-link" href={href} onClick={callback}>
        <div className="button__item">
          { text }
        </div>
        {this.getNavHighlight(navOn)}

      </button>
		);
	}
}

export default TextLink
