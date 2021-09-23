import React, {Component} from "react"
import { Fragment } from "react";

import Card from '../components/Card'

class Dashboard extends Component {
	componentDidMount() {
		window.scrollTo(0,0);
	}

	render() {
		return (
			<Fragment>
				<article>
					<section className="page-section page-section--center horizontal-padding bw0">
						<Card title="Charity 1"/>
						<Card title="Charity 2"/>
						<Card title="Charity 3"/>
						<Card title="Charity 4"/>
						<Card title="Charity 5"/>
						<Card title="Charity 6"/>
					</section>
				</article>
			</Fragment>
		);
	}
}

export default Dashboard
