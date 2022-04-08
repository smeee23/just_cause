import React, {Component, Fragment} from "react"
import { ModalHeader, ModalBodyTx} from "../Modal";

import TextLink from '../TextLink'
import { redirectWindowBlockExplorer, getBlockExplorerUrl } from '../../func/ancillaryFunctions';

export default class TxResultModal extends Component {

  successOrFail = (success) => {
    if(success) return "SUCCESS"
    return 'FAILED'
  }

  render() {
      const { txDetails } = this.props;
      if(txDetails.success){

      }
		return (
      <Fragment>
      <ModalHeader>
        <h2 className="mb0">{txDetails.type + " " + txDetails.amount + " " + txDetails.tokenString + " " + this.successOrFail(txDetails.success)}</h2>
      </ModalHeader>
      <ModalBodyTx>
        <p>
            <TextLink text={"- TX HASH "+txDetails.txHash.slice(0, 6) + "..."+txDetails.txHash.slice(-4) +"          view on block explorer"} href={getBlockExplorerUrl('tx')+txDetails.txHash} callback={() => redirectWindowBlockExplorer(txDetails.txHash, 'tx')}/>
            <TextLink text={"- POOL CONTRACT: "+txDetails.poolAddress.slice(0, 6) + "..."+txDetails.poolAddress.slice(-4) +"          view on block explorer"} href={getBlockExplorerUrl('address')+txDetails.poolAddress} callback={() => redirectWindowBlockExplorer(txDetails.poolAddress, 'address')}/>
        </p>
      </ModalBodyTx>
    </Fragment>
		);
	}
}