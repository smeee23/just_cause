import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBodyDeploy, ModalCtasDeploy } from "../Modal";
import TextField from '../TextField'
import { Button, ButtonSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import PoolTracker from "../../../contracts/PoolTracker.json";

import { updateDepositAmount } from  "../../actions/depositAmount";
import {updateDeployInfo} from "../../actions/deployInfo";
import { updateDeployTxResult } from  "../../actions/deployTxResult";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";
import { updatePendingTxList } from "../../actions/pendingTxList";

import { uploadToS3, uploadNftMetaData } from '../../func/awsS3'

import { delay, displayLogo, sha256Hash, isNativeToken } from '../../func/ancillaryFunctions';
import {checkInputError, addPoolToPoolInfo } from '../../func/contractInteractions';

class NewPoolModal extends Component {

  constructor(props) {
		super(props);
		const nativeToken = isNativeToken(this.props.networkId, "ETH") ? "ETH" : "MATIC";
		this.state = {
			isValidInput: 'valid',
			fileUploadHash:"",
      		amount: 0,
			acceptedTokens: [nativeToken],
			step: 0,
			poolName: "",
			receiver: "",
			about: "",
			tokens: "",
			inputError: "",
		}
	}

  deployOnChain = async(poolName, receiver, aboutText, acceptedTokens) => {
    let result;
	let txInfo;
	try{
		const aboutHash = await sha256Hash(aboutText);
		const metaUri = 'https://justcausepools.s3.amazonaws.com/'+poolName+"__meta";

		this.props.updateDeployInfo('');
		const web3 = await getWeb3(this.props.connect);
		const activeAccount = this.props.activeAccount;
		let tokenAddrs = [];
		for(let i = 0; i < acceptedTokens.length; i++){
			tokenAddrs.push(this.props.tokenMap[acceptedTokens[i]].address);
		}

		const gasPrice = (await web3.eth.getGasPrice()).toString();

		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1200000),
			gasPrice: web3.utils.toHex(gasPrice)
		};

		let PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			this.props.poolTrackerAddress,
		);

		console.log(poolName, "aboutHash", aboutHash, "picHash", this.state.fileUploadHash, "metaUri", metaUri);

		result = await PoolTrackerInstance.methods.createJCPoolClone(tokenAddrs, poolName, aboutHash, this.state.fileUploadHash, metaUri, receiver).send(parameter , async(err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash, tokenAddrs);
			if(!err){
				txInfo = {txHash: transactionHash, status: 'pending', poolAddress: '...', poolName: poolName, receiver: receiver, networkId: this.props.networkId};
				await this.props.updateDeployTxResult(txInfo);
				let pending = [...this.props.pendingTxList];
				if(!pending) pending= [];
				pending.push(txInfo);
				await this.props.updatePendingTxList(pending);
				sessionStorage.setItem("pendingTxList", JSON.stringify(pending));
			}
			else{
				txInfo = "";
			}
		});
		txInfo.poolAddress = result.events.AddPool.returnValues.pool;
		txInfo.status = 'success';

		await uploadToS3(aboutText, poolName, "__text");
		await uploadNftMetaData(poolName, aboutText);

		const newOwnerInfo = await addPoolToPoolInfo(txInfo.poolAddress, this.props.activeAccount, this.props.poolTrackerAddress, this.props.tokenMap, {...this.props.ownerPoolInfo}, this.props.connect);
		await this.props.updateOwnerPoolInfo(newOwnerInfo);
		sessionStorage.setItem("ownerPoolInfo", JSON.stringify(newOwnerInfo));
	}
	catch (error) {
		console.error(error);
		txInfo = "";
	}

	if(txInfo){
		this.displayDeployInfo(txInfo);
	}
  }

	displayDeployInfo = async(txInfo) => {
		this.props.updateDeployTxResult('');
		this.props.updateDeployTxResult(txInfo);
		await delay(5000);
		this.props.updateDeployTxResult('');
	}
  checkValues = () => {
	if(this.props.activeAccount === "Connect"){
		return true
	}
	return false
  }

  setValues = async() => {
	  /*let tokenInfo = tokens.state.selected;
	  for(let i = 0; i < tokens.state.selected.length; i++){
		tokenInfo[i] = tokenInfo[i].props.children;
	  }*/
	  await this.deployOnChain(this.state.poolName, this.state.receiver, this.state.about, this.state.acceptedTokens);
  }

  uploadPicToS3 = async() => {
	const reader = new FileReader();
    reader.onloadend = async() => {
        const buf = reader.result;
		await uploadToS3(buf, this.state.poolName, "__pic");
		const picHash = await sha256Hash(buf);
		this.setState({
			fileUploadHash: picHash
		});
    }
    const photo = document.getElementById("photo");
    reader.readAsArrayBuffer(photo.files[0]); // Read Provided File
  }

  fileUploadButton = () => {
	document.getElementById('photo').click();
	document.getElementById('photo').onchange = () =>{
		this.uploadPicToS3();
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
		const notAcceptedTokens = ["AAVE", "DPI", "LINK", "USDT"]
		if(isNativeToken(this.props.netowkrId, "ETH")){
			notAcceptedTokens.push("MATIC");
		}
		if(!notAcceptedTokens.includes(tokenName) )
			if(!this.state.acceptedTokens.includes(tokenName)){
				buttonHolder.push(<ButtonSmall text={tokenName} logo={displayLogo(tokenName)} icon={"plus"} key={i} callback={() => this.addToken(tokenName)}/>);
			}
			else{
				buttonHolder.push(<ButtonSmall text={tokenName} logo={displayLogo(tokenName)} icon={"check"} key={i} callback={() => this.removeToken(tokenName)}/>);
			}
	}
	return buttonHolder
  }

  getButton = () => {
	  if(this.state.step === 0){
		  return "Next =>";
	  }
	  return "Create Pool";
  }

  handleClick = async(obj) => {
	if(this.state.step === 1){
		this.setValues();
	}
	else if(this.state.step === 0){
		const poolTracker = this.props.poolTrackerAddress;
		const inputError = await checkInputError(obj, poolTracker, this.props.connect);
		this.setState({inputError});
		if(!this.state.inputError){
			this.setState({
				step: 1,
				poolName: obj.poolName,
				receiver: obj.receiver,
				about: obj.about
			});
		}
	}
  }

  handleClickBack = () => {
	if(this.state.step === 1){
		this.setState({
			step: 0,
		})
	}
  }

  handleInputSwitch = (poolInfo) => {
	let display;
	console.log("TEST", this.props.activeAccount === "Connect")
	if(this.state.step === 0){

		display = <Fragment>
			<ModalHeader>
					<h2 className="mb0">{ this.props.activeAccount === "Connect" ? "Please Connect to Network" : "Let's Get Started"}</h2>
       		 </ModalHeader>
			<ModalBodyDeploy>
				<div  className="modal__body__column__one">
				<p className="mr">1) Come up with a name for your JustCause Pool. This name will be unique to your Pool. No special characters.</p>
				</div>

				<div style={{maxWidth: "330px"}} className="modal__body__column__two">
					<TextField ref="poolName" label="Pool Name" id="poolName" placeholder="Name your pool"/>
				</div>
				<div className="modal__body__column__three">
					<p>2) Enter an address to receive the interest earned by contributions to your cause. The field defaults to the current account, but any valid address can be entered. Take care, this address cannot be changed once the pool is created.</p>

					<div style={{maxWidth: "330px"}}>
						<TextField ref="receiver" label="Receiving Address" value={poolInfo.activeAccount === "Connect" ? "no network connection": poolInfo.activeAccount}/>
					</div>
				</div>
				<div className="modal__body__column__five">
					<p style={{marginTop: "auto"}}>3) Tell us about your Cause! Whether your Cause is a public good, charity, DAO, etc. We want to give you the tools to fund it and share your inspiration with the world.</p>
				</div>

				<div className="modal__body__column__six">
					<TextField ref="about" label="Pool Description" placeholder="Describe your cause"/>
				</div>
			</ModalBodyDeploy>
			<ModalCtasDeploy>
			<p style={{color: "#DC143C", fontSize:16}} className="mr">{this.state.inputError}</p>
			<Button text={this.getButton()}
				disabled={this.checkValues()}
				callback={() => this.handleClick({poolName: this.refs.poolName.getValue(), receiver: this.refs.receiver.getValue(), about: this.refs.about.getValue()})}
			/>
			</ModalCtasDeploy>
			</Fragment>

	}
	else if(this.state.step === 1){

		display = <Fragment>
			<ModalHeader>
					<h2 className="mb0">Couple more things...</h2>
       		 </ModalHeader>
			<ModalBodyDeploy>
			<div className="modal__body__column__one--wide">
				<p>4) This is an optional step. This image will be on the NFT that your contributors receive. It will also be displayed on the JustCause site. If left blank image will default to the JustCause Logo </p>
				<div style={{display: "flex", justifyContent: "flex-end"}}>
					<input id="photo" type="file" hidden/>
					<Button disabled={this.isPhotoUploaded()} text={this.getUploadButtonText()} callback={() => this.fileUploadButton()} />
				</div>
			</div>

			<div className="modal__body__column__three" style={{gap: "8"}}>
				<p>5) Select the tokens your contributors will be able to deposit. You will receive these tokens in the receiver address when you or someone else calls the claim function.</p>
				<div className="card__token__buttons">
					{this.displayTokenSelection()}
				</div>
				<p>{"Accepted Tokens: " + this.state.acceptedTokens}</p>
			</div>
		</ModalBodyDeploy>
        <ModalCtasDeploy>
		<Button text="<= Back"
			callback={() => this.handleClickBack({tokens: this.refs.tokens})}
		 />
          <Button text={this.getButton()}
		  	disabled={this.checkValues()}
			callback={() => this.handleClick({tokens: this.refs.tokens})}
		 />
        </ModalCtasDeploy>
		</Fragment>
	}
	return display;
  }
  render() {
    const { poolInfo } = this.props;
		return (
			<Fragment>
				{this.handleInputSwitch(poolInfo)}
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
	ownerPoolInfo: state.ownerPoolInfo,
	connect: state.connect,
	pendingTxList: state.pendingTxList,
})

const mapDispatchToProps = dispatch => ({
  	updateDepositAmount: (amount) => dispatch(updateDepositAmount(amount)),
	updateDeployTxResult: (res) => dispatch(updateDeployTxResult(res)),
	updateDeployInfo: (res) => dispatch(updateDeployInfo(res)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updatePendingTxList: (tx) => dispatch(updatePendingTxList(tx)),
})



export default connect(mapStateToProps, mapDispatchToProps)(NewPoolModal)