import React, {Component, Fragment} from "react"
import { ModalHeader, ModalBody, ModalCtas } from "../Modal";
import TextField from '../TextField'
import Select from '../Select'
import Button from '../Button'
import Icon from '../Icon'

import palette from '../../utils/palette'
import Multiselect from '../Multiselect'

export default class NewPoolModal extends Component {
  render() {
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Create a new pool</h2>
        </ModalHeader>
        <ModalBody>
          <Select label="Icon">
            <Icon name="poolShape1" size={32} color={palette("brand-red")} strokeWidth={3}/>
            <Icon name="poolShape2" size={32} color={palette("brand-yellow")} strokeWidth={3}/>
            <Icon name="poolShape3" size={32} color={palette("brand-blue")} strokeWidth={3}/>
            <Icon name="poolShape4" size={32} color={palette("brand-pink")} strokeWidth={3}/>
            <Icon name="poolShape5" size={32} color={palette("brand-green")} strokeWidth={3}/>
          </Select>
          <TextField label="Pool Name" id="poolName"/>
          <TextField label="Recieving Address" value={"0x0c635327a1E3c935A55374b9c69D06978A182095"}/>
          <TextField label="Pool Description" placeholder="Add a short description for your pool"/>
          <Multiselect label="Accepted Tokens">
            <p className="mb0">DAI</p>
            <p className="mb0">USDC</p>
            <p className="mb0">ETH</p>
          </Multiselect>
        </ModalBody>
        <ModalCtas>
          <Button text="Create" disabled={true}/>
        </ModalCtas>
      </Fragment>
		);
	}
}