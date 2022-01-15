export const getPriceFromMessari = async(apiKey) => {
    const url = "https://data.messari.io/api/v1/assets/"+apiKey+"/metrics/market-data"
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

