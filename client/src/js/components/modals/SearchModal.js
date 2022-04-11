import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBody, ModalCtas } from "../Modal";
import TextField from '../TextField'
import Select from '../Select'
import { Button } from '../Button'
import Icon from '../Icon'

import palette from '../../utils/palette'
import Multiselect from '../Multiselect'

import getWeb3 from "../../../getWeb3NotOnLoad";
import PoolTracker from "../../../contracts/PoolTracker.json";

import { updateDepositAmount } from  "../../actions/depositAmount";
import { updateSearchInfo} from "../../actions/searchInfo";

import { delay } from '../../func/ancillaryFunctions';

import {searchPools } from '../../func/contractInteractions';

class SearchModal extends Component {

  constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
      		amount: 0,
          pending: false,
		}
	}

  checkValues = () => {
	return false;
  }

  setValue = async(searchTerm) => {
	  console.log('searchTerm', searchTerm);
    this.setState({
      pending: true
    });
    let results = await searchPools(this.props.poolTrackerAddress, this.props.activeAccount, this.props.tokenMap, searchTerm);
    this.props.updateSearchInfo(results);
  }

  getModalBody = (poolInfo) => {
    if(!this.state.pending && !this.props.linkAddress){
      return <TextField ref="searchTerm" label="Name or Address" placeholder="Enter Name or Address"/>
    }
    return <p>Searching...</p>
  }

  render() {
    const { poolInfo } = this.props;
    console.log('props search modal', this.props);
    if(this.props.linkAddress && !this.state.pending && this.props.poolTrackerAddress && this.props.activeAccount && this.props.tokenMap){
      this.setValue(this.props.linkAddress);
    }
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Enter Pool Contract Address or Name to Search (must be exact match, case sensitive):</h2>
        </ModalHeader>
        <ModalBody>
          {this.getModalBody(poolInfo)}
        </ModalBody>
        <ModalCtas>
          <Button text="Find Pool"
		  	disabled={this.checkValues()}
			callback={() => this.setValue(this.refs.searchTerm.getValue())}
		 />
        </ModalCtas>
      </Fragment>
		);
	}
}

const mapStateToProps = state => ({
  tokenMap: state.tokenMap,
	poolTrackerAddress: state.poolTrackerAddress,
 	depositAmount: state.depositAmount,
	activeAccount: state.activeAccount,
})

const mapDispatchToProps = dispatch => ({
  updateSearchInfo: (info) => dispatch(updateSearchInfo(info)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchModal)