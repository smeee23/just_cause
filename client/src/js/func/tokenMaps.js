
const kovanTokenMap = {
    AAVE: {address: "0xB597cd8D3217ea6477232F9217fa70837ff667Af", decimals: 18, apiKey: "aave"},
    BAT: {address: "0x2d12186Fbb9f9a8C28B3FfdD4c42920f8539D738", decimals: 18, apiKey: "bat"},
    BUSD: {address: "0x4c6E1EFC12FDfD568186b7BAEc0A43fFfb4bCcCf", decimals: 18, apiKey: "busd"},
    DAI: {address:"0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD", decimals: 18, apiKey: "dai"},
    ENJ: {address:"0xC64f90Cd7B564D3ab580eb20a102A8238E218be2", decimals: 18, apiKey: "enj"},
    LINK: {address:"0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789", decimals: 18, apikey:"chainlink"},
    MANA: {address:"0x738Dc6380157429e957d223e6333Dc385c85Fec7", decimals: 18, apikey: "decentraland"},
    MKR: {address:"0x61e4CAE3DA7FD189e52a4879C7B8067D7C2Cc0FA",decimals: 18, apiKey: "mkr"},
    REN: {address:"0x5eebf65A6746eed38042353Ba84c8e37eD58Ac6f",decimals: 18, apiKey: "ren"},
    SNX: {address:"0x7FDb81B0b8a010dd4FFc57C3fecbf145BA8Bd947",decimals: 18, apiKey: "synthetix"},
    TUSD: {address:"0x016750AC630F711882812f24Dba6c95b9D35856d",decimals: 18, apiKey: "tusd"},
    USDC: {address:"0xe22da380ee6B445bb8273C81944ADEB6E8450422",decimals: 6, apiKey: "usdc"},
    USDT: {address:"0x13512979ADE267AB5100878E2e0f485B568328a4",decimals: 6, apiKey: "usdt"},
    WBTC: {address:"0xD1B98B6607330172f1D991521145A22BCe793277",decimals: 8, apiKey: "wbtc"},
    ETH: {address:"0xd0A1E359811322d97991E03f863a0C30C2cF029C",decimals: 18, apiKey: "eth"},
    YFI: {address:"0xb7c325266ec274fEb1354021D27FA3E3379D840d",decimals: 18, apiKey: "yfi"},
    ZRX: {address:"0xD0d76886cF8D952ca26177EB7CfDf83bad08C00C",decimals: 18, apiKey: "zrx"},
    UNI: {address:"0x075A36BA8846C6B6F53644fDd3bf17E5151789DC",decimals: 18, apiKey: "uniswap"},
    AMPL: {address:"0x3E0437898a5667a4769B1Ca5A34aAB1ae7E81377",decimals: 9, apiKey: "ampl"},
}

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

const aavePoolAddressesProviderPolygonMumbaiV3Address = '0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6';
const aavePoolAddressesProviderPolygonMainnetAddress = '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb';

export const getTokenMap = (networkId) =>{

    if(networkId === 80001) return polygonMumbaiV3TokenMap;

    if(networkId === 137) return polygonMainetTokenMap;
}

export const getAaveAddressProvider = (networkId) => {
    if(networkId === 80001) return aavePoolAddressesProviderPolygonMumbaiV3Address;

    if(networkId === 137) return aavePoolAddressesProviderPolygonMainnetAddress;
}