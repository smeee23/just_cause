const daiAddressReducer = (state = 'Default Address', action) => {
	//console.log("reducer called")
	switch (action.type) {
		case 'UPDATE_DAI_ADDRESS':
			return action.value
		default:
			return state
	}
}

export default daiAddressReducer