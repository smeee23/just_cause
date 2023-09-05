import React, { Component, Fragment } from "react"
import classNames from "classnames";

import { connect } from "react-redux";

import Icon from "./Icon";
import palette from "../utils/palette";

import { Button, ButtonSmall } from '../components/Button';

import { updatePendingTx } from "../actions/pendingTx";
import { updateTxResult } from  "../actions/txResult";
import { updateDepositAmount } from  "../actions/depositAmount";
import { updateWithdrawAmount } from  "../actions/withdrawAmount";
import { updateClaim } from "../actions/claim";
import { updateApprove } from "../actions/approve";
import { updateTokenMap } from "../actions/tokenMap"
import { updateVerifiedPoolInfo } from "../actions/verifiedPoolInfo"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"
import { updateShare } from  "../actions/share";
import { updateNewAbout } from  "../actions/newAbout";

import { getBalance, getContractInfo , getDirectFromPoolInfoAllTokens} from '../func/contractInteractions';
import { precise, delay, getHeaderValuesInUSD, getFormatUSD, displayLogo, displayLogoMd, displayLogoLg, redirectWindowBlockExplorer, isNativeToken, redirectWindowUrl, digitsWithMaxTenLength, copyToClipboard, checkPoolInPoolInfo, addNewPoolInfoAllTokens } from '../func/ancillaryFunctions';
import { verifiedPoolMap } from '../func/verifiedPoolMap';
import { Modal, SmallModal, LargeModal } from "../components/Modal";
import DepositModal from '../components/modals/DepositModal'
import WithdrawModal from '../components/modals/WithdrawModal'
import ClaimModal from '../components/modals/ClaimModal'
import ApproveModal from '../components/modals/ApproveModal'
import PendingTxModal from "../components/modals/PendingTxModal";
import DeployTxModal from "../components/modals/DeployTxModal";
import ShareModal from "../components/modals/ShareModal";
import UpdateAboutModal from "./modals/UpdateAboutModal";

class Card extends Component {
	interval = 0;

	constructor(props) {
		super(props);

		this.state = {
			open: false,
			loading: false,
			selectedTokenIndex: this.highestDeposit(this.props.acceptedTokenInfo),
			tokenButtons: [],
			tokenInfo: this.props.acceptedTokenInfo,
			copied: false,
			directResponse: "",
			picUrl: "",
		}
	}

	highestDeposit = (acceptedTokenInfo) =>{
		let highVal = 0.0;
		let highIndex = 0;
		for(let i = 0; i <  acceptedTokenInfo.length; i++){
			const item = acceptedTokenInfo[i];
			const priceUSD = this.props.tokenMap[item.acceptedTokenString] && this.props.tokenMap[item.acceptedTokenString].priceUSD;
			const usdAmount = precise(item.userBalance, item.decimals) * priceUSD;
			if(usdAmount > highVal){
				highVal = usdAmount;
				highIndex = i;
			}
		}
		return highIndex;
	}

