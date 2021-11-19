const verifiedPoolInfoReducer = (state = 'No Verified Pools', action) => {
	console.log("verifiedPoolInfoReducer called", action.type)
	switch (action.type) {
		case 'UPDATE_VERIFIED_POOL_INFO':
			return action.value
		default:
			return state
	}
}

export default verifiedPoolInfoReducer