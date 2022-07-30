import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import { Button } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import PoolTracker from "../../../contracts/PoolTracker.json";
import ERC20Instance from "../../../contracts/IERC20.json";

import { updatePendingTx } from "../../actions/pendingTx";
import { updateTxResult } from  "../../actions/txResult";
import { updateClaim } from "../../actions/claim";

import {delay, displayLogo} from '../../func/ancillaryFunctions';

class ClaimModal extends Component {

    claim = async() => {
			let txInfo;
			let result;
			try{
				const web3 = await getWeb3();
				const tokenAddress = this.props.claim.tokenAddress;
				const poolAddress = this.props.claim.poolAddress;
				const tokenString = this.props.claim.tokenString;
				const isETH = (tokenString === 'ETH' || tokenString === 'MATIC');
				const activeAccount = this.props.activeAccount;
				const gasPrice = (await web3.eth.getGasPrice()).toString();
                this.props.updateClaim('');

				const parameter = {
                    from: activeAccount,
                    gas: web3.utils.toHex(1500000),
                    gasPrice: web3.utils.toHex(gasPrice)
                };

                let PoolTrackerInstance = new web3.eth.Contract(
                    PoolTracker.abi,
                    this.props.poolTrackerAddress,
                );
                txInfo = {txHash: '', success: '', amount: '', tokenString: tokenString, type:"CLAIM", poolAddress: poolAddress, networkId: this.props.networkId};
                result = await PoolTrackerInstance.methods.claimInterest(tokenAddress, poolAddress, isETH).send(parameter , (err, transactionHash) => {
                    console.log('Transaction Hash :', transactionHash);
					if(!err){
						this.props.updatePendingTx({txHash: transactionHash, amount: '', tokenString: tokenString, type:"CLAIM", poolAddress: poolAddress});
						txInfo.txHash = transactionHash;
					}
					else{
						console.log("MESSAGE", txInfo);
						txInfo = "";
					}
                });
                txInfo.success = true;
			}
			catch (error) {
				console.error(error);
				txInfo = "";
			}

			if(txInfo){
				this.displayTxInfo(txInfo);
			}
	}

  displayDepositNotice = (txInfo) => {
	console.log("Verified Poola", this.props.verifiedPoolAddrs)
	const contractInfo = txInfo.contractInfo;

	return(
		<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Calls made to the claim function will harvest interest and send the amount as a donation to the receiver of {contractInfo[6]}.</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Anyone can call this function and send donations to {contractInfo[6]} Cause.</p>
		</div>
	)

  }

  displayTxInfo = async(txInfo) => {
		this.props.updatePendingTx('');
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}

  render() {
        const { claimInfo } = this.props;
		console.log("claimInfo", claimInfo);
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Claim {displayLogo(claimInfo.tokenString)} {claimInfo.tokenString} for {claimInfo.contractInfo[6]}</h2>
        </ModalHeader>
        <ModalCtas>
			{this.displayDepositNotice(claimInfo)}
			<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"25px"}}>
          		<Button style={{marginLeft: "auto", marginTop:"auto"}} text="Claim" callback={() => this.claim()}/>
		  	</div>
        </ModalCtas>
      </Fragment>
		);
	}
}

const mapStateToProps = state => ({
  	tokenMap: state.tokenMap,
	poolTrackerAddress: state.poolTrackerAddress,
 	claim: state.claim,
	activeAccount: state.activeAccount,
	networkId: state.networkId,
})

const mapDispatchToProps = dispatch => ({
    updateClaim: (amount) => dispatch(updateClaim(amount)),
    updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ClaimModal)