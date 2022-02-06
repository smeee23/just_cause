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
			<Route exact path={"/"} component={Homepage}/>
			<Route exact path={"/dashboard"} component={Dashboard}/>
			<Route exact path={"/yourcause"} component={YourCause}/>
			<Route exact path={"/contributions"} component={Contributions}/>
			<Route exact path={"/search"} component={Search}/>
		</Switch>
		<Header/>
		<Modal>
			<NewPoolModal/>
		</Modal>
	</main>
)


export default routes
