import { EthereumProvider } from "@walletconnect/ethereum-provider";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Web3 from "web3";

const accountsChanged = (accounts) => {
  console.log("accounts changed", accounts);
  sessionStorage.setItem("ownerPoolInfo", "");
  sessionStorage.setItem("userDepositPoolInfo", "");
  sessionStorage.setItem("pendingTxList", "");
  sessionStorage.setItem("connectionType", "");
  sessionStorage.setItem("activeAccount", "");
  window.location.reload(false);
}

const chainChanged = (chainId) => {
  console.log("chainid changed", chainId);
  sessionStorage.setItem("ownerPoolInfo", "");
  sessionStorage.setItem("userDepositPoolInfo", "");
  sessionStorage.setItem("verifiedPoolInfo", "");
  sessionStorage.setItem("pendingTxList", "");
  //sessionStorage.setItem("connectionType", "");
  //sessionStorage.setItem("activeAccount", "");
}

const chainChangedNoReload = (chainId) => {
  console.log("chainid changed", chainId);
  sessionStorage.setItem("ownerPoolInfo", "");
  sessionStorage.setItem("userDepositPoolInfo", "");
  sessionStorage.setItem("verifiedPoolInfo", "");
  sessionStorage.setItem("pendingTxList", "");
}

const connectEvent = (info) => {
  console.log("connect", info);
  sessionStorage.setItem("ownerPoolInfo", "");
  sessionStorage.setItem("userDepositPoolInfo", "");
  sessionStorage.setItem("pendingTxList", "");
}

const disconnect = (error) => {
  console.log("disconnect", error);
  sessionStorage.setItem("ownerPoolInfo", "");
  sessionStorage.setItem("userDepositPoolInfo", "");
  sessionStorage.setItem("pendingTxList", "");
  sessionStorage.setItem("connectionType", "");
  sessionStorage.setItem("activeAccount", "");
  window.location.reload(false);
}

const connectWallet = async(connectionType) => {
  let web3;
  const infuraRpc = "https://optimism-mainnet.infura.io/v3/"+process.env.REACT_APP_INFURA_KEY;
  const projectId = process.env.REACT_APP_WALLET_CONNECT_ID

  let unsubscribers = [];

  if(connectionType === "MetaMask") {
    if (typeof window.ethereum !== 'undefined') {
      const provider = window.ethereum;
      web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        //await window.ethereum.enable();
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Acccounts now exposed
      } catch (error) {
        console.log("error");
      }

      const accountsChangedSub = provider.on("accountsChanged", async(accounts) => {
        accountsChanged(accounts);
      });
      unsubscribers.push(accountsChangedSub.unsubscribe);

      // Subscribe to chainId change
      const chainChangedSub = provider.on("chainChanged", (chainId) => {
        chainChanged(chainId);
      });
      unsubscribers.push(chainChangedSub.unsubscribe);

      // Subscribe to provider connection
      const connectSub = provider.on("connect", (info) => {
        connectEvent(info);
      });
      unsubscribers.push(connectSub.unsubscribe);

      // Subscribe to provider disconnection
      const disconnectSub = provider.on("disconnect", async(error) => {
        disconnect(error)
      });
      unsubscribers.push(disconnectSub.unsubscribe);

      unsubscribers = [...unsubscribers];

    } else {
      console.error("MetaMask not detected");
    }
  }
  else if(connectionType === "Coinbase Wallet"){
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: "JustCause"
    })
    const provider = coinbaseWallet.makeWeb3Provider(infuraRpc, 10)
    console.log("provider", provider);
    web3 = new Web3(provider);

     // Subscribe to provider connection
    /*const connectSub = provider.on("connect", (info) => {
      connectEvent(info);
    });
    unsubscribers.push(connectSub.unsubscribe);

    const chainChangedSub = provider.on("chainChanged", (chainId) => {
      chainChangedNoReload(chainId);
    });
    unsubscribers.push(chainChangedSub.unsubscribe);

    // Subscribe to provider disconnection
    const disconnectSub = provider.on("disconnect", async(error) => {
      coinbaseWallet.disconnect();
      disconnect(error);
    });
    unsubscribers.push(disconnectSub.unsubscribe);*/

    unsubscribers = [...unsubscribers];
  }
  else if(connectionType === "WalletConnect"){
    const provider = await EthereumProvider.init({
      projectId: projectId, // required
      chains: [42161, 10], // required
      //optionalChains: [42161],
      events: ["chainChanged", "accountsChanged", "message", "disconnect", "connect"],
      rpcMap: {
        10: infuraRpc,
        42161: infuraRpc,
      }
    })

    const accountsChangedSub = provider.on("accountsChanged", async(accounts) => {
      accountsChanged(accounts);
    });
    unsubscribers.push(accountsChangedSub.unsubscribe);

    // Subscribe to chainId change
    const chainChangedSub = provider.on("chainChanged", (chainId) => {
      console.log("chain changed clicked")
      chainChanged(chainId);
    });
    unsubscribers.push(chainChangedSub.unsubscribe);

    // Subscribe to provider connection
    const connectSub = provider.on("connect", (info) => {
      connectEvent(info);
    });
    unsubscribers.push(connectSub.unsubscribe);

    // Subscribe to provider disconnection
    const disconnectSub = provider.on("disconnect", async(error) => {
      disconnect(error)
    });
    unsubscribers.push(disconnectSub.unsubscribe);

    unsubscribers = [...unsubscribers];

    await provider.enable();

    // Subscribe to provider connection

    web3 = new Web3(provider);
  }
  return {
    web3,
    unsubscribeAll: () => {
      unsubscribers.forEach(unsub => unsub());
    }
  };
}

export default connectWallet