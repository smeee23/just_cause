import React, {Component} from "react"

class TextLink extends Component {

	render() {
		const { text, href } = this.props;

		return (
      <button className="button button--text-link" href={href}>
        <div className="button__item">
          { text }
        </div>
        <div className="button__bar--outer">
          <div className="button__bar--inner"/>
        </div>
      </button>
		);
	}
}

export default TextLink
