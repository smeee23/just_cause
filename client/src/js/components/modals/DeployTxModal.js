import React, {Component, Fragment} from "react"
import { ModalHeader, ModalBody} from "../Modal";

import TextLink from '../TextLink'

import { redirectWindowHash } from '../../func/ancillaryFunctions';

export default class DeployTxModal extends Component {

  successOrFail = (status) => {
    if(status === 'pending') return "PENDING POOL CREATION";
    else if(status === 'success') return "SUCCESSFUL POOL CREATION";
    else if(status === 'failed') return "FAILED POOL CREATION";
  }
  showPoolButton = (txDetails) => {
    if(txDetails.status === 'success'){
      return <TextLink text={"- POOL CONTRACT: "+txDetails.poolAddress.slice(0, 6) + "..."+txDetails.poolAddress.slice(-4)} href={"https://kovan.etherscan.io/address/"+txDetails.poolAddress} callback={() => redirectWindowHash(txDetails.poolAddress, true)}/>
    }
  }
  render() {
      const { txDetails } = this.props;

		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">{this.successOrFail(txDetails.status)}</h2>
        </ModalHeader>
        <ModalBody>
            <p>{txDetails.poolName}<br/>
               {this.showPoolButton(txDetails)}
               <TextLink text={"- RECEIVER: "+txDetails.receiver.slice(0, 6) + "..."+txDetails.receiver.slice(-4)} href={"https://kovan.etherscan.io/address/"+txDetails.receiver} callback={() => redirectWindowHash(txDetails.receiver, true)}/>
              <TextLink text={"- TX HASH "+txDetails.txHash.slice(0, 6) + "..."+txDetails.txHash.slice(-4)} href={"https://kovan.etherscan.io/tx/"+txDetails.txHash} callback={() => redirectWindowHash(txDetails.txHash, false)}/>
            </p>
        </ModalBody>
      </Fragment>
		);
	}
}