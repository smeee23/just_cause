import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import Button from '../components/Button'

import {searchPools} from '../func/contractInteractions';

class Search extends Component {

	constructor(props) {
		super(props);

		this.state = {
			searchResults: [],
		}
	}

	componentDidMount = async () => {
		window.scrollTo(0,0);
	}

	componentDidUpdate = () => {
		console.log('component did update');
	}

	setSearchResults = async() => {
		let results = await searchPools(this.props.poolTrackerAddress, this.props.activeAccount, this.props.tokenMap);
		console.log('results', results);
		this.setState({
			searchResults: this.createCardInfo(results)
		});
	}

	createCardInfo = (poolInfo) => {
		if(poolInfo === "No Verified Pools") return
		let cardHolder = [];
		for(let i = 0; i < poolInfo.length; i++){
			console.log('a', (poolInfo[i].name));
			const item = poolInfo[i];
			cardHolder.push(
				<Card
					key={item.address}
					title={item.name}
					idx={i}
					receiver={item.receiver}
					address={item.address}
					acceptedTokenInfo={item.acceptedTokenInfo}
					about={item.about}
				/>
			);
		}
		return cardHolder;
	}

	render() {
		return (
			<Fragment>
				<article>
				<section className="page-section page-section--center horizontal-padding bw0">
					<Button icon="plus" text="Search" lg callback={async() => await this.setSearchResults(this.props.poolTrackerAddress, this.props.activeAccount, this.props.tokenMap)}/>
				</section>
					<section className="page-section page-section--center horizontal-padding bw0">
						{this.state.searchResults}
					</section>
				</article>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ({
	daiAddress: state.daiAddress,
	activeAccount: state.activeAccount,
	tokenMap: state.tokenMap,
	ownerPoolAddrs: state.ownerPoolAddrs,
	ownerPoolInfo: state.ownerPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(Search)