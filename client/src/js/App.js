import React, { Component } from "react"
import { connect } from "react-redux";
import { ConnectedRouter } from 'connected-react-router'
import { Route, Switch } from 'react-router'

//import routes from './routes'
import { detectMobile } from "./actions/mobile"

import getWeb3 from "../getWeb3";
import JCPool from "../contracts/JustCausePool.json";
import PoolTracker from "../contracts/PoolTracker.json";
import ERC20Instance from "../contracts/IERC20.json";

import Homepage from './routes/Homepage'
import Dashboard from './routes/Dashboard'
import Header from './components/Header'
//import Button from './components/Button';
//import Card from './components/Card';
//import { load } from "dotenv";

class App extends Component {

	state = {
		daiAddress: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
		poolTracker: [],
		poolInfo: [],
	  };
  	componentDidMount = async() => {
		try{
			window.addEventListener('resize', this.props.detectMobile);
			// Get network provider and web3 instance.
			this.web3 = await getWeb3();

			// Use web3 to get the user's accounts.
			this.accounts = await this.web3.eth.getAccounts();
			console.log(this.accounts);

			this.networkId = await this.web3.eth.net.getId();

			console.log(this.networkId);

			this.PoolTrackerInstance = new this.web3.eth.Contract(
				PoolTracker.abi,
				PoolTracker.networks[this.networkId] && PoolTracker.networks[this.networkId].address,
			);

			this.setPoolTracker();
			this.poolTrackerAddress = PoolTracker.networks[this.networkId].address;
			console.log("Pool Tracker Address:", this.poolTrackerAddress);

			/*const loadedContractName = localStorage.getItem('contractName')
			if(loadedContractName){
				this.setState({contractName: loadedContractName});
			}*/

		}
		catch (error) {
		// Catch any errors for any of the above operations.
		alert(
			`Failed to load web3, accounts, or contract. Check console for details.`,
		);
		console.error(error);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.props.detectMobile);
	}

	deploy = async() => {
		const activeAccount = this.web3.currentProvider.selectedAddress;
		const payload = {data: JCPool.bytecode,
						arguments: [
							[this.state.daiAddress],
							"test pool",
							this.poolTrackerAddress
						]};
		const parameter = {
			from: activeAccount,
			gas: this.web3.utils.toHex(3000000),
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('30', 'gwei'))
			};

