import React from "react"

import DaiLogo from "../components/cryptoLogos/DaiLogo";
import WbtcLogo from "../components/cryptoLogos/WbtcLogo";
import UsdcLogo from "../components/cryptoLogos/UsdcLogo";
import TetherLogo from "../components/cryptoLogos/TetherLogo";
import EthLogo from "../components/cryptoLogos/EthLogo";
import AaveLogo from "../components/cryptoLogos/AaveLogo";

export const redirectWindowTwitterShare = (url) => {
  window.open(url, "_blank");
}

export const getBlockExplorerUrl = (label) => {
  label = '/'+label+'/';
  const urlBase = 'https://mumbai.polygonscan.com'
  return urlBase + label;
}
export const redirectWindowBlockExplorer = (hash, label) => {
  let url = getBlockExplorerUrl(label);
  let newPageUrl = url + hash;
  window.open(newPageUrl, "_blank")
}

export const redirectWindowHash = (url, hash) => {
  let newPageUrl = url + hash;
  window.open(newPageUrl, "_blank")
}

export const getTokenBaseAmount = (amount, dec) => {
    let stringf = "";
    amount = String(amount);
    let pos = amount.indexOf('.');

    console.log('pos', pos, amount.length);
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
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

export const formatDollars = (x) => {
  if(x && x < 0.01){
    return  "<$0.01";
  }
  x = x.toFixed(2);
  let commas = numberWithCommas(x);
  x = isNaN(x) ? "n/a" : ('$' + commas);
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

    const totalInterest = Number(item.unclaimedInterest) + Number(item.claimedInterest);
    interestEarned += precise(totalInterest, item.decimals) * priceUSD;

    totalBalance += precise(item.totalDeposits, item.decimals) * priceUSD;
  }

  userBalance = formatDollars(userBalance);
  totalBalance = formatDollars(totalBalance);
  interestEarned = formatDollars(interestEarned);

  return {userBalance, interestEarned, totalBalance}
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

  return logo;
}