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

import {uploadAbout, getAbout, getIpfsDataBuffer} from '../../func/ipfs';

import { delay } from '../../func/ancillaryFunctions';

class NewPoolModal extends Component {

  constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
			fileUploadHash:"",
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
			gas: web3.utils.toHex(1000000),
			gasPrice: web3.utils.toHex(web3.utils.toWei('1.500000025', 'gwei'))
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

	  const uploadResult = await uploadAbout(about);
	  console.log('pool info', poolName, receiver, uploadResult.hash, tokens.state.selected);
	  const aboutHash = uploadResult.hash;
	  await this.deployOnChain(poolName, receiver, aboutHash, tokens.state.selected);
  }

  uploadToIpfs = async() => {
	const reader = new FileReader();
    reader.onloadend = async() => {
        const buf = Buffer(reader.result) // Convert data into buffer
		const uploadResult = await uploadAbout(buf);
		console.log('upload photo', uploadResult);
		this.setState({
			fileUploadHash: uploadResult.hash
		});

		/*const bufs = await getIpfsDataBuffer(this.state.fileUploadHash);

		const data = Buffer.concat(bufs)

		let blob = new Blob([data], {type:"image/jpg"})
		let img = document.getElementById("target") // the img tag you want it in
		img.src = window.URL.createObjectURL(blob)
		console.log('img', img);*/
    }
    const photo = document.getElementById("photo");
    reader.readAsArrayBuffer(photo.files[0]); // Read Provided File

  }

  fileUploadButton = () => {
	console.log('fileUploadButton 1');
	document.getElementById('photo').click();
	document.getElementById('photo').onchange = () =>{
		this.uploadToIpfs();
	}
  }

  displayImage = () => {
	  if(this.state.fileUploadHash){
		  return <img src={'https://ipfs.io/ipfs/'+this.state.fileUploadHash}/>
	  }
  }

  render() {
    const { poolInfo } = this.props;
	console.log('props', this.props);
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">create new pool</h2>
        </ModalHeader>
        <ModalBody>
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
		  <input id="photo" type="file" hidden/>
		  <Button text="Upload Photo" callback={() => this.fileUploadButton()} />
		  {this.displayImage()}
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