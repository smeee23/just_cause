import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBodyDeploy, ModalCtas } from "../Modal";
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
			acceptedTokens: ["MATIC"],
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
		result = await PoolTrackerInstance.methods.createJCPoolClone(tokenAddrs, poolName, about, this.state.fileUploadHash, receiver).send(parameter , (err, transactionHash) => {
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

  setValues = async(poolName, receiver, about) => {
	  /*let tokenInfo = tokens.state.selected;
	  for(let i = 0; i < tokens.state.selected.length; i++){
		tokenInfo[i] = tokenInfo[i].props.children;
	  }*/

	  const uploadResult = await uploadAbout(about);
	  console.log('pool info', poolName, receiver, uploadResult.hash, this.state.acceptedTokens);
	  const aboutHash = uploadResult.hash;
	  await this.deployOnChain(poolName, receiver, aboutHash, this.state.acceptedTokens);
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
	   return <img max-width='100%' height='auto' src={'https://ipfs.io/ipfs/'+this.state.fileUploadHash}/>
	}
  }

  isPhotoUploaded = () => {
	if(this.state.fileUploadHash){
		return true;
	}
  }

  getUploadButtonText = () => {
	if(this.state.fileUploadHash) return 'Photo Uploaded';
	return 'Upload Photo';
  }

  addToken = (tokenName) => {
	if(!this.state.acceptedTokens.includes(tokenName)){
		let acceptedTokens = this.state.acceptedTokens;
		acceptedTokens.push(tokenName);
		this.setState({acceptedTokens});
	}
  }

  removeToken = (tokenName) => {
	if(this.state.acceptedTokens.includes(tokenName)){
		let acceptedTokens = this.state.acceptedTokens;
		acceptedTokens = acceptedTokens.filter(value => {
			return value !== tokenName;
		});
		this.setState({acceptedTokens});
	}
  }

  displayTokenSelection = () => {
	const tokenStrings = Object.keys(this.props.tokenMap);
	let buttonHolder = [];
	for(let i = 0; i < tokenStrings.length; i++){
		const tokenName = tokenStrings[i];
		if(!this.state.acceptedTokens.includes(tokenName)){
			buttonHolder.push(<Button text={tokenName} icon={"plus"} key={i} callback={() => this.addToken(tokenName)}/>);
		}
		else{
			buttonHolder.push(<Button text={tokenName} icon={"check"} key={i} callback={() => this.removeToken(tokenName)}/>);
		}

	}
	return buttonHolder;
  }

  render() {
    const { poolInfo } = this.props;
	console.log('props', this.props);
		return (
      <Fragment>
        <ModalBodyDeploy>
			<div className="modal__body__column__one">
				<TextField ref="poolName" label="Pool Name" id="poolName" value="Name your pool"/>
			</div>

			<div style={{fontSize:17}}  className="modal__body__column__two">
				<p className="mr">Come up with a name for your JustCause Pool. This name will be unique to your Pool. </p>
			</div>

			<div className="modal__body__column__three">
				<TextField ref="receiver" label="Receiving Address" value={poolInfo.activeAccount}/>
			</div>

			<div style={{fontSize:17}} className="modal__body__column__four">
			<p className="mr">This is the address that receives the interest earned by contributions to your cause. Address defaults to the current account, but any valid address can be entered. This address can be changed later by the account creating the pool. </p>
			</div>

			<div className="modal__body__column__five">
				<TextField ref="about" label="Pool Description" value="Describe your cause"/>
			</div>

			<div style={{fontSize:17}}  className="modal__body__column__six">
				<p className="mr">Tell us about your Cause! Whether your Cause is a public good, charity, DAO, etc. we want to give you the tools to fund it and share your inspiration with the world.</p>
			</div>

			<div className="modal__body__column__seven">
				<input id="photo" type="file" hidden/>
				<Button disabled={this.isPhotoUploaded()} text={this.getUploadButtonText()} callback={() => this.fileUploadButton()} />
			</div>

			<div style={{fontSize:17}}  className="modal__body__column__eight">
				<p className="mr">This is an optional step. This image will be on the NFT that you and your contributors receive. It will also be displayed on the JustCause site. If left blank image will default to the JustCause Logo </p>
			</div>

			<div className="modal__body__column__nine">
				<h3 className="mb0">Token Selection:</h3>
			</div>

			<div style={{fontSize:17}} className="modal__body__column__ten">
				<p className="mr">Select the tokens your contributors will be able to deposit with.</p>
			</div>

			<div style={{fontSize:17}}  className="modal__body__column__eleven">
				{this.displayTokenSelection().slice(0, 4)}
			</div>

			<div style={{fontSize:17}}  className="modal__body__column__twelve">
				{this.displayTokenSelection().slice(4)}
			</div>

        </ModalBodyDeploy>
        <ModalCtas>
		  <p className="mr">{"Accepted Tokens: " + this.state.acceptedTokens}</p>
          <Button text="Create Pool"
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