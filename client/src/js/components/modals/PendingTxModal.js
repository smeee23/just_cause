import React, {Component, Fragment} from "react"
import { ModalHeader, ModalBody} from "../Modal";

import TextLink from '../TextLink'

import { redirectWindow } from '../../func/ancillaryFunctions';

export default class PendingTxModal extends Component {

  render() {
      const { txDetails } = this.props;
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">{txDetails.type + " " + txDetails.amount + " " + txDetails.tokenString + " PENDING"}</h2>
        </ModalHeader>
        <ModalBody>
            <p>
               <TextLink text={"- TX HASH "+txDetails.txHash.slice(0, 6) + "..."+txDetails.txHash.slice(-4)} href={"https://kovan.etherscan.io/tx/"+txDetails.txHash} callback={() => redirectWindow(txDetails.txHash, false)}/>
               <TextLink text={"- POOL CONTRACT: "+txDetails.poolAddress.slice(0, 6) + "..."+txDetails.poolAddress.slice(-4)} href={"https://kovan.etherscan.io/address/"+txDetails.poolAddress} callback={() => redirectWindow(txDetails.poolAddress, true)}/>
            </p>
        </ModalBody>
      </Fragment>
		);
	}
}