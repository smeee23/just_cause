const axios = require('axios');

export const getPriceFromMessari = async(apiKey) => {
    const url = "https://data.messari.io/api/v1/assets/"+apiKey+"/metrics/market-data";
    const response = await axios.get(url);
    const priceUSD = response.data.data.market_data.price_usd;
    return priceUSD;
}

