const alertReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_ALERT':
			return action.value
		default:
			return state
	}
}

export default alertReducer