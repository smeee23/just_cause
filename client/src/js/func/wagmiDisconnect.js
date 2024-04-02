import React from 'react';
import { useDisconnect } from 'wagmi'
import { Button } from "../components/Button";
import { connect } from "react-redux"
import { updateActiveAccount } from "../actions/activeAccount"

function Disconnect({ updateActiveAccount, logo }) {
    const { disconnect } = useDisconnect({
        onSettled(data, error) {
          console.log('Disconnect Settled', { data, error })
          window.location.reload(false);
        },
      });

    const handleDisconnect = async() => {
        sessionStorage.setItem("ownerPoolInfo", "");
        sessionStorage.setItem("userDepositPoolInfo", "");
        sessionStorage.setItem("pendingTxList", "");
        sessionStorage.setItem("connectionType", "");
        sessionStorage.setItem("activeAccount", "");
        await disconnect();
    }
    return (
        <Button isLogo={logo} callback={handleDisconnect}/>
    )
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
})

const mapDispatchToProps = dispatch => ({
  updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Disconnect)