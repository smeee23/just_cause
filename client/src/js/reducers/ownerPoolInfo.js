const ownerPoolInfoReducer = (state = 'No Verified Pools', action) => {
	console.log("verifiedPoolInfoReducer called", action.type)
	switch (action.type) {
		case 'UPDATE_OWNER_POOL_INFO':
			return action.value
		default:
			return state
	}
}

export default ownerPoolInfoReducer