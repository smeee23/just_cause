const ownerPoolAddrsReducer = (state = 'No Verified Pools', action) => {
	//console.log("verifiedPoolAddrsReducer called", action.type)
	switch (action.type) {
		case 'UPDATE_OWNER_POOL_ADDRS':
			return action.value
		default:
			return state
	}
}

export default ownerPoolAddrsReducer