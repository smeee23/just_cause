import React from 'react'
import { Route, Switch } from 'react-router'

import Homepage from './Homepage'
import Dashboard from './Dashboard'
import YourCause from './YourCause'
import Contributions from './Contributions'

import Header from '../components/Header'

const routes = (
	<main>
		<Switch>
			<Route exact path={"/"} component={Homepage}/>
			<Route exact path={"/dashboard"} component={Dashboard}/>
			<Route exact path={"/yourcause"} component={YourCause}/>
			<Route exact path={"/contributions"} component={Contributions}/>
		</Switch>
		<Header/>
	</main>
)


export default routes
