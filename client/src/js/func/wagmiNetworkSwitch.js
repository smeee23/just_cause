import React, { useEffect, useRef} from 'react';
import { useAccount, useSwitchNetwork} from 'wagmi'
import { Button } from '../components/Button';
import { connect } from "react-redux"
import { updateNetworkId } from "../actions/networkId"
import { updateConnect } from "../actions/connect"

function SwitchNetwork({ updateNetworkId, updateConnect, newNetworkId, networkId}) {
    const { address, connector, isConnected } = useAccount()
    const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork({
        onSettled(data, error) {
          console.log('SwitchNetwork Settled', { data, error })
          sessionStorage.setItem("ownerPoolInfo", "");
          sessionStorage.setItem("userDepositPoolInfo", "");
          sessionStorage.setItem("verifiedPoolInfo", "");
          sessionStorage.setItem("pendingTxList", "");
          updateNetworkId(newNetworkId);
          sessionStorage.setItem('networkId', newNetworkId);
          //window.location.reload(false);
        },
      })
    //const buttonClickedRef = useRef(false);

    /*useEffect(() => {
        if (!buttonClickedRef.current) return;
        if (!address || !connector) {
            return; // Exit early if address or connector is not available yet
        }

        if(newNetworkId !== networkId){
            updateNetworkId(newNetworkId);
            console.log("clicked")

            sessionStorage.setItem('newNetworkId', newNetworkId);
            console.log("switch network", newNetworkId);
        }
        buttonClickedRef.current = false;
    }, [address, connector, newNetworkId, networkId, updateNetworkId, updateConnect]);*/

    if (!isConnected) {
      return "";
    }

    const getLogo = () => {
        if(newNetworkId === 10){
            return "op"
        }
        if(newNetworkId === 42161){
            return "arb"
        }
    }

    const getTitle = () => {
        if(newNetworkId === 10){
            return "switch to Optimism"
        }
        if(newNetworkId === 42161){
            return "switch to Arbitrum"
        }
    }

    return (
        <div title={getTitle()}>
            <Button
            isLogo={getLogo()}
            logoSize={17}
            disabled={isLoading}
            callback={() => {
                console.log("switch 1")
                //buttonClickedRef.current = true;
                switchNetwork?.(newNetworkId)
            }}
            />
        </div>
    )
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
    networkId: state.networkId,
})

const mapDispatchToProps = dispatch => ({
  updateNetworkId: (id) => dispatch(updateNetworkId(id)),
  updateConnect: (s) => dispatch(updateConnect(s)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SwitchNetwork)