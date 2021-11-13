import React, { Component } from "react";
import { Fragment } from "react";

import Button from '../components/Button';
import Card from '../components/Card';
import getWeb3 from "../../getWeb3";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";

class Contributions extends Component {
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

			this.setDepositedPools();
		}
        catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
	}

    setDepositedPools = async() => {
		const activeAccount = this.web3.currentProvider.selectedAddress;
		let poolTracker = await this.PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();

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
		console.log("pool info", typeof poolInfo);
		console.log("pool tracker", poolTracker);
		this.setState({poolTracker: poolTracker, poolInfo: poolInfo});
	}

	callbackExample = () => {
		console.log('clicked');
	}

	render() {

        const listItems = this.state.poolInfo.map((pt) =>
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
							);
        return (
            <Fragment>
                <article>
                    <section className="page-section page-section--center horizontal-padding bw0">
                        {listItems}
                    </section>
                </article>
            </Fragment>
        );
}
}

export default Contributions