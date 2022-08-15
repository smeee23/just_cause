import React from 'react'
import { Route, Switch } from 'react-router'

import Homepage from './Homepage'
import Dashboard from './Dashboard'
import Search from './Search'
import HowItWorks from './HowItWorks'

import Header from '../components/Header'

const routes = (
	<main>
		<Switch>
			<Route path={"/"} component={Homepage}/>
			<Route path={"/howitworks"} component={HowItWorks}/>
			<Route path={"/dashboard"} component={Dashboard}/>
			<Route path={"/search"} component={Search}/>
			<Route exact path={"/search:address"} component={Search}/>
		</Switch>
		<Header/>
	</main>
)


export default routes