		console.log(payload.arguments)
		let JCPoolInstance = await new this.web3.eth.Contract(JCPool.abi).deploy(payload).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			});
			/*.on('confirmation', () => {}).then((newContractInstance) => {
			console.log('Deployed Contract Address : ', newContractInstance.options.address);
			this.setState({contractAddress: newContractInstance.options.address});
			});*/

		/*let result = await this.PoolTrackerInstance.methods.addVerifiedPools(JCPoolInstance.options.address, activeAccount, "test pool").send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});*/
		console.log("deployed", JCPoolInstance.options.address);
		//console.log("events", JCPoolInstance);
		this.setPoolTracker();
	}

	setPoolTracker = async() => {
		const activeAccount = this.web3.currentProvider.selectedAddress;
		let poolTracker = await this.PoolTrackerInstance.methods.getVerifiedPools().call();

		let poolInfo = [];
		for(let i=0; i < poolTracker.length; i++){
			let JCPoolInstance = new this.web3.eth.Contract(
				JCPool.abi,
				poolTracker[i],
			);

			let acceptedTokens = await JCPoolInstance.methods.getAcceptedTokens().call();
			console.log("pool address:", JCPoolInstance.options.address)
			console.log("accepted tokens:", acceptedTokens);
			let totalDeposits = [];
			let activeUserBalance = [];
			for(let j = 0; j < acceptedTokens.length; j++){
				totalDeposits.push(await JCPoolInstance.methods.getTotalDeposits(acceptedTokens[j]).call());
				activeUserBalance.push(await JCPoolInstance.methods.getUserBalance(activeAccount, acceptedTokens[j]).call());
				console.log("total deposits for", acceptedTokens[j], " :", totalDeposits);
				console.log(activeAccount, "balance:", activeUserBalance);
			}

			poolInfo.push({
							address: poolTracker[i],
							acceptedTokens: acceptedTokens,
							totalDeposits: totalDeposits,
							activeUserBalance: activeUserBalance,
							});
		}
		console.log("pool info", poolInfo);
		console.log("pool tracker", poolTracker);
		this.setState({poolTracker: poolTracker, poolInfo: poolInfo});
		this.stringifyPoolTracker();
	}
	approve = async(erc20Instance, address, activeAccount) => {
		console.log('approve clicked');
		const parameter = {
			from: activeAccount ,
			gas: this.web3.utils.toHex(3000000),
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('30', 'gwei'))
			};

		let results_1 = await erc20Instance.methods.approve(address, this.web3.utils.toWei('300000000000', 'gwei')).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			});
		console.log("approve", results_1);
	}

	getAllowance = async(erc20Instance, address, activeAccount) => {
		const allowance = await erc20Instance.methods.allowance(activeAccount, address).call();
		console.log("allowance", allowance, typeof allowance);
		return allowance;
	}

	deposit = async(address) => {
		console.log('deposit clicked');
		const amount = prompt("enter amount to deposit")
		const amountInGwei = this.web3.utils.toWei(amount, 'ether');
		const erc20Instance = await new this.web3.eth.Contract(ERC20Instance.abi,this.state.daiAddress);
		const activeAccount = this.web3.currentProvider.selectedAddress;
		console.log("amountInGwei", amountInGwei, typeof amountInGwei);

		if(parseInt(amountInGwei) >> parseInt(this.getAllowance(erc20Instance, address, activeAccount))){
			console.log("must approve token to deposit");
			this.approve(erc20Instance, address, activeAccount);
		}
		else{
			console.log("else");
		}
		/*const parameter = {
			from: activeAccount,
			gas: this.web3.utils.toHex(3000000),
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('30', 'gwei'))
		};

		let JCPoolInstance = new this.web3.eth.Contract(
			JCPool.abi,
			address,
		);

		console.log(JCPoolInstance.options.address);
		let result = await JCPoolInstance.methods.deposit(this.state.daiAddress, amountInGwei).send(parameter, (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('deposit result ' + result);*/
	}

	withdrawDeposit = async(address) => {
		console.log('withdraw deposit clicked');
		const amount = prompt("enter amount to withdraw");
		const activeAccount = this.web3.currentProvider.selectedAddress;

		const parameter = {
			from: activeAccount,
			gas: this.web3.utils.toHex(1100000),
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('3', 'gwei'))
		};

		let JCPoolInstance = new this.web3.eth.Contract(
			JCPool.abi,
			address,
		);

		console.log(JCPoolInstance.options.address, address);
		let result = await JCPoolInstance.methods.withdraw(this.state.daiAddress, this.web3.utils.toWei(amount, 'ether')).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
		});
		console.log('withdraw result ' + result[0]);
	}

	claim = (address) => {
		console.log('claim interest clicked', address);
	}

	stringifyPoolTracker = () => {
		let poolTrackerString = ""
		for(let i = 0; i < this.state.poolTracker.length; i++){
			poolTrackerString = poolTrackerString + '\n' + this.state.poolTracker[i];
		}
		console.log("pool tracker string", poolTrackerString);
		this.setState({poolTrackerString: poolTrackerString});
	}



    render() {
		const { history } = this.props;
		/*const listItems = this.state.poolInfo.map((pt) =>
							<Card
								key={pt.address}
								title="test charity"
								address={pt.address}
								userBalance={pt.activeUserBalance}
								onApprove = {this.approve}
								onDeposit = {this.deposit}
								onWithdrawDeposit = {this.withdrawDeposit}
								onClaim = {this.claim}
							/>
						  );*/
		const dashboardComponent = <Dashboard
										poolInfo = {this.state.poolInfo}
										onApprove = {this.approve}
										onDeposit = {this.deposit}
										onWithdrawDeposit = {this.withdrawDeposit}
										onClaim = {this.claim}/>
		const routes = (
			<main>
				<Switch>
					<Route exact path={"/"} component={Homepage}/>
					<Route exact
						path={"/dashboard"}
						component={Dashboard}
						element={<Dashboard
							poolInfo = {this.state.poolInfo}
							onApprove = {this.approve}
							onDeposit = {this.deposit}
							onWithdrawDeposit = {this.withdrawDeposit}
							onClaim = {this.claim}/>
						}
					/>
				</Switch>
				<Header/>
			</main>
		)
		/*return(
			<React.Fragment>
			<Button text="Deploy" icon="wallet" callback={this.deploy}/>
			{listItems}
			</React.Fragment>
		)*/
		return (
    	<ConnectedRouter history={history}>
        	{ routes }
      	</ConnectedRouter>

		)
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
})

const mapDispatchToProps = dispatch => ({
	detectMobile: () => dispatch(detectMobile()),
})

export default connect(mapStateToProps, mapDispatchToProps)(App)