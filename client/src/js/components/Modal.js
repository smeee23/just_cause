import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import classNames from 'classnames'
import { updateActiveAccount } from "../actions/activeAccount";

import OptimismLogo from "./cryptoLogos/OptimismLogo";
import OptimismBrand from "./cryptoLogos/OptimismBrand";

import Logo from "./Logo";

class ModalHeader extends Component {
  render() {
		return (
      <div className="modal__header">
        <Fragment>
            { this.props.children }
            <div className="modal__close-btn" onClick={this.closeModal}>
              <Logo/>
            </div>
        </Fragment>
      </div>
		);
	}
}

class ModalHeaderCenter extends Component {
  render() {
		return (
      <div className="modal__header--center">
        <Fragment>
            { this.props.children }
            <div style={{display: "flex", flexDirection: "wrap", gap: "3px"}}>
            <a style={{ textDecoration: "none"}} title="New to Optimism? Follow link to learn more" href="https://www.optimism.io/" target="_blank" rel="noopener noreferrer">
              <OptimismLogo size="21"/>
              <OptimismBrand/>
            </a>
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

class ModalBodyTx extends Component {
  render() {
		return (
      <div className="modal__bodytx">
        { this.props.children }
      </div>
		);
	}
}

class ModalBodyDeploy extends Component {
  render() {
		return (
      <div className="modal__bodydeploy">
        { this.props.children }
      </div>
		);
	}
}

class ModalCtas extends Component {
  render() {
		return (
      <div className="modal__ctas--no-body">
        { this.props.children }
      </div>
		);
	}
}

class ModalCtasDeploy extends Component {
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

class ConnectModal extends Component {
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
      this.props.updateActiveAccount("Connect")
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

class SmallModal extends Component {
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
        <div className="modal__boxsm theme--white" ref="modal">
          { this.props.children }
        </div>
      </div>
		);
	}
}

class LargeModal extends Component {
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
        <div className="modal__boxdeploy theme--white" ref="modal">
          { this.props.children }
        </div>
      </div>
		);
	}
}

const mapStateToProps = state => ({
  tokenMap: state.tokenMap,
  poolTrackerAddress: state.poolTrackerAddress,
  approve: state.approve,
  activeAccount: state.activeAccount,
})

const mapDispatchToProps = dispatch => ({
  updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ConnectModal)
export { Modal, LargeModal, SmallModal, ModalHeader, ModalHeaderNoClose, ModalBody, ModalBodyTx, ModalBodyDeploy, ModalCtas, ModalCtasDeploy, ModalHeaderCenter }
