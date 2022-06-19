import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBody, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button } from '../Button'
import { ButtonExtraSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import PoolTracker from "../../../contracts/PoolTracker.json";
import ERC20Instance from "../../../contracts/IERC20.json";

import { updatePendingTx } from "../../actions/pendingTx";
import { updateTxResult } from  "../../actions/txResult";
import { updateDepositAmount } from  "../../actions/depositAmount";
import { updateUserDepositPoolInfo } from "../../actions/userDepositPoolInfo";

import {getAllowance, addUserDepositedPool} from '../../func/contractInteractions';
import {delay, getTokenBaseAmount, displayLogo} from '../../func/ancillaryFunctions';

class DepositModal extends Component {

  	constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
      		amount: 0,
			val: '0.0',
		}
	}

  setAmount = async(amount, depositInfo) => {
    /*if(!isNaN(amount)){
      if(Math.sign(amount) === 1){
        if(amount > depositInfo.balance){
          if(amount === 0){*/
            depositInfo.amount = amount;
            this.props.updateDepositAmount(depositInfo);
            await this.depositToChain();
          /*}
          else this.setState({isValidInput: 'zero', amount});
        }
        else this.setState({isValidInput: 'bal', amount});
      }
      else this.setState({isValidInput: 'neg', amount});
    }
    else this.setState({isValidInput: 'nan', amount});*/
  }

  depositToChain = async() => {
			let txInfo;
			let result;
			try{
				const web3 = await getWeb3();
				const tokenAddress = this.props.depositAmount.tokenAddress;
				const poolAddress = this.props.depositAmount.poolAddress;
				const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
				const tokenString = this.props.depositAmount.tokenString;
				const isETH = (tokenString === 'ETH' || tokenString === 'MATIC');
				const activeAccount = this.props.activeAccount;

				const amount = this.props.depositAmount.amount;
				this.props.updateDepositAmount('');

				//const amountInBase_test = getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
				//const amountInBase = web3.utils.toWei(String(amount), "ether");
				const amountInBase = getTokenBaseAmount(amount, this.props.tokenMap[tokenString].decimals);

				let parameter = {};
				if(!isETH){
					const allowance = await getAllowance(erc20Instance, this.props.poolTrackerAddress, activeAccount)
					if(parseInt(amountInBase) > parseInt(allowance)){
						alert("must approve token to deposit");
						await this.approve(tokenAddress, this.props.poolTrackerAddress, tokenString);
					}
					parameter = {
						from: activeAccount,
						gas: web3.utils.toHex(1500000),
						gasPrice: web3.utils.toHex(web3.utils.toWei('1.500000025', 'gwei'))
					};
				}

				else {
					parameter = {
						from: activeAccount,
						gas: web3.utils.toHex(1500000),
						gasPrice: web3.utils.toHex(web3.utils.toWei('1.500000025', 'gwei')),
						value: amountInBase
					};
				}

				let PoolTrackerInstance = new web3.eth.Contract(
					PoolTracker.abi,
					this.props.poolTrackerAddress,
				);

				console.log('poolTracker', this.props.poolTrackerAddress);
				console.log(PoolTrackerInstance.options.address);
				txInfo = {txHash: '', success: '', amount: amount, tokenString: tokenString, type:"DEPOSIT", poolAddress: poolAddress};

				console.log('amountInBase', typeof amountInBase, amountInBase);
				result = await PoolTrackerInstance.methods.addDeposit(amountInBase, tokenAddress, poolAddress, isETH).send(parameter, (err, transactionHash) => {
					console.log('Transaction Hash :', transactionHash);
					this.props.updatePendingTx({txHash: transactionHash, amount: amount, tokenString: tokenString, type:"DEPOSIT", poolAddress: poolAddress});
					txInfo.txHash = transactionHash;

				});
				txInfo.success = true;
				console.log('deposit', result);

				const tempPoolInfo = await addUserDepositedPool(poolAddress,
													this.props.activeAccount,
													this.props.poolTrackerAddress,
													this.props.tokenMap,
													this.props.userDepositPoolInfo);
				console.log('tempPoolInfo', tempPoolInfo);
				if(tempPoolInfo){
					console.log('tempPoolInfo', tempPoolInfo);
					this.props.updateUserDepositPoolInfo(tempPoolInfo);
				}
				else{
					console.log('userDepositPoolInfo', this.props.userDepositPoolInfo);
				}
			}
			catch (error) {
				console.error(error);
			}
			this.displayTxInfo(txInfo);
	}

  displayDepositNotice = (depositInfo) => {
	console.log("Verified Poola", this.props.verifiedPoolAddrs)
	const contractInfo = depositInfo.contractInfo;
	let userWarning;
	if(contractInfo[2]){
		userWarning = <p style={{color: "red", marginLeft:"2%", marginRight:"0%"}} className="mr">{contractInfo[6]} is a user generated pool. The allocation of donations to user pools cannot be accounted for. We advise only contributing to user pools when you know the pool creator and receiver.</p>
	}
	else{
		userWarning = <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{contractInfo[6]} is a verified pool. Your donations are going to the right place!</p>
	}
	return(
		<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Deposits into {contractInfo[6]} pool are supplied to Aave lending pools to generate interest. The deposit is redeemable in full at anytime. Any interest earned is donated to {contractInfo[6]} Cause by sending it to the receiver address.</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">An NFT is minted for Contributors to the pool. The Contributor’s token acts as an on-chain receipt by storing deposit information. It cannot be sold or transferred.</p>
			{userWarning}
		</div>
	)

  }

  displayTxInfo = async(txInfo) => {
		this.props.updatePendingTx('');
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}

	getTextField = (userBalance) => {
		console.log("val", this.state.val);
		let tf = <TextField ref="myField" label="amount to deposit:" value={this.state.val} />;
		console.log('tf', tf);
		return tf;
	}

	setInputValue = (userBalance) => {
		this.setState({ val : userBalance});
	}

  getErrorMsg = () => {
    if(this.state.isValidInput === 'nan') return this.state.amount + " is not a number";
    else if(this.state.isValidInput === 'neg') return this.state.amount + " is a negative number";
    else if(this.state.isValidInput === 'bal') return this.state.amount + " exceeds your balance";
    else if(this.state.isValidInput === 'zero') return " amount cannot be zero";
  }
  render() {
        const { depositInfo } = this.props;
		console.log("depositInfo", depositInfo);
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Deposit {displayLogo(depositInfo.tokenString)} {depositInfo.tokenString} for {depositInfo.contractInfo[6]}</h2>
        </ModalHeader>
        <ModalCtas>
			{this.displayDepositNotice(depositInfo)}
			<div style={{marginLeft: "auto", marginTop:"auto", display:"flex", flexDirection: "column", alignItems:"flex-end", justifyContent:"left"}}>
				<div style={{display:"flex", fontSize: 9, flexDirection: "wrap", gap: "10px", alignItems:"right", justifyContent:"center"}}>
					<p>{displayLogo(depositInfo.tokenString)}{depositInfo.tokenString}: {depositInfo.userBalance}</p>
					<ButtonExtraSmall text="MAX" callback={() => this.refs.myField.replaceValue(depositInfo.userBalance)}/>

				</div>
				<div style={{marginLeft: "auto", marginTop:"auto"}}>
					<TextField ref="myField" label="amount to deposit:" value={this.state.val} />
				</div>
			</div>
			<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"25px"}}>
          		<Button style={{marginLeft: "auto", marginTop:"auto"}} text="Deposit" callback={() => this.setAmount(this.refs.myField.getValue(), depositInfo)}/>
		  	</div>
        </ModalCtas>
      </Fragment>
		);
	}
}

const mapStateToProps = state => ({
  	tokenMap: state.tokenMap,
	poolTrackerAddress: state.poolTrackerAddress,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
 	depositAmount: state.depositAmount,
	activeAccount: state.activeAccount,
	userDepositPoolInfo: state.userDepositPoolInfo,
})

const mapDispatchToProps = dispatch => ({
    updateDepositAmount: (amount) => dispatch(updateDepositAmount(amount)),
    updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DepositModal)