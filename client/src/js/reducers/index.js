import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import mobileReducer from './mobile'

const rootReducer = (history) => combineReducers({
	isMobile: mobileReducer,
	router: connectRouter(history)
})

export default rootReducer
