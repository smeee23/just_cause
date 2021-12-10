const activeAccountReducer = (state = null, action) => {
	//console.log("active account reducer called", action.type)
	switch (action.type) {
		case 'UPDATE_ACTIVE_ACCOUNT':
			return action.value
		default:
			return state
	}
}

export default activeAccountReducer