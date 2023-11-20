import { deployedNetworks } from './tokenMaps';

const axios = require('axios');

export const getPriceFromMessari = async(apiKey) => {
    let priceUSD;
    try{
        const url = "https://data.messari.io/api/v1/assets/"+apiKey+"/metrics/market-data";
        const response = await axios.get(url);
        priceUSD = response.data.data.market_data.price_usd;
    }
    catch (error) {
        console.error(error);
    }
    return priceUSD;
}

export const getPriceFromCoinGecko = async(networkId) => {
    let data;
    try{
        const url = "https://api.coingecko.com/api/v3/simple/price?ids=aave,dai,tether,usd-coin,ethereum,bitcoin,chainlink,matic-network,defipulse-index&vs_currencies=usd";
        const response = await axios.get(url);
        //console.log('coingecko prices:', response.data);
        data = response.data;
    }
    catch (error) {
        console.error(error);
    }
    return data;
}

export const getPriceFromCoinCap = async() => {
    let data = {};
    try{
        const url1 = "https://api.coincap.io/v2/rates/bitcoin";
        const url2 = "https://api.coincap.io/v2/rates/ethereum";
        const response1 = await axios.get(url1);

        const response2 = await axios.get(url2);

        data = {
            "dai": 1.00,
            "usd-coin": 1.00,
            "tether": 1.00,
            "bitcoin": Number(response1.data.data.rateUsd),
            "ethereum": Number(response2.data.data.rateUsd)
        }
    }
    catch (error) {
        console.error(error);
    }
    return data;
}

