import React, {Component} from "react"
import classNames from 'classnames'

import Icon from "./Icon";

class TextField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      completed: false
    }
  }

  componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

  handleClickOutside = (event) => {
    if (!this.refs["container"].contains(event.target)) {
      this.unfocusField();
    }
  }

  focusField = () => {
    this.setState({
      focused: true,
    })
  }

  unfocusField = () => {
    this.setState({
      completed: this.refs["input"].value.length > 0,
      focused: false
    })
  }

	render() {
		const { label, placeholder } = this.props;

    const classnames = classNames({
      "textfield": true,
      "textfield--focused": this.state.focused || this.state.completed,
    })

		return (
      <div className={classnames} onClick={this.state.focused ? this.unfocusField : this.focusField } ref="container">
        <div className="textfield__box">
          <Icon name={"pencil"} size={32}/>
          <label className="textfield__label">{label}</label>
            <input className="textfield__input" placeholder={placeholder} ref="input"/>
        </div>
        <div className="textfield__bar"/>
      </div>
		);
	}
}

export default TextField
