import React, {Component, Fragment} from "react"
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

import TextLink from '../TextLink'

import { redirectWindowBlockExplorer, getBlockExplorerUrl } from '../../func/ancillaryFunctions';

export default class PendingTxModal extends Component {

  displayLogo = (acceptedTokenString) => {
    let logo = '';
    if(acceptedTokenString === 'ETH'){
      logo = <EthLogo/>;
    }
    else if (acceptedTokenString === 'USDT'){
      logo = <TetherLogo/>;
    }
    else if (acceptedTokenString === 'USDC'){
      logo = <UsdcLogo/>;
    }
    else if (acceptedTokenString === 'WBTC'){
      logo = <WbtcLogo/>;
    }
    else if (acceptedTokenString === 'DAI'){
      logo = <DaiLogo/>;
    }
    else if (acceptedTokenString === 'AAVE'){
      logo = <AaveLogo/>;
    }
    else if(acceptedTokenString === 'WETH'){
      logo = <WEthLogo/>;
    }
    else if(acceptedTokenString === 'MATIC'){
      logo = <MaticLogo/>;
    }
    else if(acceptedTokenString === 'LINK'){
      logo = <LinkLogo/>;
    }
    else if(acceptedTokenString === 'DPI'){
      logo = <DpiLogo/>;
    }
    else{
      logo = <Logo/>
    }

    return logo;
  }

  render() {
      const { txDetails } = this.props;
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">{txDetails.type} {txDetails.amount} {this.displayLogo(txDetails.tokenString)} {txDetails.tokenString} PENDING</h2>
        </ModalHeader>
        <ModalBodyTx>
            <p>
               <TextLink text={"- TX HASH "+txDetails.txHash.slice(0, 6) + "..."+txDetails.txHash.slice(-4)+"          view on block explorer"} href={getBlockExplorerUrl('tx')+txDetails.txHash} callback={() => redirectWindowBlockExplorer(txDetails.txHash, 'tx', txDetails.networkId)}/>
               <TextLink text={"- POOL CONTRACT: "+txDetails.poolAddress.slice(0, 6) + "..."+txDetails.poolAddress.slice(-4)+"          view on block explorer"} href={getBlockExplorerUrl('address')+txDetails.poolAddress} callback={() => redirectWindowBlockExplorer(txDetails.poolAddress, 'address', txDetails.networkId)}/>
            </p>
        </ModalBodyTx>
      </Fragment>
		);
	}
}