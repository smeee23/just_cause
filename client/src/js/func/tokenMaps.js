const polygonMumbaiV3TokenMap = {
    AAVE: {address: '0x0AB1917A0cf92cdcf7F7b637EaC3A46BBBE41409', decimals: 18, apiKey: "aave"},
    DAI: {address:'0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B', decimals: 18, apiKey: "dai"},
    USDC: {address:'0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2',decimals: 6, apiKey: "usd-coin"},
    USDT: {address:'0x21C561e551638401b937b03fE5a0a0652B99B7DD',decimals: 6, apiKey: "tether"},
    WBTC: {address:'0x85E44420b6137bbc75a85CAB5c9A3371af976FdE',decimals: 8, apiKey: "bitcoin"},
    WETH: {address:'0xd575d4047f8c667E064a4ad433D04E25187F40BB', decimals: 18, apiKey: "ethereum"},
    MATIC: {address:'0xb685400156cF3CBE8725958DeAA61436727A30c3', decimals: 18, apiKey: "matic-network"},
    DPI: {address:'0x56e0507A53Ee252947a1E55D84Dc4032F914DD98', decimals: 18, apiKey: "defipulse-index"},
    LINK: {address:'0xD9E7e5dd6e122dDE11244e14A60f38AbA93097f2', decimals: 18, apiKey: "chainlink"},
}

const polygonMainetTokenMap = {
    AAVE: {address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', decimals: 18, apiKey: "aave"},
    DAI: {address:'0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18, apiKey: "dai"},
    USDC: {address:'0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',decimals: 6, apiKey: "usd-coin"},
    USDT: {address:'0xc2132D05D31c914a87C6611C10748AEb04B58e8F',decimals: 6, apiKey: "tether"},
    WBTC: {address:'0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',decimals: 8, apiKey: "bitcoin"},
    WETH: {address:'0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18, apiKey: "ethereum"},
    MATIC: {address:'0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', decimals: 18, apiKey: "matic-network"},
    DPI: {address:'0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369', decimals: 18, apiKey: "defipulse-index"},
    LINK: {address:'0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', decimals: 18, apiKey: "chainlink"},
}

export const optimismMainetTokenMap = {
    DAI: {address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18, apiKey: "dai"},
    USDC: {address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',decimals: 6, apiKey: "usd-coin"},
    USDT: {address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',decimals: 6, apiKey: "tether"},
    WBTC: {address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',decimals: 8, apiKey: "bitcoin"},
    ETH: {address: '0x4200000000000000000000000000000000000006', decimals: 18, apiKey: "ethereum"},
}

const aavePoolAddressesProviderPolygonMumbaiV3Address = '0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6';
const aavePoolAddressesProviderPolygonMainnetAddress = '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb';
const aavePoolAddressesProviderOptimismMainnetAddress = '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb';

const poolTrackerOptimismAddress = "0x9ff20439a4F5e315A48E5714d0f989f18DE77684";
const poolTrackerPolygonAddress = "0x6C819199Be8Ed043BfbBBDeD5CB39a66413fbFd1";
const poolTrackerPolygonMumbaiAddress = "0x0d18DA5180eB259660bd1693927Fc582308c6900";

export const getTokenMap = (networkId) =>{

    if(networkId === 80001) return polygonMumbaiV3TokenMap;

    if(networkId === 137) return polygonMainetTokenMap;

    if(networkId === 10) return optimismMainetTokenMap;
}

export const getAaveAddressProvider = (networkId) => {
    if(networkId === 80001) return aavePoolAddressesProviderPolygonMumbaiV3Address;

    if(networkId === 137) return aavePoolAddressesProviderPolygonMainnetAddress;

    if(networkId === 10) return aavePoolAddressesProviderOptimismMainnetAddress;
}

export const getPoolTrackerAddress = (networkId) => {
    if(networkId === 80001) return poolTrackerPolygonMumbaiAddress;

    if(networkId === 137) return poolTrackerPolygonAddress;

    if(networkId === 10) return poolTrackerOptimismAddress;
}

export const deployedNetworks = [ 80001, 137, 10 ]; //mumbai, polygon, optimism