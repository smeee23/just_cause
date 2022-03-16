import React, {Component, Fragment} from "react"
import classNames from 'classnames'

import Icon from "./Icon";
import LogoBlackRing from "./LogoBlackRing";

class ModalHeader extends Component {
  render() {
		return (
      <div className="modal__header">
        <Fragment>
            { this.props.children }
            <div className="modal__close-btn" onClick={this.closeModal}>
              <LogoBlackRing/>
            </div>
        </Fragment>
      </div>
		);
	}
}

class ModalHeaderNoClose extends Component {
  render() {
		return (
      <div className="modal__header">
        <Fragment>
            { this.props.children }
        </Fragment>
      </div>
		);
	}
}

class ModalBody extends Component {
  render() {
		return (
      <div className="modal__body">
        { this.props.children }
      </div>
		);
	}
}

class ModalCtas extends Component {
  render() {
		return (
      <div className="modal__ctas">
        { this.props.children }
      </div>
		);
	}
}

class Modal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen,
    }
  }

  componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

  handleClickOutside = (event) => {
    if (!this.refs["modal"].contains(event.target)) {
      this.closeModal();
    }
  }

  openModal = () => {
    this.setState({
      isOpen: true
    })
  }

  closeModal = () => {
    this.setState({
      isOpen: false
    })
  }

	render() {
    const classnames = classNames({
      "modal": true,
      "modal--open": this.state.isOpen,
    })

		return (
      <div className={classnames}>
        <div className="modal__background"/>
        <div className="modal__box theme--white" ref="modal">
          { this.props.children }
        </div>
      </div>
		);
	}
}

class AlertModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen,
    }
  }

  componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

  handleClickOutside = (event) => {
    if (!this.refs["modal_sm"].contains(event.target)) {
      this.closeModal();
    }
  }

  openModal = () => {
    this.setState({
      isOpen: true
    })
  }

  closeModal = () => {
    this.setState({
      isOpen: false
    })
  }

	render() {
    const classnames = classNames({
      "modal_sm": true,
      "modal--open": this.state.isOpen,
    })

		return (
      <div className={classnames}>
        <div className="modal__background"/>
        <div className="modal__box theme--white" ref="modal_sm">
          { this.props.children }
        </div>
      </div>
		);
	}
}

export { Modal, AlertModal, ModalHeader, ModalHeaderNoClose, ModalBody, ModalCtas }
