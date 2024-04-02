import React, { useEffect, useState } from 'react';
import { useAccount, useConnect} from 'wagmi'
import { ButtonSmall } from '../components/Button';
import { connect } from "react-redux"
import { updateActiveAccount } from "../actions/activeAccount"
import { updateConnect } from "../actions/connect"
import { optimism } from 'wagmi/chains'

function Profile({ updateActiveAccount, updateConnect }) {
    const { address, connector, isConnected } = useAccount()
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect({
      onSettled(data, error) {
        console.log('Connect Settled', { data, error });
        console.log(data.account, data.connector.name);
        updateActiveAccount(data.account);
        updateConnect(data.connector.name);
        sessionStorage.setItem('activeAccount', JSON.stringify(data.account));
        sessionStorage.setItem('connectionType', JSON.stringify(data.connector.name));
      },

    })
    const [isMounted, setIsMounted] = useState(true);

    useEffect(() => {
      let isMounted = true;
      if (!address || !connector) {
        console.log("useEffect return undefied")
        return; // Exit early if address or connector is not available yet
      }

      if(isMounted){
        updateActiveAccount(address);
        console.log("connector", connector);
        updateConnect(connector.name);

        sessionStorage.setItem('activeAccount', JSON.stringify(address));
        sessionStorage.setItem('connectionType', JSON.stringify(connector.name));

      }
      return () => {
        isMounted = false;
      }
    }, [address, connector, updateActiveAccount, updateConnect]);

    if (isConnected && connector) {
      return (
        <div>
          <div>{ address }</div>
          <div>Connected to {connector.name}</div>
        </div>
      )
    }

    return (
      <div style={{
          display: 'flex',           // Turn on flexbox
          justifyContent: 'center',  // Center horizontally
          alignItems: 'center',      // Center vertically
          gap: '8px',                // Space between items
          flexDirection: 'column'       // Horizontal layout. This is default and can be omitted.
      }}>
          {connectors.map((connector) => (
              <ButtonSmall
                  disabled={!connector.ready}
                  key={connector.id}
                  callback={() => connect({ connector })}
                  text={
                    connector.name +
                    (!connector.ready ? ' (unsupported)' : '') +
                    (isLoading && connector.id === pendingConnector?.id ? ' (connecting)' : '')
                  }
                  icon={connector.name}
              />
          ))}
          {error && <div>{error.message}</div>}
        </div>
    )
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
  connect: state.connect,
})

const mapDispatchToProps = dispatch => ({
  updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
  updateConnect: (s) => dispatch(updateConnect(s)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)