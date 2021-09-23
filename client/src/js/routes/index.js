import React from 'react'
import { Route, Switch } from 'react-router'

import Homepage from './Homepage'
import Dashboard from './Dashboard'

import Header from '../components/Header'

const routes = (
	<main>
		<Switch>
			<Route exact path={"/"} component={Homepage}/>
			<Route exact path={"/dashboard"} component={Dashboard}/>
		</Switch>
		<Header/>
	</main>
)


export default routes
