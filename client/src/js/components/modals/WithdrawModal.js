import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBody, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import PoolTracker from "../../../contracts/PoolTracker.json";

import { updatePendingTx } from "../../actions/pendingTx";
import { updateTxResult } from  "../../actions/txResult";
import { updateWithdrawAmount } from  "../../actions/withdrawAmount";

import {getAmountBase} from '../../func/contractInteractions';
import {delay, getTokenBaseAmount} from '../../func/ancillaryFunctions';

const BigNumber = require('bignumber.js');

class WithdrawModal extends Component {

  constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
            amount: 0,
		}
	}

  setAmount = async(amount, withdrawInfo) => {
    /*if(!isNaN(amount)){
      if(Math.sign(amount) === 1){
        if(amount > withdrawInfo.balance){
          if(amount === 0){*/
            withdrawInfo.amount = amount;
            this.props.updateWithdrawAmount(withdrawInfo);
            await this.withdrawToChain();
          /*}
          else this.setState({isValidInput: 'zero', amount});
        }
        else this.setState({isValidInput: 'bal', amount});
      }
      else this.setState({isValidInput: 'neg', amount});
    }
    else this.setState({isValidInput: 'nan', amount});*/
  }

  withdrawToChain = async() => {
        let txInfo;
        let result;
        try{
            const web3 = await getWeb3();
            const tokenAddress = this.props.withdrawAmount.tokenAddress;
            const poolAddress = this.props.withdrawAmount.poolAddress;
            const tokenString = this.props.withdrawAmount.tokenString;
            const isETH = (tokenString === 'ETH' || tokenString === 'MATIC');
            const activeAccount = this.props.activeAccount;

            const amount = this.props.withdrawAmount.amount;
            this.props.updateWithdrawAmount('');

            const amountInBase_test = getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
				    //const amountInBase = web3.utils.toWei(String(amount), "ether");
            const amountInBase = getTokenBaseAmount(amount, this.props.tokenMap[tokenString].decimals);

            const parameter = {
                from: activeAccount,
                gas: web3.utils.toHex(1500000),
                gasPrice: web3.utils.toHex(web3.utils.toWei('1.500000025', 'gwei'))
            };

            let PoolTrackerInstance = new web3.eth.Contract(
                PoolTracker.abi,
                this.props.poolTrackerAddress,
            );

            txInfo = {txHash: '', success: false, amount: amount, tokenString: tokenString, type:"WITHDRAW", poolAddress: poolAddress};

            console.log('amountInBase', typeof amountInBase, amountInBase, typeof amountInBase_test, amountInBase_test);
            result = await PoolTrackerInstance.methods.withdrawDeposit(amountInBase, tokenAddress, poolAddress, isETH).send(parameter , (err, transactionHash) => {
                console.log('Transaction Hash :', transactionHash);
                this.props.updatePendingTx({txHash: transactionHash, amount: amount, tokenString: tokenString, type:"WITHDRAW", poolAddress: poolAddress});
                txInfo.txHash = transactionHash;
            });
            txInfo.success = true;
            console.log('withdraw', result)
		}
        catch (error) {
            console.error(error);
        }
        this.displayTxInfo(txInfo);
	}

  displayTxInfo = async(txInfo) => {
		this.props.updatePendingTx('');
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}

  getErrorMsg = () => {
    if(this.state.isValidInput === 'nan') return this.state.amount + " is not a number";
    else if(this.state.isValidInput === 'neg') return this.state.amount + " is a negative number";
    else if(this.state.isValidInput === 'bal') return this.state.amount + " exceeds your balance";
    else if(this.state.isValidInput === 'zero') return " amount cannot be zero";
  }
  render() {
        const { withdrawInfo } = this.props;
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Withdraw {withdrawInfo.tokenString}</h2>
        </ModalHeader>
        <ModalBody>
          <TextField ref="myField" label="amount to withdraw:" value={withdrawInfo.formatBalance} />
        </ModalBody>
        <ModalCtas>
          <Button text="Withdraw" callback={() => this.setAmount(this.refs.myField.getValue(), withdrawInfo)}/>
        </ModalCtas>
      </Fragment>
		);
	}
}

const mapStateToProps = state => ({
    tokenMap: state.tokenMap,
	  poolTrackerAddress: state.poolTrackerAddress,
    withdrawAmount: state.withdrawAmount,
    activeAccount: state.activeAccount,
})

const mapDispatchToProps = dispatch => ({
    updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
    updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawModal)