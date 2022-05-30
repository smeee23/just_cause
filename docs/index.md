---
layout: default
title: about
---

<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {
  font-family: "Lato", sans-serif;
}
  
.hidden {
  display: none;
}
  
.sidenav {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #111;
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
}

.sidenav a {
  padding: 8px 8px 8px 32px;
  text-decoration: none;
  font-size: 15px;
  color: #818181;
  display: block;
  transition: 0.3s;
}

.sidenav p {
  padding: 8px 8px 8px 16px;
  text-decoration: none;
  font-size: 25px;
  color: #818181;
  display: block;
  transition: 0.3s;
}

.sidenav a:hover {
  color: #f1f1f1;
}

.sidenav .closebtn {
  position: absolute;
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
}

@media screen and (max-height: 450px) {
  .sidenav {padding-top: 15px;}
  .sidenav a {font-size: 18px;}
}
</style>
</head>
<body>

<div id="mySidenav" class="sidenav">
  <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
  <p>General</p>
  <a href="#" onclick="setText('about')">About</a>
  <a href="#" onclick="setText('donations')">Lossless Donations</a>
  <a href="#" onclick="setText('cause')">Your Cause</a>
  <a href="#" onclick="setText('faq')">FAQ</a>
  
  <p>Guides</p>
  <a href="#" onclick="setText('polygon_guide')">Polygon Network</a>
  <a href="#" onclick="setText('create_guide')">Create Cause</a>
  <a href="#" onclick="setText('donate_guide')">Donate</a>
  <a href="#" onclick="setText('view_nft_guide')">View NFT</a>
  <a href="#" onclick="setText('share_guide')">Share Cause</a>
  
  <p>Contracts</p>
  <a href="#" onclick="setText('poolTracker')">PoolTacker</a>
  <a href="#" onclick="setText('justCausePool')">JustCausePool</a>
</div>

<span style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; Menu</span>

<div id="logo" markdown="1">
  ![jc_logo](https://user-images.githubusercontent.com/85646760/170550529-6cd84d59-b1c6-496c-810c-0242cf9eb843.png)
</div>
    
<div id="home" markdown="1">
  
# About Us

JustCause is a crowdfunding platform that allows users to leverage the power of defi to fund causes that are important to them. We use an innovative funding mechanism to allow users to contribute to public goods, charitable organizations, DAOs, local/global/personal causes, and much more.

Users participate as either Contributors or Pool Creators. Pool Creators generate JustCause Pools representing a cause in need of funding. Contributors deposit tokens into JustCause Pools which in turn deposit them into Aave’s lending protocol. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds, they simply withdraw their original deposit and the interest accrued is left behind for the cause.

# Our Mission
  
JustCause is an open source, permissionless and non-custodial protocol. This means that anyone has the freedom to create or contribute to pools with a user interface or interact directly with the smart contracts on the network. This freedom lies at the heart of the difference between permissioned (closed) and permissionless (open) systems.

Our mission is to give users the freedom to create and fund any cause they deem worthy. Crowdfunding mechanisms based on traditional financial payment networks are inherently permissioned and custodial. This leaves the funds and users of these systems vulnerable to financial censorship. We want to solve this problem. 

</div>
  
<div id="about" class="hidden" markdown="1">
  
# About Us

JustCause is a crowdfunding platform that allows users to leverage the power of defi to fund causes that are important to them. We use an innovative funding mechanism to allow users to contribute to public goods, charitable organizations, DAOs, local/global/personal causes, and much more.

Users participate as either Contributors or Pool Creators. Pool Creators generate JustCause Pools representing a cause in need of funding. Contributors deposit tokens into JustCause Pools which in turn deposit them into Aave’s lending protocol. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds, they simply withdraw their original deposit and the interest accrued is left behind for the cause.
              
# Our Mission
  
JustCause is an open source, permissionless and non-custodial protocol. This means that anyone has the freedom to create or contribute to pools with a user interface or interact directly with the smart contracts on the network. This freedom lies at the heart of the difference between permissioned (closed) and permissionless (open) systems.

Our mission is to give users the freedom to create and fund any cause they deem worthy. Crowdfunding mechanisms based on traditional financial payment networks are inherently permissioned and custodial. This leaves the funds and users of these systems vulnerable to financial censorship. We want to solve this problem.

</div>
  
<div id="donations" class="hidden" markdown="1">
              
# Lossless Donations

JustCause smart contracts let users donate to charity without parting with their hard earned money! 

### Aave

JustCause Pools generate interest through an integration with the [Aave lending protocol](https://docs.aave.com/hub/). Aave can be thought of as an automated system of liquidity pools. Users deposit tokens they want to lend out, which are amassed into a large lending pool. Borrowers may then draw from these pools by taking out collateralized loans. In exchange for providing liquidity to the market lenders earn a passive rate of interest on their deposits.

The Aave Protocol has been audited, and has an ongoing bug bounty program. It secures tens of billions of dollars of value. The protocol is completely open source, allowing anyone to interact and build on top of it. Every possible step has been taken to minimize the risk as much as possible. However, no platform can be considered entirely risk free. Please see the Risks section for more details.

### Fund a Cause

To donate users go to the Dashboard to see JustCause's Verified Pools. Alternatively, users search for user generated pools by name or contract address. 

Users share Causes they create or feel passionate about on social media by clicking the share icons in the  Pool. This creates a post with a link on the platform for friends to follow and contribute.

Contributors are able to see and withdraw deposits from pools they have contributed to under Contributions in the Dashboard tab.  

### Contributor NFT’s

Another unique feature of JustCause is that the deposit information for the users and pool creators is stored on-chain in the form of an NFT’s (non-fungible token). A Pool Creator has the option of uploading an image at the time of pool creation. An NFT is generated of the image for the Contributors to the pool. The Contributor’s token acts as an on-chain receipt by storing data on their funds deposited in the Pool. It is for this reason that contributor NFT’s are non-transferable. The only way to get one is to deposit for the cause. 
  
</div>
  
<div id="cause" class="hidden" markdown="1">
              
# Your Cause
  
We want to make it so anyone can create and fund a Cause on JustCause.
  
Every Cause on JustCause is funded through a Pool. Think of a Pool as a savings account that generates interest on deposits. Any interest generated gets automatically donated to the Cause. JustCause has two types of pools: Verified Pools and User pools. 
  
### Verified Pools
  
Verified pools are created by the team, and the recipient of the funds are known and established entities.  In short, any user who contributes knows where the donations are going. 
  
All verified pools can be found under Verified Causes in the Dashboard tab.
  
### User Pools
  
User pools are generated by pool creators utilizing the protocol’s smart contracts. The recipients of the funds are specified by the creators at the time of generation. 
  
It is important to note that anyone can create a user pool for any reason. More importantly, the allocation of funds cannot be accounted for in most circumstances. Therefore, it is crucial that users take caution when contributing to user pools. We advise only contributing to user pools when both the pool creator and receiver are trusted entities. 
  
User pools can be found by searching by name or contract address.
  
### Your Cause
  
Receivers are able to see and claim donations for pools under Your Causes in the Dashboard tab. For instructions on claiming, please see the guide section.
  
</div>

<div id="faq" class="hidden" markdown="1">
              
# FAQ

---
  
### What is JustCause?

JustCause is a decentralized non-custodial crowdfunding protocol where users participate as Contributors or Pool Creators. Contributors deposit funds that are used in the Aave lending protocol to generate donations for public goods, charitable organizations, DAOs, local/global/personal causes, and much more.

---

### Where are my deposited funds stored?

Your funds are allocated in a smart contract. The code of the smart contract is public, open source, and audited by third party auditors. You can withdraw your funds from the pool at any time.

---

### How do I interact with the JustCause protocol?

[JustCause dApp](https://www.justcause.finance/#/) is currently deployed on the Polygon PoS (proof of stake) network. 

See: [Getting started on the Polygon PoS chain](https://wallet.polygon.technology/)

---
  
### What is Polygon PoS?

Polygon is a decentralised Ethereum scaling platform that enables developers to build scalable user-friendly dApps with low transaction fees. 

See: [Getting started on the Polygon PoS chain](https://wallet.polygon.technology/)

---

### What is the cost of donating with JustCause protocol?

While Contributors receive their full deposit back upon withdrawal, interacting with the protocol requires transactions and thus transaction fees on the Polygon PoS blockchain.

---

### Why use JustCause?

JustCause is an open source, permissionless and non-custodial protocol. This means that anyone has the freedom to create or contribute to pools.

Crowdfunding mechanisms based on traditional financial payment networks are inherently permissioned and custodial. This leaves the funds and users of these systems vulnerable to financial censorship. We want to solve this problem.

---

### Is there any risk?

The risks related to the JustCause platform are the smart contract risk (risk of a bug within the protocol code and the Aave protocol code) and liquidation risk (risk on the collateral liquidation process on Aave). Every possible step has been taken to minimize the risk as much as possible-- the protocol code is public and open source and it has been audited. 

---

### How much will my contributions donate?
JustCause Pools receive continuous earnings from Aave that evolve with market conditions based on:

The interest rate payment on loans – on Aave depositors share the interests paid by borrowers corresponding to the average borrow rate times the utilization rate. The higher the utilization of a reserve the higher the yield for depositors. 

Flash Loan fees – on Aave depositors receive a share of the Flash Loan fees corresponding to .09% of the Flash Loan volume.

On Aave each asset has its own market of supply and demand with its own APY (Annual Percentage Yield) which evolves with time. 

---

### Is there a minimum or maximum amount to deposit?

Users are able to deposit any amount they want, there is no minimum or maximum limit.  

---

### What tokens are allowed to be deposited?

JustCause Pools accept Polygon network MATIC, USDC, USDT, DAI, WBTC, WETH, AAVE, DPI, and LINK with more to be added.

---

</div>
  
<div id="polygon_guide" class="hidden" markdown="1">
              
# Getting Started With Polygon
  
Guide to be released shortly

</div>
  
<div id="create_guide" class="hidden" markdown="1">
              
# Create a Cause
  
Guide to be released shortly

</div>
  
<div id="donate_guide" class="hidden" markdown="1">
              
# Donation
  
Guide to be released shortly

</div>
<div id="view_nft_guide" class="hidden" markdown="1">
              
# View Your NFT on OpenSea
  
Guide to be released shortly

</div>

<div id="share_guide" class="hidden" markdown="1">
              
# Share Your Cause
  
Guide to be released shortly

</div>
  
<div id="poolTracker" class="hidden" markdown="1">
              
# PoolTracker

</div>
  
<div id="justCausePool" class="hidden" markdown="1">
              
# JustCausePool

</div>
<script>
  
function setText(id) {
  document.getElementById('home').innerHTML = document.getElementById(id).innerHTML;
}
  
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}
</script>
   
</body>
</html> 
