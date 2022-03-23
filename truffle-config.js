const path = require("path");
require("dotenv").config({path: ".env"});
const HDWalletProvider = require("@truffle/hdwallet-provider");
const AccountIndex = 0;
const key = process.env.MNEMONIC;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545,
      host:"127.0.0.1",
      network_id: "*"
    },
    ganache_local: {
      provider: () => {
        let provider = new HDWalletProvider({mnemonic: key,
                              providerOrUrl:"http://127.0.0.1:8545",
                              addressIndex: AccountIndex,
                              chainId: "*"
                            });
                            return provider;
      },
      network_id: "*"
    },
    goerli_infura: {
      provider: () => {
        let provider = new HDWalletProvider({mnemonic: key,
                              providerOrUrl:"https://goerli.infura.io/v3/3381ca9f51e140798058a9be57fc78ad",
                              addressIndex: AccountIndex,
                              chainId : 5
                            });
                            return provider;
      },
      network_id: "5"
    },
    kovan_infura: {
      provider: () => {
        let provider = new HDWalletProvider({mnemonic: key,
                              providerOrUrl:"https://kovan.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e",
                              addressIndex: AccountIndex,
                              chainId : 42
                            });
                            return provider;
      },
      network_id: "42"
    },
    optimism_kovan: {
      provider: () => {
        let provider = new HDWalletProvider({mnemonic: key,
                              providerOrUrl:"https://optimism-kovan.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e",
                              addressIndex: AccountIndex,
                              chainId : 69
                            });
                            return provider;
      },
      network_id: "69"
    }
  },
  compilers: {
    solc: {
      version: "0.8.9"
    }
  }
};

