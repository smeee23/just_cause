import React from "react"

import DaiLogo from "../components/cryptoLogos/DaiLogo";
import WbtcLogo from "../components/cryptoLogos/WbtcLogo";
import UsdcLogo from "../components/cryptoLogos/UsdcLogo";
import TetherLogo from "../components/cryptoLogos/TetherLogo";
import EthLogo from "../components/cryptoLogos/EthLogo";
import AaveLogo from "../components/cryptoLogos/AaveLogo";
import MaticLogo from "../components/cryptoLogos/MaticLogo";
import WEthLogo from "../components/cryptoLogos/WEthLogo";
import LinkLogo from "../components/cryptoLogos/LinkLogo";
import DpiLogo from "../components/cryptoLogos/DpiLogo";
import OptimismLogo from "../components/cryptoLogos/OptimismLogo";
import ArbitrumLogo from "../components/cryptoLogos/ArbitrumLogo"

import DaiLogoLg from "../components/cryptoLogos/DaiLogoLg";
import WbtcLogoLg from "../components/cryptoLogos/WbtcLogoLg";
import UsdcLogoLg from "../components/cryptoLogos/UsdcLogoLg";
import TetherLogoLg from "../components/cryptoLogos/TetherLogoLg";
import EthLogoLg from "../components/cryptoLogos/EthLogoLg";
import AaveLogoLg from "../components/cryptoLogos/AaveLogoLg";
import MaticLogoLg from "../components/cryptoLogos/MaticLogoLg";
import WEthLogoLg from "../components/cryptoLogos/WEthLogoLg";
import LinkLogoLg from "../components/cryptoLogos/LinkLogoLg";
import DpiLogoLg from "../components/cryptoLogos/DpiLogoLg";

import DaiLogoMd from "../components/cryptoLogos/DaiLogoMd";
import WbtcLogoMd from "../components/cryptoLogos/WbtcLogoMd";
import UsdcLogoMd from "../components/cryptoLogos/UsdcLogoMd";
import TetherLogoMd from "../components/cryptoLogos/TetherLogoMd";
import EthLogoMd from "../components/cryptoLogos/EthLogoMd";
import AaveLogoMd from "../components/cryptoLogos/AaveLogoMd";
import MaticLogoMd from "../components/cryptoLogos/MaticLogoMd";
import WEthLogoMd from "../components/cryptoLogos/WEthLogoMd";
import LinkLogoMd from "../components/cryptoLogos/LinkLogoMd";
import DpiLogoMd from "../components/cryptoLogos/DpiLogoMd";

import Logo from "../components/Logo"

import {getPriceFromCoinGecko} from './priceFeeds.js'

import { getDataFromS3, getAboutFromS3 } from "./awsS3";

//const { createHash } = require('crypto');

export const linkedInShare = (purl, ptitle, poolAddress, psummary) => {
  let url = 'http://www.linkedin.com/shareArticle?mini=true';
  url += '&url=' + encodeURIComponent(purl)+poolAddress;
  url += '&title=' + encodeURIComponent(ptitle);
  url += '&summary=' + encodeURIComponent(psummary);
  url += '&source=' + encodeURIComponent("https://www.justcause.finance/#/");

  window.open(url, "_blank");
}

export const twitterShare = (purl, ptitle, poolAddress) => {
  let url = 'http://twitter.com/share';
  url += '?text=' + encodeURIComponent(ptitle);
  url += '&url=' + encodeURIComponent(purl)+poolAddress;
  url += '&counturl=' + encodeURIComponent(purl);

  window.open(url, "_blank");
}

export const facebookShare = (purl,poolAddress) => {
  let url = 'http://www.facebook.com/sharer.php?s=100';
  url += '&u=' + encodeURIComponent(purl)+poolAddress;
  window.open(url, "_blank");
}

export const getBlockExplorerUrl = (label, networkId) => {
  label = '/'+label+'/';
  let urlBase;
  if(networkId === 80001) urlBase = 'https://mumbai.polygonscan.com';
  else if (networkId === 137) urlBase = 'https://polygonscan.com';
  else if (networkId === 10) urlBase = 'https://optimistic.etherscan.io';
  else if (networkId === 42161) urlBase = 'https://arbiscan.io/';
  return urlBase + label;
}
export const redirectWindowBlockExplorer = (hash, label, networkId) => {
  let url = getBlockExplorerUrl(label, networkId);
  let newPageUrl = url + hash;
  window.open(newPageUrl, "_blank")
}

