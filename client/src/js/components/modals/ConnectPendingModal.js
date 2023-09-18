import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeaderCenter, ModalCtas } from "../Modal";
import { Button } from '../Button'
import OptimismLogo from "../cryptoLogos/OptimismLogo";
import Profile from '../../func/wagmiDisplay'

class ConnectPendingModal extends Component {

  constructor(props) {
		super(props);
    }

  render() {
		return (
      <Fragment>
        <ModalHeaderCenter>
            <h2 className="mb0">Connect Wallet</h2>
            <h2 className="mb0">On</h2>
        </ModalHeaderCenter>
        <ModalCtas>
            <Profile/>
        </ModalCtas>
      </Fragment>
		);
	}
}

export default ConnectPendingModal;