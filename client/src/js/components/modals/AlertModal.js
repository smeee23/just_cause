import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBodyTx} from "../Modal";

import DaiLogo from "../cryptoLogos/DaiLogo";
import WbtcLogo from "../cryptoLogos/WbtcLogo";
import UsdcLogo from "../cryptoLogos/UsdcLogo";
import TetherLogo from "../cryptoLogos/TetherLogo";
import EthLogo from "../cryptoLogos/EthLogo";
import AaveLogo from "../cryptoLogos/AaveLogo";
import MaticLogo from "../cryptoLogos/MaticLogo";
import WEthLogo from "../cryptoLogos/WEthLogo";
import LinkLogo from "../cryptoLogos/LinkLogo";
import DpiLogo from "../cryptoLogos/DpiLogo";
import Logo from "../Logo"

import { updateAlert } from "../../actions/alert";

class AlertModal extends Component {

  getText = () => {
    if(this.props.info.msg === "pool_not_found"){
      return "POOL NOT FOUND";
    }
    if(this.props.info.msg === "switch_network"){
      return "UNSUPPORTED NETWORK IDENTIFIED SWITCH TO OPTIMISM MAINNET"
    }
  }

  render() {
      const { info } =  this.props
      console.log("info", info)
      const text = this.getText()
      return (
        <Fragment>
          <ModalBodyTx>
              <h2>{text}</h2>
          </ModalBodyTx>
        </Fragment>
      );
	}
}

const mapStateToProps = state => ({
  tokenMap: state.tokenMap,
  connect: state.connect,
  alert: state.alert,
})

const mapDispatchToProps = dispatch => ({
  updateAlert: (msg) => dispatch(updateAlert(msg)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AlertModal)