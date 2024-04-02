import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeaderCenter, ModalCtas } from "../Modal";
import { Button } from '../Button'
import OptimismLogo from "../cryptoLogos/OptimismLogo";
import OptimismBrand from "../cryptoLogos/OptimismBrand";
import ArbitrumLogo from "../cryptoLogos/ArbitrumLogo";
import ArbitrumBrand from "../cryptoLogos/ArbitrumBrand";
import Profile from '../../func/wagmiDisplay'

class ConnectPendingModal extends Component {

  constructor(props) {
		super(props);
    }

  getChainLink = () => {
    if(this.props.chainIndex === 0){
      return(
        <a style={{ textDecoration: "none"}} title="New to Optimism? Follow link to learn more" href="https://www.optimism.io/" target="_blank" rel="noopener noreferrer">
          <div style={{display: "flex", flexDirection: "wrap", gap: "10px", alignItems: "center"}}>
              <OptimismLogo size="55"/>
              <OptimismBrand/>
          </div>
        </a>
      );
    }
    else if(this.props.chainIndex === 1){
      return(
        <a style={{ textDecoration: "none"}} title="New to Arbitrum? Follow link to learn more" href="https://arbitrum.io/" target="_blank" rel="noopener noreferrer">
          <ArbitrumBrand/>
        </a>
      );
    }
  }
  render() {
		return (
      <Fragment>
        <ModalHeaderCenter>
            <h2 className="mb0">Connect Wallet</h2>
            <h2 className="mb0">On</h2>
            {this.getChainLink()}
        </ModalHeaderCenter>
        <ModalCtas>
            <Profile/>
        </ModalCtas>
      </Fragment>
		);
	}
}

export default ConnectPendingModal;