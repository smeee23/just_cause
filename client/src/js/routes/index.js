import React from 'react'
import { Route, Switch } from 'react-router'

import Homepage from './Homepage'
import Dashboard from './Dashboard'
import YourCause from './YourCause'
import Contributions from './Contributions'
import Search from './Search'

import Header from '../components/Header'
import { Modal } from '../components/Modal'
import NewPoolModal from '../components/modals/NewPoolModal'

const routes = (
	<main>
		<Switch>
			<Route exact path={"./"} component={Homepage}/>
			<Route exact path={"./dashboard"} component={Dashboard}/>
			<Route exact path={"./search"} component={Search}/>
			<Route exact path={"./search:address"} component={Search}/>
		</Switch>
		<Header/>
	</main>
)


export default routes
