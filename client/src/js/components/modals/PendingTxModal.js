import React, {Component, Fragment} from "react"
import { ModalHeaderNoClose, ModalBody} from "../Modal";

export default class PendingTxModal extends Component {

  render() {
      const { txDetails } = this.props;

		return (
      <Fragment>
        <ModalHeaderNoClose>
          <h2 className="mb0">{txDetails.type + " PENDING"}</h2>
        </ModalHeaderNoClose>
        <ModalBody>
            <p>{txDetails.type + " " + txDetails.amount + " " + txDetails.tokenString }<br/>
               TX HASH: {txDetails.txHash.slice(0, 6) + "..."+txDetails.txHash.slice(-4)}<br/>
               POOL CONTRACT: {txDetails.poolAddress.slice(0, 6) + "..."+txDetails.poolAddress.slice(-4)}</p>
        </ModalBody>
      </Fragment>
		);
	}
}