export const redirectWindowUrl = (url) => {
  window.open(url, "_blank")
}

export const redirectWindowHash = (url, hash) => {
  let newPageUrl = url + hash;
  window.open(newPageUrl, "_blank")
}

export const getTokenBaseAmount = (amount, dec) => {
    let stringf = "";
    amount = String(amount);
    let pos = amount.indexOf('.');

    let len = (pos === -1) ? dec : dec - (amount.length-1 - pos);
    for(var i=0;i<len;i++){
      stringf = stringf+"0";
    }
    amount = amount.replace('.', '');
    return amount+stringf;
}


export const toFixed = (x) => {
    if (Math.abs(x) < 1.0) {
      let e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      let e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
  }

export const precise = (x, decimals) => {
    let number = (Number.parseFloat(x).toPrecision(6) / (10**decimals));
    return toFixed(number);
}

export const sha256Hash = async(str) => {
  const encoder = new TextEncoder(); // this will encode string into UTF-8 by default
  const arrayBuffer = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  console.log("hashHex", typeof(hashHex))
  return hashHex;
}

export const encryptString = (inputString, encryptionKey) => {
  let encrypted = '';

  for (let i = 0; i < inputString.length; i++) {
    const charCode = inputString.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
    encrypted += String.fromCharCode(charCode);
  }

  return btoa(encrypted);
}

export const rayMul = (a, b) => {
    if (a === 0 || b === 0) {
      return 0;
    }

    const ray = 1e27;
    const halfRAY = ray / 2;
    return (a * b + halfRAY) / ray;
  }


  export const getAPY = (depositAPY) => {
    if(depositAPY){
        return depositAPY + '%';
    }
    else{
        return "N/A";
    }
}

export const delay = (delayInms) => {
  return new Promise(resolve => {
    setTimeout(() => {
    resolve(2);
    }, delayInms);
  });
}

export const numberWithCommas = (x) => {
  return x.toString()
}

export const digitsWithMaxTenLength = (x) => {
  let str = x.toString().substring(0, 10);
  if(str === "0.00000000") return "<0.00000001"

  return str
}

export const formatDollars = (x) => {
  if(x && x < 0.01){
    return  "<$0.01";
  }
  x = x.toFixed(2);
  let commas = numberWithCommas(x);
  x = isNaN(x) ? "" : ('$' + commas);
  return x;
}

export const getFormatUSD = (amount, priceUSD) => {
  amount = amount * priceUSD;
  amount = formatDollars(amount);
  return amount;
}

export const getHeaderValuesInUSD = (acceptedTokenInfo, tokenMap) => {
  if (!acceptedTokenInfo) return 'no data';

  let userBalance = 0.0;
  let interestEarned = 0.0;
  let totalBalance = 0.0;

  for(let i = 0; i < acceptedTokenInfo.length; i++){
    const item = acceptedTokenInfo[i];
    const tokenString = item.acceptedTokenString;
    const priceUSD = tokenMap[tokenString] && tokenMap[tokenString].priceUSD;

    userBalance += precise(item.userBalance, item.decimals) * priceUSD;

    interestEarned += precise(item.claimedInterest, item.decimals) * priceUSD;

    totalBalance += precise(item.totalDeposits, item.decimals) * priceUSD;
  }

  userBalance = formatDollars(userBalance);
  totalBalance = formatDollars(totalBalance);
  interestEarned = formatDollars(interestEarned);

  return {userBalance, interestEarned, totalBalance}
}

export const getConnection = (networkId, activeAccount) => {
  if(activeAccount){
    if(networkId === 80001) return 'TEST';
    else if (networkId === 137) return <MaticLogo/>;
    else if (networkId === 10) return <OptimismLogo size="20"/>;
    else if (networkId === 42161) return <ArbitrumLogo size="20"/>;
  }
}

export const isNativeToken = (networkId, tokenString) => {
  const isETH = (tokenString === 'ETH' && networkId === 10) || (tokenString === 'MATIC' && [10, 80001].includes(networkId)) ? true : false;
  return isETH;
}

export const displayTVL = (id, label, tokenMap, cutOff) => {
  if(tokenMap){
    let total = 0.0;

    let acceptedTokens = Object.keys(tokenMap);
    for(let i = 0; i < acceptedTokens.length; i++){
      const key = acceptedTokens[i];

      const priceUSD = tokenMap[key] && tokenMap[key].priceUSD;
      const tokenAmount = tokenMap[key][id];
      if(tokenAmount && priceUSD){
        total += tokenAmount * priceUSD;
      }

    }
    const s = formatDollars(total);
    if(s === "<$0.01") return label +  " $0"
    return label + ' ' + s.substring(0, s.length - cutOff);
  }
}

export const displayLogo = (acceptedTokenString) => {
  let logo = '';
  if(acceptedTokenString === 'ETH'){
    logo = <EthLogo/>;
  }
  else if (acceptedTokenString === 'USDT'){
    logo = <TetherLogo/>;
  }
  else if (acceptedTokenString === 'USDC'){
    logo = <UsdcLogo/>;
  }
  else if (acceptedTokenString === 'WBTC'){
    logo = <WbtcLogo/>;
  }
  else if (acceptedTokenString === 'DAI'){
    logo = <DaiLogo/>;
  }
  else if (acceptedTokenString === 'AAVE'){
    logo = <AaveLogo/>;
  }
  else if(acceptedTokenString === 'WETH'){
    logo = <WEthLogo/>;
  }
  else if(acceptedTokenString === 'MATIC'){
    logo = <MaticLogo/>;
  }
  else if(acceptedTokenString === 'LINK'){
    logo = <LinkLogo/>;
  }
  else if(acceptedTokenString === 'DPI'){
    logo = <DpiLogo/>;
  }
  else{
    logo = <Logo/>
  }
  return logo
}

export const checkLocationForAppDeploy = () => {
  const urls = ["https://www.justcause.finance/#/", "https://justcause.finance/#/", "https://justcause.finance",
              "https://www.justcause.finance/#/just_cause/howitworks", "https://www.justcause.finance/#/just_cause/",
              "https://justcause.finance/#/just_cause/howitworks", "https://justcause.finance/#/just_cause/",
              "https://www.justcause.finance/#/just_cause"];

  const pathnames = ["/howitworks", "/just_cause", "/"]
  const url = window.location.href;
  if(urls.includes(url) || (pathnames.includes(window.location.pathname) && !url.includes("#"))) return "outsideApp";

  else if((window.location.href).includes("search?address=")) return "inSearch"

  return "inApp";
}

export const copyToClipboard = (str) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText)
  if(navigator.clipboard.writeText(str)){
    //alert(str + " copied to clipboard")
    return navigator.clipboard.writeText(str);
  }
  return Promise.reject('The Clipboard API is not available.');
}

export const checkPoolInPoolInfo = (poolAddress, poolInfo) => {
  return Object.keys(poolInfo).includes(poolAddress)
}

export const filterOutVerifieds = (poolAddrs) => {
  return poolAddrs.filter((e) => !["0x4C41B254E7792Af9F03bCf1f72f986fFfE235f00"].includes(e));
}
export const addNewPoolInfo = (prevInfo, newInfo) => {

  Object.keys(prevInfo).forEach( (key, index) => {
    if(prevInfo[key].address === newInfo.poolAddress){
      prevInfo[key].about = newInfo.about;

      Object.keys(prevInfo[key].acceptedTokenInfo).forEach( (key_2, index_2) => {
        if(prevInfo[key].acceptedTokenInfo[key_2].address === newInfo.tokenAddress){
          prevInfo[key].acceptedTokenInfo[key_2].totalDeposits = newInfo.totalDeposits;
          prevInfo[key].acceptedTokenInfo[key_2].userBalance = newInfo.userBalance;
          prevInfo[key].acceptedTokenInfo[key_2].unclaimedInterest = newInfo.unclaimedInterest;
          prevInfo[key].acceptedTokenInfo[key_2].claimedInterest = newInfo.claimedInterest;
        }
      }
      );
    }
  });

  return prevInfo;
}

export const addNewPoolInfoAllTokens = (prevInfo, newInfo) => {
  Object.keys(prevInfo).forEach( (key, index) => {
    if(prevInfo[key].address === newInfo.poolAddress){
      prevInfo[key].about = newInfo.about;

      Object.keys(prevInfo[key].acceptedTokenInfo).forEach( (i) => {
          const tokenInfo = newInfo.newTokenInfo && newInfo.newTokenInfo[prevInfo[key].acceptedTokenInfo[i].address];
          prevInfo[key].acceptedTokenInfo[i].totalDeposits = tokenInfo.totalDeposits;
          prevInfo[key].acceptedTokenInfo[i].userBalance = tokenInfo.userBalance;
          prevInfo[key].acceptedTokenInfo[i].unclaimedInterest = tokenInfo.unclaimedInterest;
          prevInfo[key].acceptedTokenInfo[i].claimedInterest = tokenInfo.claimedInterest;
        }
      );
    }
  });
  return prevInfo;
}

export const addNewPoolInfoAboutOnly = (prevInfo, newInfo) => {
  Object.keys(prevInfo).forEach( (key, index) => {
    if(prevInfo[key].address === newInfo.poolAddress){
      prevInfo[key].about = newInfo.about;
    }
  });

  return prevInfo;
}

export const displayLogoLg = (acceptedTokenString) => {
  let logo = '';
  if(acceptedTokenString === 'ETH'){
    logo = <EthLogoLg/>;
  }
  else if (acceptedTokenString === 'USDT'){
    logo = <TetherLogoLg/>;
  }
  else if (acceptedTokenString === 'USDC'){
    logo = <UsdcLogoLg/>;
  }
  else if (acceptedTokenString === 'WBTC'){
    logo = <WbtcLogoLg/>;
  }
  else if (acceptedTokenString === 'DAI'){
    logo = <DaiLogoLg/>;
  }
  else if (acceptedTokenString === 'AAVE'){
    logo = <AaveLogoLg/>;
  }
  else if(acceptedTokenString === 'WETH'){
    logo = <WEthLogoLg/>;
  }
  else if(acceptedTokenString === 'MATIC'){
    logo = <MaticLogoLg/>;
  }
  else if(acceptedTokenString === 'DPI'){
    logo = <DpiLogoLg/>;
  }
  else if(acceptedTokenString === 'LINK'){
    logo = <LinkLogoLg/>;
  }

  return logo;
}
  export const displayLogoMd = (acceptedTokenString) => {
    let logo = '';
    if(acceptedTokenString === 'ETH'){
      logo = <EthLogoMd/>;
    }
    else if (acceptedTokenString === 'USDT'){
      logo = <TetherLogoMd/>;
    }
    else if (acceptedTokenString === 'USDC'){
      logo = <UsdcLogoMd/>;
    }
    else if (acceptedTokenString === 'WBTC'){
      logo = <WbtcLogoMd/>;
    }
    else if (acceptedTokenString === 'DAI'){
      logo = <DaiLogoMd/>;
    }
    else if (acceptedTokenString === 'AAVE'){
      logo = <AaveLogoMd/>;
    }
    else if(acceptedTokenString === 'WETH'){
      logo = <WEthLogoMd/>;
    }
    else if(acceptedTokenString === 'MATIC'){
      logo = <MaticLogoMd/>;
    }
    else if(acceptedTokenString === 'DPI'){
      logo = <DpiLogoMd/>;
    }
    else if(acceptedTokenString === 'LINK'){
      logo = <LinkLogoMd/>;
    }

  return logo;
}

