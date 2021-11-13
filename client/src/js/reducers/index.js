import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import mobileReducer from './mobile'
import daiAddressReducer from './daiAddress'

const rootReducer = (history) => combineReducers({
	isMobile: mobileReducer,
	daiAddress: daiAddressReducer,
	router: connectRouter(history)
})

export default rootReducer
