import React, {Component} from "react";
import { Fragment } from "react";

import Button from '../components/Button';
import Card from '../components/Card';
import getWeb3 from "../../getWeb3";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import Shapes from '../components/Shapes';

class YourCause extends Component {
    state = {
		daiAddress: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
		poolTracker: [],
		poolInfo: [],
	};
	componentDidMount = async () => {
        try{
			window.scrollTo(0,0);
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

			this.poolTrackerAddress = PoolTracker.networks[this.networkId].address;
			console.log("Pool Tracker Address:", this.poolTrackerAddress);
            this.setOwnedPools();
		}
        catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
	}

    setOwnedPools = async() => {
		const activeAccount = this.web3.currentProvider.selectedAddress;
		let poolTracker = await this.PoolTrackerInstance.methods.getUserOwned(activeAccount).call();

		let poolInfo = [];
		for(let i=0; i < poolTracker.length; i++){
			let JCPoolInstance = new this.web3.eth.Contract(
				JCPool.abi,
				poolTracker[i],
			);

			let acceptedTokens = await JCPoolInstance.methods.getAcceptedTokens().call();
			let name = await JCPoolInstance.methods.getName().call();
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
							name: name,
							address: poolTracker[i],
							acceptedTokens: acceptedTokens,
							totalDeposits: totalDeposits,
							activeUserBalance: activeUserBalance,
						});
		}
		console.log("pool info", poolInfo);
		console.log("pool tracker", poolTracker);
		this.setState({poolTracker: poolTracker, poolInfo: poolInfo});
	}

	deploy = async() => {
		const activeAccount = this.web3.currentProvider.selectedAddress;
		const poolName = prompt("Enter pool name:");
		//const receiver = prompt("Enter the address to recieve the interest");
		const payload = {data: JCPool.bytecode,
						arguments: [
							[this.state.daiAddress],
							poolName,
							this.poolTrackerAddress,
							'0xEf0Edb12952a6Bb6c83b7C29defec62e9292bE46'
							]
						};
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

		this.setOwnedPools();
	}

	render() {

        const listItems = this.state.poolInfo.map((pt) =>
								<Card
									key={pt.address}
									title={pt.name}
									address={pt.address}
									userBalance={pt.activeUserBalance}
									onApprove = {this.approve}
									onDeposit = {this.deposit}
									onWithdrawDeposit = {this.withdrawDeposit}
									onClaim = {this.claim}
								/>
							);
        return (
            <Fragment>
				<Shapes/>
                <article>
                    <section className="page-section page-section--center horizontal-padding bw0">
                        <Button text="Deploy" icon="wallet" callback={this.deploy}/>
                    </section>
                    <section>
                        {listItems}
                    </section>
                </article>
            </Fragment>
        );
}
}

export default YourCause