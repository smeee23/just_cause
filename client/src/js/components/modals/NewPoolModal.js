import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBody, ModalCtas } from "../Modal";
import TextField from '../TextField'
import Select from '../Select'
import Button from '../Button'
import Icon from '../Icon'

import palette from '../../utils/palette'
import Multiselect from '../Multiselect'

import getWeb3 from "../../../getWeb3NotOnLoad";
import PoolTracker from "../../../contracts/PoolTracker.json";

import { updateDepositAmount } from  "../../actions/depositAmount";
import {updateDeployInfo} from "../../actions/deployInfo";
import { updateDeployTxResult } from  "../../actions/deployTxResult";

import { delay } from '../../func/ancillaryFunctions';

class NewPoolModal extends Component {

  constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
      		amount: 0,
		}
	}

  deployOnChain = async(poolName, receiver, about, acceptedTokens) => {
    let result;
	let txInfo;
	try{
		this.props.updateDeployInfo('');
		const web3 = await getWeb3();
		const activeAccount = this.props.activeAccount;
		console.log("acceptedTokens", acceptedTokens, this.props.tokenMap);
		let tokenAddrs = [];
		for(let i = 0; i < acceptedTokens.length; i++){
			tokenAddrs.push(this.props.tokenMap[acceptedTokens[i]].address);
		}
		console.log('poolTrackerAddress', this.props.poolTrackerAddress);
		console.log("receiver", receiver, typeof receiver);
		console.log("token addresses", tokenAddrs);

		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(800000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
		};

		let PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			this.props.poolTrackerAddress,
		);
		console.log('this.props.poolTrackerAddress', this.props.poolTrackerAddress);
		result = await PoolTrackerInstance.methods.createJCPoolClone(tokenAddrs, poolName, about, receiver).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			txInfo = {txHash: transactionHash, status: 'pending', poolAddress: '...', poolName: poolName, receiver: receiver};
			this.props.updateDeployTxResult(txInfo);
		});
		txInfo.poolAddress = result.events.AddPool.returnValues.pool;
		txInfo.status = 'success';
		console.log('deploy', result);
		console.log('txInfo', txInfo);
	}
	catch (error) {
		txInfo.status = 'failed';
		console.error(error);
	}
	this.displayDeployInfo(txInfo);
  }

	displayDeployInfo = async(txInfo) => {
		this.props.updateDeployTxResult('');
		this.props.updateDeployTxResult(txInfo);
		await delay(5000);
		this.props.updateDeployTxResult('');
	}
  checkValues = () => {
	return false;
  }

  setValues = async(poolName, receiver, about, tokens) => {
	  let tokenInfo = tokens.state.selected;
	  for(let i = 0; i < tokens.state.selected.length; i++){
		tokenInfo[i] = tokenInfo[i].props.children;
	  }
	  console.log('pool info', poolName, receiver, about, tokens.state.selected);
	  await this.deployOnChain(poolName, receiver, about, tokens.state.selected);
  }
  render() {
    const { poolInfo } = this.props;
	console.log('props', this.props);
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
          <TextField ref="poolName" label="Pool Name" id="poolName"/>
          <TextField ref="receiver" label="Receiving Address" value={poolInfo.activeAccount}/>
          <TextField ref="about" label="Pool Description" placeholder="Add a short description for your pool"/>
          <Multiselect ref="tokens" label="Accepted Tokens">
            <p className="mb0">DAI</p>
            <p className="mb0">USDC</p>
            <p className="mb0">MATIC</p>
            <p className="mb0">WBTC</p>
            <p className="mb0">USDT</p>
            <p className="mb0">AAVE</p>
			<p className="mb0">WETH</p>
          </Multiselect>
        </ModalBody>
        <ModalCtas>
          <Button text="Create"
		  	disabled={this.checkValues()}
			callback={() => this.setValues(this.refs.poolName.getValue(),
										this.refs.receiver.getValue(),
										this.refs.about.getValue(),
										this.refs.tokens)}
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
  	updateDepositAmount: (amount) => dispatch(updateDepositAmount(amount)),
	updateDeployTxResult: (res) => dispatch(updateDeployTxResult(res)),
	updateDeployInfo: (res) => dispatch(updateDeployInfo(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewPoolModal)