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
import userDepositPoolAddrsReducer from './userDepositPoolAddrs'
import userDepositPoolInfoReducer from './userDepositPoolInfo'
import poolTrackerAddressReducer from './poolTrackerAddress'
import pendingTxReducer from './pendingTx'
import txResultReducer from './txResult'
import deployTxResultReducer from './deployTxResult'
import deployInfoReducer from './deployInfo'
import depositAmountReducer from './depositAmount'
import withdrawAmountReducer from './withdrawAmount'
import searchInfoReducer from './searchInfo'

const rootReducer = (history) => combineReducers({
	isMobile: mobileReducer,
	daiAddress: daiAddressReducer,
	activeAccount: activeAccountReducer,
	tokenMap: tokenMapReducer,
	verifiedPoolAddrs: verifiedPoolAddrsReducer,
	verifiedPoolInfo: verifiedPoolInfoReducer,
	ownerPoolAddrs: ownerPoolAddrsReducer,
	ownerPoolInfo: ownerPoolInfoReducer,
	userDepositPoolAddrs: userDepositPoolAddrsReducer,
	userDepositPoolInfo: userDepositPoolInfoReducer,
	poolTrackerAddress: poolTrackerAddressReducer,
	pendingTx: pendingTxReducer,
	txResult: txResultReducer,
	deployTxResult: deployTxResultReducer,
	deployInfo: deployInfoReducer,
	depositAmount: depositAmountReducer,
	withdrawAmount: withdrawAmountReducer,
	searchInfo: searchInfoReducer,
	router: connectRouter(history),
})

export default rootReducer
