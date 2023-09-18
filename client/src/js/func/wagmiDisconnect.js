import React from 'react';
import { useDisconnect } from 'wagmi'
import { Button } from "../components/Button";
import { connect } from "react-redux"
import { updateActiveAccount } from "../actions/activeAccount"

function Disconnect({ updateActiveAccount }) {
    const { disconnect } = useDisconnect()

    const handleDisconnect = async() => {
        localStorage.setItem("ownerPoolInfo", "");
        localStorage.setItem("userDepositPoolInfo", "");
        sessionStorage.clear();
        await disconnect();
        //await updateActiveAccount("Connect");
        console.log("disconnect hit")
        window.location.reload(false);
    }
    return (
        <Button isLogo="close" callback={handleDisconnect}/>
    )
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
})

const mapDispatchToProps = dispatch => ({
  updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Disconnect)