export const buildAwsPools = async(tokenMap, poolList) => {
  try{
    const poolPromises = poolList.map(async e => {
      const poolData = JSON.parse(await getDataFromS3(e+"_pool_AR"));
      if (poolData.hasOwnProperty("pool")) {
        poolData["address"] = poolData["pool"];
        delete poolData["pool"];
      }
      poolData["about"] = await getAboutFromS3(poolData["name"])
      let acceptedTokenStrings = [];
      poolData["acceptedTokenInfo"].forEach(async(e) => {
        const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === e["address"]);
        e["decimals"] = tokenMap[tokenString].decimals;
        e["acceptedTokenString"] = tokenString;
        acceptedTokenStrings.push(tokenString);
      })
      poolData["acceptedTokenStrings"] = acceptedTokenStrings;
      return poolData;
    });

    // await for all promises to complete
    return await Promise.all(poolPromises);
  }
  catch (error) {
    console.error(error);
  }
}

export const getSearchPoolInfoAws = async(tokenMap, poolAddr) => {
  let poolInfo = {};
  try{
    const secFromWrite = await getLastWrite();
    if(secFromWrite < 1800){
      const pools = [poolAddr]
      const allPoolData = await buildAwsPools(tokenMap, pools);
      allPoolData.forEach(data => {
        poolInfo[data.address] = data;
      });
    }
  }
  catch (error){
    console.error(error);
  }
  return poolInfo[poolAddr];
}

export const getLastWrite = async() => {
  const last_write = await getDataFromS3("last_write_AR");
  const curr_time = Math.floor(Date.now() / 1000);
  //console.log("last_write", last_write, curr_time, (curr_time - last_write));
  return curr_time - last_write;
}

export const getVerifiedPoolInfoAws = async(tokenMap, activeAccount) => {
  let verifiedPoolInfo = {};
  let contributorPoolInfo = {};
  let receiverPoolInfo = {};
  try{
    const secFromWrite = await getLastWrite();
    if(secFromWrite < 1800){
      const data = await getDataFromS3("verified_AR");
      const verifiedPools = data.length > 0 ? JSON.parse(data) : [];
      if(verifiedPools.length > 0){
        const allVerifiedPoolData = await buildAwsPools(tokenMap, verifiedPools);
        allVerifiedPoolData.forEach(data => {
          verifiedPoolInfo[data.address] = data;
        });
      }

      let contributorData;
      if(activeAccount && !["Connect", "Pending"].includes(activeAccount)){
        let data = await getDataFromS3(activeAccount+"__con_AR");
        contributorData = JSON.parse(data);
        const contributorPools = data.length > 0 ? Object.keys(contributorData) : [];
        data = await getDataFromS3(activeAccount+"__rec_AR");
        const receiverPools = data.length > 0 ? JSON.parse(data) : [];

        if(contributorPools.length > 0){
          const allContributorPoolData = await buildAwsPools(tokenMap, contributorPools);
          allContributorPoolData.forEach(data => {
            contributorPoolInfo[data.address] = data;
          });
        }

        if(receiverPools.length > 0){
          const allReceiverPoolData = await buildAwsPools(tokenMap, receiverPools);
          allReceiverPoolData.forEach(data => {
            receiverPoolInfo[data.address] = data;
          });
        }

        if(contributorData){
          verifiedPoolInfo = mergePoolAndDeposits(verifiedPoolInfo, contributorData);
          contributorPoolInfo = mergePoolAndDeposits(contributorPoolInfo, contributorData);
          receiverPoolInfo = mergePoolAndDeposits(receiverPoolInfo, contributorData);
        }
      }
    }
  }
  catch (error){
    console.error(error);
  }
  return { verifiedPoolInfo, contributorPoolInfo, receiverPoolInfo }
}

const mergePoolAndDeposits = (poolObj, depositObj) => {
  // deep copy of the poolObj to avoid mutating the original object
  const mergedPool = JSON.parse(JSON.stringify(poolObj));

  for (let poolAddress in mergedPool) {
    // Loop through acceptedTokenInfo of the current pool
    mergedPool[poolAddress].acceptedTokenInfo.forEach(tokenInfo => {
      const tokenAddress = tokenInfo.address;

      // Set default values
      tokenInfo.userBalance = '0';

      // If there is a deposit for the current token, update userBalance
      if (depositObj[poolAddress] && depositObj[poolAddress][tokenAddress] !== undefined) {
        tokenInfo.userBalance = depositObj[poolAddress][tokenAddress].toString();
      }
    });
  }

  return mergedPool;
}