![JC_homepage](https://user-images.githubusercontent.com/85646760/169139253-062ba675-17d2-424c-b969-2fd8fa9d4a86.png)

This repository contains the smart contract code and front-end React dapp for JustCause (v1). The app uses Truffle as a development environment for testing and deployment tasks.

# What is JustCause?

JustCause is a crowdfunding platform that allows users to leverage the power of defi to fund causes that are important to them. We use an innovative funding mechanism to allow users to contribute to public goods, charitable organizations, DAOs, local/global/personal causes, and much more.

Users are able to participate as either Contributors or Pool Creators. Pool Creators generate JustCause Pools representing a cause in need of funding. Contributors deposit tokens into JustCause Pools which in turn deposit them into Aave’s lending protocol. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds, they simply withdraw their original deposit and the interest accrued is left behind for the cause.

JustCause has two types of pools: Verified Pools and Unverified pools. Verified pools are created by the team, and the recipient of the funds will be verified before pool creation (e.g. a pool where the recipient is a well known charity or organization). Unverified pools are generated by users of the protocol, with the recipient of the funds being specified by the creator at the time of creation. We want to make it so anyone can create and fund a cause on JustCause.  

# Connect with us

You can join the Discord channel or reach out on Twitter [@JustCausedev](https://twitter.com/JustCauseDev)

# Getting Started

The easiest way to familiarize yourself with JustCause is through our [dapp](https://www.justcause.finance/#/) hosted on IPFS (InterPlanetary File System). Connect your wallet and jump into JustCause Pools by donating to a cause or creating one of your own.

# Setup

The app uses Truffle as a development environment for testing and deployment tasks. Truffle requires updated versions of node and npm to function correctly. To check the versions enter command:

```
truffle --version

npm --version

node --version
```
(Installation: [Downloading and installing Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and [Truffle Suite)](https://trufflesuite.com/docs/truffle/getting-started/installation/) 


To run locally clone this repository with command:

```
git clone https://github.com/smeee23/just_cause.git
```

To install dependencies, from the client directory enter the command:

```
npm install
```

After installing dependencies, to start a local instance of the dapp enter the command:

```
npm start
```

# Test

In order to run the full smart contract testing suite open the truffle developer console by entering the command:

```
truffle develop
```

This provides your own private Ethereum blockchain sandbox. Once in the developer console enter the command:

```
test
```

# Documentation

tba

# Audits

tba