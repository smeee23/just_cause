import React, {Component, Fragment} from "react"
import { ModalHeaderNoClose, ModalBody} from "../Modal";

export default class DeployTxModal extends Component {

  successOrFail = (status) => {
    if(status === 'pending') return "PENDING POOL CREATION";
    else if(status === 'success') return "SUCCESSFUL POOL CREATION";
    else if(status === 'failed') return "FAILED POOL CREATION";
  }
  render() {
      const { txDetails } = this.props;

		return (
      <Fragment>
        <ModalHeaderNoClose>
          <h2 className="mb0">{this.successOrFail(txDetails.status)}</h2>
        </ModalHeaderNoClose>
        <ModalBody>
            <p>{"Pool Name: " + txDetails.poolName}<br/>
               {"Pool Address: " + txDetails.poolAddress.slice(0, 6) + "..."+txDetails.poolAddress.slice(-4)}<br/>
               {"Receiver: " + txDetails.receiver.slice(0, 6) + "..."+txDetails.receiver.slice(-4)}<br/>
               {"Tx Hash: " + txDetails.txHash.slice(0, 6) + "..."+txDetails.txHash.slice(-4)}</p>
        </ModalBody>
      </Fragment>
		);
	}
}