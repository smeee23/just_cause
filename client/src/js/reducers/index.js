import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import mobileReducer from './mobile'
import daiAddressReducer from './daiAddress'
import activeAccountReducer from './activeAccount'
import tokenMapReducer from './tokenMap'
import verifiedPoolAddrsReducer from './verifiedPoolAddrs'
import verifiedPoolInfoReducer from './verifiedPoolInfo'
import ownerPoolAddrsReducer from './ownerPoolAddrs'
import ownerPoolInfoReducer from './ownerPoolInfo'

const rootReducer = (history) => combineReducers({
	isMobile: mobileReducer,
	daiAddress: daiAddressReducer,
	activeAccount: activeAccountReducer,
	tokenMap: tokenMapReducer,
	verifiedPoolAddrs: verifiedPoolAddrsReducer,
	verifiedPoolInfo: verifiedPoolInfoReducer,
	ownerPoolAddrs: ownerPoolAddrsReducer,
	ownerPoolInfo: ownerPoolInfoReducer,
	router: connectRouter(history),
})

export default rootReducer
