const daiAddressReducer = (state = 'Default Address', action) => {
	switch (action.type) {
		case 'UPDATE_DAI_ADDRESS':
			return action.value
		default:
			return state
	}
}

export default daiAddressReducer