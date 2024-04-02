import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button } from '../Button'
import { ButtonExtraSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import { ethers } from "ethers";

import PoolTracker from "../../../contracts/PoolTracker.json";
import ERC20Instance from "../../../contracts/IERC20.json";

import { updatePendingTx } from "../../actions/pendingTx";
import { updatePendingTxList } from "../../actions/pendingTxList";
import { updateTxResult } from  "../../actions/txResult";
import { updateDepositAmount } from  "../../actions/depositAmount";
import { updateUserDepositPoolInfo } from "../../actions/userDepositPoolInfo";
import { updateVerifiedPoolInfo } from "../../actions/verifiedPoolInfo";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";
import { updateApprove } from "../../actions/approve";

import { getAllowance, addPoolToPoolInfo, getContractInfo, getDirectFromPoolInfo, checkValueInputError } from '../../func/contractInteractions';
import { delay, getTokenBaseAmount, displayLogo, addNewPoolInfo, checkPoolInPoolInfo, isNativeToken } from '../../func/ancillaryFunctions';

class DepositModal extends Component {

  	constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
			inputError: '',
      		amount: 0,
			val: '0.0',
		}
	}

  setAmount = async(amount, depositInfo) => {
	depositInfo.amount = amount;
	const inputError = await checkValueInputError(amount, depositInfo.userBalance, "deposit");
	this.setState({inputError});
	if(!this.state.inputError){
		this.props.updateDepositAmount(depositInfo);
		await this.depositToChain();
	}
  }

  depositToChain = async() => {
			let txInfo;
			let result;
			try{
				const web3 = await getWeb3(this.props.connect);
				const tokenAddress = this.props.depositAmount.tokenAddress;
				const poolAddress = this.props.depositAmount.poolAddress;
				const tokenString = this.props.depositAmount.tokenString;
				const isETH = isNativeToken(this.props.networkId, tokenString);
				const activeAccount = this.props.activeAccount;

				const amount = this.props.depositAmount.amount;
				this.props.updateDepositAmount('');

				//const amountInBase_test = getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
				//const amountInBase = web3.utils.toWei(String(amount), "ether");
				const amountInBase = getTokenBaseAmount(amount, this.props.tokenMap[tokenString].decimals);

				const infuraRpc = "https://optimism-mainnet.infura.io/v3/"+process.env.REACT_APP_INFURA_KEY;
				const provider = new ethers.providers.JsonRpcProvider(infuraRpc);
				const maxPriorityFeePerGas = ((await provider.getFeeData()).maxPriorityFeePerGas).toString();
				let allowance;
				let parameter = {};
				if(!isETH){
					allowance = await getAllowance(tokenAddress, this.props.poolTrackerAddress, activeAccount, this.props.connect)

					parameter = {
						from: activeAccount,
						gas: web3.utils.toHex(1500000),
						maxPriorityFeePerGas: web3.utils.toHex(maxPriorityFeePerGas)
					};
				}

				else {
					parameter = {
						from: activeAccount,
						gas: web3.utils.toHex(1500000),
						maxPriorityFeePerGas: web3.utils.toHex(maxPriorityFeePerGas),
						value: amountInBase
					};
				}

				let PoolTrackerInstance = new web3.eth.Contract(
					PoolTracker.abi,
					this.props.poolTrackerAddress,
				);

				if(
					!isETH &&
					web3.utils.toBN(amountInBase).gt(web3.utils.toBN(allowance))
				){
					await this.props.updateApprove('');
					//approve token to deposit
					await this.props.updateApprove({tokenString: tokenString, tokenAddress: tokenAddress, poolAddress: poolAddress, activeAccount: activeAccount});
				}
				else{
					const poolName = await getContractInfo(poolAddress, this.props.connect);
					txInfo = {txHash: '', success: '', amount: amount, tokenString: tokenString, type:"DEPOSIT", poolAddress: poolAddress, poolName: poolName[6], networkId: this.props.networkId};

					result = await PoolTrackerInstance.methods.addDeposit(amountInBase, tokenAddress, poolAddress, isETH).send(parameter, async(err, transactionHash) => {
						console.log('Transaction Hash :', transactionHash);
						if(!err){
							let info = {txHash: transactionHash, amount: amount, tokenString: tokenString, type:"DEPOSIT", poolAddress: poolAddress, poolName: poolName[6], networkId: this.props.networkId, status:"pending"};
							let pending = [...this.props.pendingTxList];
							pending.push(info);
							await this.props.updatePendingTxList(pending);
							sessionStorage.setItem("pendingTxList", JSON.stringify(pending));
							await this.props.updatePendingTx(info);
							txInfo.txHash = transactionHash;

						}
						else{
							txInfo = "";
						}
					});
					txInfo.success = true;

					let newInfo;
					let newDepositInfo;
					if(checkPoolInPoolInfo(poolAddress, this.props.userDepositPoolInfo)){
						newInfo = await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress, this.props.connect);
						newDepositInfo = addNewPoolInfo({...this.props.userDepositPoolInfo}, newInfo);
					}
					else{
						console.log("POOL NOT FOUND IN DEPOSITS, ADDING POOL");
						newDepositInfo = await addPoolToPoolInfo(poolAddress, this.props.activeAccount, this.props.poolTrackerAddress, this.props.tokenMap, this.props.userDepositPoolInfo, this.props.connect);
					}
					await this.props.updateUserDepositPoolInfo(newDepositInfo);
					sessionStorage.setItem("userDepositPoolInfo", JSON.stringify(newDepositInfo));

					if(checkPoolInPoolInfo(poolAddress, this.props.ownerPoolInfo)){
						newInfo = newInfo ? newInfo : await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress, this.props.connect);
						const newOwnerInfo = addNewPoolInfo({...this.props.ownerPoolInfo}, newInfo);
						await this.props.updateOwnerPoolInfo(newOwnerInfo);
						sessionStorage.setItem("ownerPoolInfo", JSON.stringify(newOwnerInfo));
					}

					if(checkPoolInPoolInfo(poolAddress, this.props.verifiedPoolInfo)){
						newInfo = newInfo ? newInfo : await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress, this.props.connect);
						const newVerifiedInfo = addNewPoolInfo({...this.props.verifiedPoolInfo}, newInfo);
						await this.props.updateVerifiedPoolInfo(newVerifiedInfo);
						sessionStorage.setItem("verifiedPoolInfo", JSON.stringify(newVerifiedInfo));
					}

					let pending = [...this.props.pendingTxList];
					pending.forEach((e, i) =>{
						if(e.txHash === txInfo.transactionHash){
							e.status = "complete"
						}
					});
					await this.props.updatePendingTxList(pending);
					sessionStorage.setItem("pendingTxList", JSON.stringify(pending));

					pending = (pending).filter(e => !(e.txInfo === txInfo.transactionHash));
					await this.props.updatePendingTxList(pending);
					sessionStorage.setItem("pendingTxList", JSON.stringify(pending));
					}
			}
			catch (error) {
				console.error(error);
				txInfo = "";
			}

			if(txInfo){
				this.displayTxInfo(txInfo);
			}
	}

  displayDepositNotice = (depositInfo) => {
	const contractInfo = depositInfo.contractInfo;
	let userWarning;
	if(!contractInfo[2]){
		userWarning = <p style={{color: "red", marginLeft:"2%", marginRight:"0%"}} className="mr">{contractInfo[6]} is a user generated pool. The allocation of donations to user pools cannot be accounted for. We advise only contributing to user pools when you know the pool creator and receiver.</p>
	}
	else{
		userWarning = <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{contractInfo[6]} is a verified pool. Your donations are going to the right place!</p>
	}
	return(
		<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Deposits into {contractInfo[6]} pool are supplied to Aave lending pools to generate interest. The deposit is redeemable in full at any time. Any interest earned is donated to {contractInfo[6]} Cause by sending it to the receiver address.</p>
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
		let tf = <TextField ref="myField" label="amount to deposit:" value={this.state.val} />;
		return tf;
	}

	setInputValue = (userBalance) => {
		this.setState({ val : userBalance});
	}
  render() {
        const { depositInfo } = this.props;
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
			<div style={{display: "flex", marginLeft: "auto", marginTop:"auto", paddingBottom:"32px"}}>
				<p style={{color: "#DC143C", fontSize:16}} className="mr">{this.state.inputError}</p>
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
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolInfo: state.ownerPoolInfo,
	networkId: state.networkId,
	connect: state.connect,
	pendingTxList: state.pendingTxList,
})

const mapDispatchToProps = dispatch => ({
    updateDepositAmount: (amount) => dispatch(updateDepositAmount(amount)),
    updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updatePendingTxList: (tx) => dispatch(updatePendingTxList(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateApprove: (txInfo) => dispatch(updateApprove(txInfo)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DepositModal)