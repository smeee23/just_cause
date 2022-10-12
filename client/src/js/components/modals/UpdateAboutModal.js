import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBodyDeploy, ModalBody, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button, ButtonSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import JCPool from "../../../contracts/JustCausePool.json";

import { updateDepositAmount } from  "../../actions/depositAmount";
import {updateNewAbout} from "../../actions/newAbout";
import { updateDeployTxResult } from  "../../actions/deployTxResult";

import {upload} from '../../func/ipfs';

import { delay, displayLogo } from '../../func/ancillaryFunctions';
import {checkInputError} from '../../func/contractInteractions';
import { updatePendingTx } from "../../actions/pendingTx";
import { updateTxResult } from  "../../actions/txResult";

class UpdateAboutModal extends Component {

  constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
			fileUploadHash:"",
      		amount: 0,
			acceptedTokens: ["MATIC"],
			step: 0,
			poolName: "",
			receiver: "",
			about: "",
			tokens: "",
			inputError: "",
		}
	}

  updateMetaUriOnChain = async(poolName, aboutHash, aboutText, picHash, poolAddress) => {
	let result;
	let txInfo;
	try{

		const nftResult = await this.uploadNftMetaData(poolName, aboutText, picHash);
		const metaUri = 'https://ipfs.io/ipfs/'+nftResult.hash;

		const web3 = await getWeb3();
		const activeAccount = this.props.activeAccount;

		const gasPrice = (await web3.eth.getGasPrice()).toString();

		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1200000),
			gasPrice: web3.utils.toHex(gasPrice)
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			poolAddress,
		);

		txInfo = {txHash: [], status: '', success: '', type:"SET_ABOUT", poolAddress: poolAddress, poolName: poolName, networkId: this.props.networkId};

		result = await JCPool.methods.setMetaUri(metaUri).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			if(!err){
				txInfo.txHash.push(transactionHash);
				txInfo.status = 'pending';
				this.props.updatePendingTx(txInfo);
			}
			else{
				txInfo = "";
			}
		});

		txInfo.status = 'success';
	}
	catch (error) {
		console.error(error);
		txInfo = "";
	}

	if(txInfo){
		this.displayTxInfo(txInfo);
	}
  }

  updateAboutOnChain = async(poolName, aboutHash, aboutText, picHash, poolAddress) => {
    let result;
	let txInfo;
	try{

		const nftResult = await this.uploadNftMetaData(poolName, aboutText, picHash);
		const metaUri = 'https://ipfs.io/ipfs/'+nftResult.hash;

		const web3 = await getWeb3();
		const activeAccount = this.props.activeAccount;

		const gasPrice = (await web3.eth.getGasPrice()).toString();

		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1200000),
			gasPrice: web3.utils.toHex(gasPrice)
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			poolAddress,
		);

		txInfo = {txHash: [], status: '', success: '', type:"SET_ABOUT", poolAddress: poolAddress, poolName: poolName, networkId: this.props.networkId};

		JCPoolInstance.methods.setAbout(aboutHash).send(parameter);

		txInfo = {txHash: [], status: '', success: '', type:"SET_ABOUT", poolAddress: poolAddress, poolName: poolName, networkId: this.props.networkId};

		result = await JCPoolInstance.methods.setMetaUri(metaUri).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			if(!err){
				txInfo.txHash.push(transactionHash);
				txInfo.status = 'pending';
				this.props.updatePendingTx(txInfo);
			}
			else{
				txInfo = "";
			}
		});

		txInfo.status = 'success';
	}
	catch (error) {
		console.error(error);
		txInfo = "";
	}
	if(txInfo){
		this.displayTxInfo(txInfo);
	}
  }

  displayTxInfo = async(txInfo) => {
	this.props.updatePendingTx('');
	this.props.updateTxResult(txInfo);
	await delay(5000);
	this.props.updateTxResult('');
  }
  checkValues = () => {
	return false;
  }

  setAbout = async(poolName, aboutText, picHash, poolAddress) => {
	  const uploadResult = await upload(aboutText);
	  const aboutHash = uploadResult.hash;
	  this.props.updateNewAbout(this.props.newAboutInfo);
	  await this.updateAboutOnChain(poolName, aboutHash, aboutText, picHash, poolAddress);
	  //await this.updateMetaUriOnChain(poolName, aboutHash, aboutText, picHash, poolAddress)
  }

  uploadNftMetaData = async(poolName, aboutText, picHash) => {
    let uri = {
        "name": poolName,
        "description": aboutText,
        "image": "https://ipfs.io/ipfs/"+picHash,
    }

    const buf = Buffer.from(JSON.stringify(uri)); // Convert data into buffer
	const uploadResult = await upload(buf);
	return uploadResult;
}

  displayImage = () => {
	if(this.state.fileUploadHash){
	   return <img alt="" max-width='100%' height='auto' src={'https://ipfs.io/ipfs/'+this.state.fileUploadHash}/>
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

  getTokenLogo = (tokenName) => {
	  return <div> {displayLogo(tokenName)} {tokenName}</div>
  }
  displayTokenSelection = () => {
	const tokenStrings = Object.keys(this.props.tokenMap);
	let buttonHolder = [];
	for(let i = 0; i < tokenStrings.length; i++){
		const tokenName = tokenStrings[i];
		if(!["AAVE", "DPI"].includes(tokenName) )
			if(!this.state.acceptedTokens.includes(tokenName)){
				buttonHolder.push(<ButtonSmall text={tokenName} logo={displayLogo(tokenName)} icon={"plus"} key={i} callback={() => this.addToken(tokenName)}/>);
			}
			else{
				buttonHolder.push(<ButtonSmall text={tokenName} logo={displayLogo(tokenName)} icon={"check"} key={i} callback={() => this.removeToken(tokenName)}/>);
			}
	}
	return buttonHolder;
  }

  handleClick = async(obj) => {
	let about = obj.newAbout;
	if(obj.prevAbout){
		about = obj.prevAbout + " \\n " + about;
	}
	this.setAbout(obj.poolName, about, obj.picHash, obj.poolAddress);

  }

  getAbout = (about) => {
    console.log("size", about.length);
    /*if(about.length > 1000){
        about = about.slice(0, 999)+"...";
    }*/
    const paragraphs = about.split('\\n');
    about = [];
    for(let i = 0; i < paragraphs.length; i++){
        about[i] = <p key={i} style={{marginTop: "20px", whiteSpace: "pre-wrap"}} className="mr">{paragraphs[i].replace(/^\s+|\s+$/g, '')}</p>
    }
    return about;
  }

  render() {
    const { newAboutInfo } = this.props;

    console.log("info", newAboutInfo);
		return (
			<Fragment>
			<ModalHeader>
          		<h2 className="mb0">Update Your Cause Description</h2>
       		 </ModalHeader>
             <ModalBody>
			 	<div style={{display: "flex", flexDirection: "column", width:"100%"}}>
                	<h2 style={{fontSize:17}} className="mb0">Current Description:</h2>
                	{this.getAbout(newAboutInfo.about)}
					<h2 style={{paddingBottom:"16px", fontSize:17, marginTop:"32px"}} className="mr">Give an update or replace with a new description:</h2>
					<TextField ref="about" label="Pool Description" placeholder="give an update"/>
				</div>
             </ModalBody>
			 <ModalCtas>
				 <div style={{marginLeft:"auto", display:"flex", gap:"10px"}}>
					<Button text={"Update"}
						disabled={this.checkValues()}
						callback={() => this.handleClick({poolName: newAboutInfo.poolName, picHash: newAboutInfo.picHash, poolAddress: newAboutInfo.poolAddress, prevAbout: newAboutInfo.about, newAbout: this.refs.about.getValue()})}
					/>
					<Button text={"Replace"}
						disabled={this.checkValues()}
						callback={() => this.handleClick({poolName: newAboutInfo.poolName, picHash: newAboutInfo.picHash, poolAddress: newAboutInfo.poolAddress, newAbout: this.refs.about.getValue()})}
					/>
				</div>
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
	networkId: state.networkId,
})

const mapDispatchToProps = dispatch => ({
  	updateDepositAmount: (amount) => dispatch(updateDepositAmount(amount)),
	updateNewAbout: (about) => dispatch(updateNewAbout(about)),
	updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(UpdateAboutModal)