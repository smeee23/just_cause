const poolTrackerAddressReducer = (state = null, action) => {
	//console.log("verifiedPoolAddrsReducer called", action.type)
	switch (action.type) {
		case 'UPDATE_POOL_TRACKER_ADDRESS':
			return action.value
		default:
			return state
	}
}

export default poolTrackerAddressReducer