  	componentDidMount = async () => {
		window.scrollTo(0,0);
		try{
			window.scrollTo(0,0);
			if(this.props.deployInfo) await this.props.updateDeployInfo('');
			if(this.props.newAbout) await this.props.updateNewAbout('');
			if(this.props.depositAmount) await this.props.updateDepositAmount('');
			if(this.props.withdrawAmount) await this.props.updateWithdrawAmount('');
			if(this.props.approve) await this.props.updateApprove('');
			if(this.props.share) await this.props.updateShare("");
			if(this.props.claim)  await this.props.updateClaim('');

			this.setState({ tokenInfo: this.props.acceptedTokenInfo })
		}
		catch (error) {
			alert(
				error,
			);
			console.error(error);
		}
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	displayWithdraw = (item, address, tokenString, title) => {
		if(item.userBalance > 0){
			if(this.props.isMobile) return <div title={"withdraw deposit"}><ButtonSmall logo={displayLogo(tokenString)} text={"Withdraw "+tokenString} /*disabled={isDisabled}*/ callback={async() => await this.withdrawDeposit(address, item.address, item.userBalance)}/></div>

			return <div title={"withdraw deposit"}><Button logo={displayLogo(tokenString)} text={"Withdraw "+tokenString} /*disabled={isDisabled}*/ callback={async() => await this.withdrawDeposit(address, item.address, item.userBalance)}/></div>
		}
	}

	displayClaim = (item, address, title) => {
		if(item.unclaimedInterest > 500){
			if(this.props.isMobile) return <div title={"harvest donations for "+title}><ButtonSmall logo={displayLogo(item.acceptedTokenString)} text={"Harvest Donations"} /*disabled={isDisabled}*/ callback={async() => await this.claim(address, item.address, item.unclaimedInterest)}/></div>
			return <div title={"harvest donations for "+title}><Button logo={displayLogo(item.acceptedTokenString)} text={"Harvest Donations"} /*disabled={isDisabled}*/ callback={async() => await this.claim(address, item.address, item.unclaimedInterest)}/></div>
		}
	}
	displayDepositOrApprove = (poolAddress, tokenAddress, isEth, tokenString, allowance, title) => {
		if(isEth){
			if(this.props.isMobile) return  <div title={"earn donations for "+title}><ButtonSmall logo={displayLogo(tokenString)} text={"Deposit "+tokenString} /*disabled={isDisabled}*/ callback={async() => await this.deposit(poolAddress, tokenAddress)}/></div>
			return  <div title={"earn donations for "+title}><Button logo={displayLogo(tokenString)} text={"Deposit "+tokenString} /*disabled={isDisabled}*/ callback={async() => await this.deposit(poolAddress, tokenAddress)}/></div>
		}
		if(Number(allowance) === 0){
			if(this.props.isMobile) return <div title={"required before deposit"}><ButtonSmall logo={displayLogo(tokenString)} text={"Approve "+tokenString} /*disabled={isDisabled}*/ callback={async() => await this.approve(tokenAddress, tokenString, poolAddress)}/></div>
			return <div title={"required before deposit"}><Button logo={displayLogo(tokenString)} text={"Approve "+tokenString} /*disabled={isDisabled}*/ callback={async() => await this.approve(tokenAddress, tokenString, poolAddress)}/></div>
		}
		if(this.props.isMobile) return <div title={"earn donations for "+title}><ButtonSmall logo={displayLogo(tokenString)} text={"Deposit "+tokenString} /*disabled={isDisabled}*/ callback={async() => await this.deposit(poolAddress, tokenAddress)}/></div>
		return <div title={"earn donations for "+title}><Button logo={displayLogo(tokenString)} text={"Deposit "+tokenString} /*disabled={isDisabled}*/ callback={async() => await this.deposit(poolAddress, tokenAddress)}/></div>
	}
	toggleCardOpen = () => {
		this.setState({
			open: !this.state.open
		})
	}

	setSelectedToken = (index) => {
		this.setState({
			selectedTokenIndex: index,
		});
		this.resetAnimation();
	}

	copyToClipboard = (receiver) => {
		copyToClipboard(receiver);

		this.setState({
			copied: true,
		});
	}
	createTokenButtons = (acceptedTokenInfo) => {
		if(!this.state.open) return;
		if (!acceptedTokenInfo) return 'no data';
		let buttonHolder = [];
		for(let i = 0; i < acceptedTokenInfo.length; i++){
			const tokenName = acceptedTokenInfo[i].acceptedTokenString;
			let isDisabled = false;
			if(i === this.state.selectedTokenIndex) isDisabled = true;
			buttonHolder.push(<ButtonSmall text={tokenName} logo={displayLogo(tokenName)} disabled={isDisabled} key={i} callback={() => this.setSelectedToken(i)}/>)
		}
		return buttonHolder;
	}

	notifyLoad = () => {
		//console.log('image Loaded')
	}
	getPoolImage = (poolName) => {

		let image;

		const handleImageError = (event) => {
			// If the image fails to load, set the src to the fallbackSrc
			event.target.src = "https://justcausepools.s3.amazonaws.com/jc_logo.png";
		  };


		const picUrl = "https://justcausepools.s3.amazonaws.com/"+poolName+"__pic";
		image = <img alt="" className="card__pool-pic" onError={handleImageError} src={picUrl} onLoad={this.notifyLoad()}/>;
		return image;
	}

	getIsVerified = (isVerified) => {
		if(isVerified){
			return <h3 className="mb0" style={{fontSize: 13, color: "green", display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap"}}>(Verified Pool)</h3>
		}
		else{
			return <h3 className="mb0" style={{fontSize: 13}}>(User Pool)</h3>
		}
	}

	getAPY = (depositAPY) => {
		if(depositAPY){
			if(depositAPY.includes("e-")){
				depositAPY = "0.000"
			}
			return (<p>{" "+ depositAPY+'% APY'}</p>);
		}
	}

	getVerifiedLinks = (isVerified, poolName) => {
		if(!poolName) return;
		if(isVerified && this.props.networkId === 10){
			const name = poolName.replace(/\s+/g, '');
			const keys = Object.keys(verifiedPoolMap)
			if(keys.includes(name)){
			const url = (verifiedPoolMap[name] && verifiedPoolMap[name]).siteUrl;
				return(
					<div title="more about organaization">
						<Button isLogo="link" callback={() => redirectWindowUrl(url)}/>
					</div>
				);
			}
		}
	}

	getCopyButton = (receiver) => {
		if(this.state.copied){
			return (
				<div title="copy receiving address to clipboard"><Button isLogo="copy_white_check" disable="true" callback={() => this.copyToClipboard(receiver)}/></div>
			);
		}
		return (
			<div title="copy receiving address to clipboard"><Button isLogo="copy_white" disable="true" callback={() => this.copyToClipboard(receiver)}/></div>
		);
	}

	getAbout = (isReceiver) => {

		const title = this.props.title;
		const about = this.props.about;
		const picHash = this.props.picHash;
		const address = this.props.address;

		if(this.state.directResponse){
			about = this.state.directResponse;
			console.log("directResponse", typeof about, typeof this.state.directResponse)
		}
		if(!about){
			console.log("about does not exist", address);
			about = "(There is a delay loading the description)"
		}
			let aboutString = about;
			let aboutHolder = [];
			let editButton = ""
			if(about.includes("\\n")){
				const paragraphs = about.split(/\\n/);
				for(let i = 0; i < paragraphs.length; i++){
					const mt = i === 0 ? "0px" : "20px";
					aboutHolder.push(<p key={i} style={{marginTop: mt, whiteSpace: "pre-wrap"}} className="mb0">{paragraphs[i].replace(/^\s+|\s+$/g, '')}</p>);
				}
			}
			else{
				aboutHolder.push(<p key="0" style={{whiteSpace: "pre-wrap"}} className="mb0">{about.replace(/^\s+|\s+$/g, '')}</p>);
			}
			if(isReceiver){
				editButton = (
					<div key={aboutHolder.length} title={"update the description for your cause"} style={{marginBottom: "20px"}}>
						<ButtonSmall text={"Edit Description"} callback={async() => await this.updateAbout(aboutString, address, picHash, title)}/>
					</div>
				);
			}
			return {aboutHolder, editButton};
	}

	resetAnimation = () => {
		const el = document.getElementById("animated");
		el.style.animation = "none";
		let temp = el.offsetHeight;
		el.style.animation = null;
	}

	createPoolInfo = (isReceiver) => {
		if (!this.props.acceptedTokenInfo) return '';
		if (!this.props.tokenMap) return '';

		const address = this.props.address;
		const title = this.props.title;
		const receiver = this.props.receiver;
		const about = this.props.about;
		const picHash = this.props.picHash;
		const isVerified = this.props.isVerified;

		const {aboutHolder, editButton} = this.getAbout(isReceiver)

		const tokenInfo =
			<div className="card__body__left">
				<div style={{display: "flex", flexDirection: "wrap"}}>
					<div className="card__body__column__one">
					<div >
						<div title="view on block explorer">
							<div style={{display: "flex", flexDirection: "wrap", gap: "3px"}}>
								<ButtonSmall text={"Receiver "+receiver.slice(0, 6) + "..."+receiver.slice(-4)} callback={() => redirectWindowBlockExplorer(receiver, 'address', this.props.networkId)}/>
								{this.getCopyButton(receiver)}
							</div>
							<ButtonSmall text={"Pool "+address.slice(0, 6) + "..."+address.slice(-4)} callback={() => redirectWindowBlockExplorer(address, 'address', this.props.networkId)}/>
						</div>
					</div>
					</div>
					<div className="card__body__column__two">
						{this.getPoolImage(title)}
					</div>
				</div>
				<div className="card__body__column__eight">
					<div className="card__about-box">
						{aboutHolder}
					</div>
					{editButton}
					{!this.props.isMobile ?
						<div style={{display: "flex", flexDirection: "wrap", gap: "16px"}}>
							{this.getVerifiedLinks(isVerified, title)}
							<div title={"share "+ title} style={{bottom: "0px", color: "red"}}>
								<Button isLogo="share" callback={async() => await this.share(address, title )} />
							</div>
						</div> : ""
					}
				</div>
			</div>
		return tokenInfo;
	}

	createTokenInfo = () => {
		if (!this.props.acceptedTokenInfo) return '';
		if (!this.props.tokenMap) return '';

		const address = this.props.address;
		const title = this.props.title;
		const item = this.state.tokenInfo[this.state.selectedTokenIndex];
		const isVerified = this.props.isVerified;

		const depositAPY = this.props.tokenMap[item.acceptedTokenString] && this.props.tokenMap[item.acceptedTokenString].depositAPY;
		const isETH = isNativeToken(this.props.networkId, item.acceptedTokenString);

		const priceUSD = this.props.tokenMap[item.acceptedTokenString] && this.props.tokenMap[item.acceptedTokenString].priceUSD;

		const tokenInfo =
			<div id="animated" className="card__balance-grid--outer">
				<div className="card__balance-box">
					<div className="card__body__column__nine">
						<div className="card__body__token-logo">
							<div style={{gridColumn: 1}}>
								{this.props.isMobile ? displayLogoMd(item.acceptedTokenString) : displayLogoLg(item.acceptedTokenString)}
							</div>
							<div style={{gridColumn: 2, marginRight: "auto", marginTop: "auto"}}>
								<h5 className="mb0">  {item.acceptedTokenString} </h5>
								{this.getAPY(depositAPY)}
							</div>
						</div>
						<div title="user balance" className="card__balance-grid--inner" >
							<div style={{gridColumn: 1}}>
								<p>{"Balance"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250px"}}>
								<p >{digitsWithMaxTenLength(precise(item.userBalance, item.decimals))+"  (" +getFormatUSD(precise(item.userBalance, item.decimals), priceUSD)+")"}</p>
							</div>
						</div>
						<div title="pool balance" className="card__balance-grid--inner">
							<div style={{gridColumn: 1}}>
								<p>{"Pool"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250px"}}>
								<p>{digitsWithMaxTenLength(precise(item.totalDeposits, item.decimals))+"  (" +getFormatUSD(precise(item.totalDeposits, item.decimals),priceUSD)+")"}</p>
							</div>
						</div>
						<div title={"unharvested "+item.acceptedTokenString+" for "+title} className="card__balance-grid--inner">
							<div style={{gridColumn: 1}}>
								<p>{"Earned"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{digitsWithMaxTenLength(precise(item.unclaimedInterest, item.decimals)) +"  (" +getFormatUSD(precise(item.unclaimedInterest, item.decimals), priceUSD)+")"}</p>
							</div>
						</div>
						<div title={item.acceptedTokenString+" harvested and sent to "+title} className="card__balance-grid--inner">
							<div style={{gridColumn: 1}}>
								<p>{"Donated"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250px"}}>
								<p>{digitsWithMaxTenLength(precise(item.claimedInterest, item.decimals))+"  (" +getFormatUSD(precise(item.claimedInterest, item.decimals), priceUSD)+")" }</p>
							</div>
						</div>
						<div className="card__dep-buttons-col">
							{this.displayClaim(item, address, title)}
							{this.displayWithdraw(item, address, item.acceptedTokenString, title)}
							{this.displayDepositOrApprove(address, item.address, isETH, item.acceptedTokenString, this.props.tokenMap[item.acceptedTokenString].allowance, title)}
						</div>
						{this.props.isMobile ?
							<div style={{display: "flex", flexDirection: "wrap", gap: "16px"}}>
								{this.getVerifiedLinks(isVerified, title)}
								<div title={"share "+ title}>
									<Button isLogo="share" callback={async() => await this.share(address, title )} />
								</div>
							</div> : ""
						}
					</div>
				</div>
				<div className="card__dep-buttons-flex">
					{this.displayDepositOrApprove(address, item.address, isETH, item.acceptedTokenString, this.props.tokenMap[item.acceptedTokenString].allowance, title)}
					{this.displayWithdraw(item, address, item.acceptedTokenString, title)}
					{this.displayClaim(item, address, title)}
				</div>
		</div>

		//if(this.props.isMobile) return;
		return tokenInfo;
	}

	getUpdateAboutModal = () => {
		if(this.props.newAbout){
			let modal = <LargeModal isOpen={true}><UpdateAboutModal newAboutInfo={this.props.newAbout}/></LargeModal>
			return modal;
		}
	}
	updateAbout = async(aboutString, address, picHash, title) => {
		await this.props.updateNewAbout('');
		console.log("update about clicked", this.props.newAbout);
		try{
			await this.props.updateNewAbout({about: aboutString, poolAddress: address, picHash: picHash, poolName: title});
		}
		catch (error) {
			console.error(error);
		}
	}

	getDepositAmountModal = () => {
		if(this.props.depositAmount){
			let modal = <Modal isOpen={true}><DepositModal depositInfo={this.props.depositAmount}/></Modal>
			return modal;
		}
	}

	deposit = async(poolAddress, tokenAddress) => {
		await this.props.updateDepositAmount('');
		console.log('deposit clicked', this.props.depositAmount);
		try{
			const tokenMap = this.props.tokenMap;
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
			const activeAccount = this.props.activeAccount;
			const userBalance = await getBalance(tokenAddress, tokenMap[tokenString].decimals, tokenString, activeAccount, this.props.networkId);
			const contractInfo = await getContractInfo(poolAddress);
			await this.props.updateDepositAmount({tokenString: tokenString, tokenAddress: tokenAddress, userBalance: userBalance, poolAddress: poolAddress, contractInfo: contractInfo, activeAccount: activeAccount, amount: ''});
			//this.updatePoolInfo(this.props.depositAmount.poolAddress, this.props.depositAmount.activeAccount);
		}
		catch (error) {
			console.error(error);
		}
	}

	getWithdrawAmountModal = () => {
		if(this.props.withdrawAmount){
			let modal = <Modal isOpen={true}><WithdrawModal withdrawInfo={this.props.withdrawAmount}/></Modal>
			return modal;
		}
	}
	withdrawDeposit = async(poolAddress, tokenAddress, rawBalance) => {
		this.props.updateWithdrawAmount('');
		console.log('withdraw clicked');
		try{
			const tokenMap = this.props.tokenMap;
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
			const activeAccount = this.props.activeAccount;
			const contractInfo = await getContractInfo(poolAddress);
			let formatBalance = precise(rawBalance, tokenMap[tokenString].decimals);
			if(rawBalance /10**tokenMap[tokenString].decimals < formatBalance){
				alert('withdraw amount issue');
			}
			await this.props.updateWithdrawAmount({tokenString: tokenString, tokenAddress: tokenAddress, formatBalance: formatBalance, rawBalance: rawBalance, poolAddress: poolAddress, contractInfo: contractInfo, activeAccount: activeAccount, amount: ''});
		}
		catch (error) {
			console.error(error);
		}
	}

	getClaimModal = () => {
		if(this.props.claim){
			let modal = <SmallModal isOpen={true}><ClaimModal claimInfo={this.props.claim}/></SmallModal>
			return modal;
		}
	}

	claim = async(poolAddress, tokenAddress, unclaimedInterest) => {
		await this.props.updateClaim('');
		console.log('claim interest clicked', poolAddress);
		try{
			const activeAccount = this.props.activeAccount;
			const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === tokenAddress);
			const contractInfo = await getContractInfo(poolAddress);

			await this.props.updateClaim({tokenString: tokenString, tokenAddress: tokenAddress, poolAddress: poolAddress, contractInfo: contractInfo, activeAccount: activeAccount, unclaimedInterest: unclaimedInterest});

		}
		catch (error) {
			console.error(error);
		}
	}

	getApproveModal = () => {
		if(this.props.approve){
			let modal = <SmallModal isOpen={true}><ApproveModal approveInfo={this.props.approve}/></SmallModal>
			return modal;
		}
	}

	approve = async(tokenAddress, tokenString, poolAddress) => {
		console.log("approve clicked");
		await this.props.updateApprove('');
		try{
			const activeAccount = this.props.activeAccount;

			await this.props.updateApprove({tokenString: tokenString, tokenAddress: tokenAddress, poolAddress: poolAddress, activeAccount: activeAccount});
		}
		catch (error) {
			console.error(error);
		}
	}

	isReceiver = (receiver) => {
		if(receiver === this.props.activeAccount){
			return true;
		}
		return false;
	}
	getShareModal = () => {
		if(this.props.share){
			let modal = <SmallModal isOpen={true}><ShareModal info={this.props.share}/></SmallModal>
			return modal;
		}
	}

	share = async(poolAddress, name) => {
		await this.props.updateShare('');
		this.props.updateShare({poolAddress: poolAddress, name: name});
	}

	getDeployTxModal = () => {
		if(this.props.deployTxResult){
			let modal = <Modal isOpen={true}><DeployTxModal txDetails={this.props.deployTxResult}/></Modal>;
			return modal;
		}
	}

	getHeaderValues = () => {
		return getHeaderValuesInUSD(this.state.tokenInfo, this.props.tokenMap);
	}
	refresh = async(poolAddress) =>{
		this.setState({loading: true});

		let newInfoAllTokens = await getDirectFromPoolInfoAllTokens(this.props.address, this.props.tokenMap, this.props.activeAccount);
		console.log("update all tokens", newInfoAllTokens);

		if(checkPoolInPoolInfo(poolAddress, this.props.userDepositPoolInfo)){
			const newDepositInfo = addNewPoolInfoAllTokens([...this.props.userDepositPoolInfo], newInfoAllTokens);
			await this.props.updateUserDepositPoolInfo(newDepositInfo);
			localStorage.setItem("userDepositPoolInfo", JSON.stringify(newDepositInfo));
		}

		if(checkPoolInPoolInfo(poolAddress, this.props.ownerPoolInfo)){
			const newOwnerInfo = addNewPoolInfoAllTokens([...this.props.ownerPoolInfo], newInfoAllTokens);
			await this.props.updateOwnerPoolInfo(newOwnerInfo);
			localStorage.setItem("ownerPoolInfo", JSON.stringify(newOwnerInfo));
		}

		if(checkPoolInPoolInfo(poolAddress, this.props.verifiedPoolInfo)){
			const newVerifiedInfo = addNewPoolInfoAllTokens([...this.props.verifiedPoolInfo], newInfoAllTokens);
			await this.props.updateVerifiedPoolInfo(newVerifiedInfo);
			localStorage.setItem("verifiedPoolInfo", JSON.stringify(newVerifiedInfo));
		}

		let tempInfo = this.props.acceptedTokenInfo;
		for(let i = 0; i < this.props.acceptedTokenInfo.length; i++){
			const tokenInfo = newInfoAllTokens.newTokenInfo && newInfoAllTokens.newTokenInfo[this.props.acceptedTokenInfo[i].address];
			tempInfo[i].unclaimedInterest = tokenInfo.unclaimedInterest;
			tempInfo[i].claimedInterest = tokenInfo.claimedInterest;
			tempInfo[i].userBalance = tokenInfo.userBalance;
			tempInfo[i].totalBalance = tokenInfo.totalBalance;
		}

		this.resetAnimation();
		this.setState({ tokenInfo: tempInfo, loading: false });
	}

	getRefreshButton = (poolAddress) => {
		if(!this.state.open) return;
		const logo = this.state.loading ? "refresh_pending" : "refresh";
		return(
			<div title="refresh pool balances" style={{marginRight:"-16px"}}>
				<Button isLogo={logo} callback={async() => await this.refresh(poolAddress)} />
			</div>

		);
	}
	getBalances = (userBalance, interestEarned, totalBalance) => {
		return(
			<Fragment>
				<p title="USD value of all harvested and unharvested donations (approx.)" className="mb0">{interestEarned === "" ? "" : "Donated "+ interestEarned}</p>
				<p title="USD value of your deposited tokens (approx.)" className="mb0">{userBalance === "" ? "" : "Balance " + userBalance}</p>
				<p title="USD value of all pool tokens (approx.)" className="mb0">{totalBalance === "" ? "" : "Pool "+ totalBalance}</p>
			</Fragment>
		);
	}
	getCardLeft = (randomPoolIcon, userBalance, interestEarned, totalBalance) => {
		const cardBalances = <div className="card__header__balances">
								{this.getBalances(userBalance, interestEarned, totalBalance)}
							 </div>;

		return (
			<div style={{display: "flex", flexDirection: "column"}}>
			<div style={{display: "flex"}}>
				<Icon name={randomPoolIcon.name} size={32} color={randomPoolIcon.color} strokeWidth={3}/>
				<div className="card__header--left">
					<div style={{display: "flex", flexDirection: "wrap", gap: "3px"}}>
						<h4 className="mb0">{this.props.title}</h4>
						<div style={{display: "flex", flexWrap: "nowrap"}}>
							{this.state.open ? this.getIsVerified(this.props.isVerified) : ""}
						</div>
					</div>
					{cardBalances}
				</div>
					</div>
					{this.state.open ?
						<div className="card__token__buttons">
							{this.createTokenButtons(this.props.acceptedTokenInfo)}
						</div> : ""
					}
			</div>
		);

	}
	render() {
		const { title, about, picHash, idx, address, receiver, acceptedTokenInfo, isVerified} = this.props;
		const poolIcons = [
			{ "name": "poolShape1", "color": palette("brand-red")},
			{ "name": "poolShape2", "color": palette("brand-yellow")},
			{ "name": "poolShape3", "color": palette("brand-blue")},
			{ "name": "poolShape4", "color": palette("brand-pink")},
			{ "name": "poolShape5", "color": palette("brand-green")},
		]

		const isReceiver = this.isReceiver(receiver);

		const randomPoolIcon = poolIcons[idx % poolIcons.length];

		const classnames = classNames({
			"card": true,
			"card--open": this.state.open,
		})

		//const {userBalance, interestEarned, totalBalance} = getHeaderValuesInUSD(acceptedTokenInfo, this.props.tokenMap);
		const {userBalance, interestEarned, totalBalance} = this.getHeaderValues();

		return (
			<div className={classnames}>
				<div className="card__header">

					{this.getCardLeft(randomPoolIcon, userBalance, interestEarned, totalBalance)}

					<div className="card__header--right">
						{this.getRefreshButton(address)}
						<div className="card__open-button" onClick={this.toggleCardOpen}><Icon name={"plus"} size={32}/></div>
					</div>
				</div>
				<div className="card__body">
					{this.createPoolInfo(isReceiver)}
					{this.createTokenInfo()}
				</div>
				<div className="card__bar"/>
				{this.getDepositAmountModal()}
				{this.getWithdrawAmountModal()}
				{this.getClaimModal()}
				{this.getApproveModal()}
				{this.getShareModal()}
				{this.getUpdateAboutModal()}
      		</div>
		);
	}
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolAddrs: state.ownerPoolAddrs,
	ownerPoolInfo: state.ownerPoolInfo,
	userDepositPoolAddrs: state.userDepositPoolAddrs,
	userDepositPoolInfo: state.userDepositPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	depositAmount: state.depositAmount,
	withdrawAmount: state.withdrawAmount,
	claim: state.claim,
	approve: state.approve,
	share: state.share,
	networkId: state.networkId,
	newAbout: state.newAbout,
	isMobile: state.isMobile,
})

const mapDispatchToProps = dispatch => ({
	updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateDepositAmount: (amnt) => dispatch(updateDepositAmount(amnt)),
	updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
	updateTokenMap: (tokenMap) => dispatch(updateTokenMap(tokenMap)),
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateClaim: (txInfo) => dispatch(updateClaim(txInfo)),
	updateApprove: (txInfo) => dispatch(updateApprove(txInfo)),
	updateShare: (share) => dispatch(updateShare(share)),
	updateNewAbout: (about) => dispatch(updateNewAbout(about)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Card)
