import React, {Component} from "react"

import Icon from "./Icon";

class Card extends Component {

	render() {
		const { title } = this.props;

		return (
      <div className="card">
        <div className="card__header">
          <h3 className="mb0">{ title }</h3>
          <div className="card__header--right">
            <p className="mb0">Join this pool</p>
            <Icon name={"plus"} size={32}/>
          </div>
        </div>
        <div className="card__bar"/>
      </div>
		);
	}
}

export default Card
