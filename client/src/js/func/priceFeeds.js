const axios = require('axios');

export const getPriceFromMessari = async(apiKey) => {
    try{
        const url = "https://data.messari.io/api/v1/assets/"+apiKey+"/metrics/market-data";
        const response = await axios.get(url);
        const priceUSD = response.data.data.market_data.price_usd;
        return priceUSD;
    }
    catch (error) {
        console.error(error);
    }
}

export const getPriceFromCoinGecko = async(networkId) => {
    try{
        if(networkId === 80001 || networkId === 137){
            const url = "https://api.coingecko.com/api/v3/simple/price?ids=aave,dai,tether,usd-coin,ethereum,bitcoin,chainlink,matic-network,defipulse-index&vs_currencies=usd";
            const response = await axios.get(url);
            console.log('coingecko prices:', response.data);
            return response.data;
        }
    }
    catch (error) {
        console.error(error);
    }
}

