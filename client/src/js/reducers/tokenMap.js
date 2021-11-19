const tokenMapReducer = (state = 'No Map Available', action) => {
	//console.log("active account reducer called", action.type)
	switch (action.type) {
		case 'UPDATE_TOKEN_MAP':
			return action.value
		default:
			return state
	}
}

export default tokenMapReducer