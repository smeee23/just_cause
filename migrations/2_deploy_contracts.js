var PoolTracker = artifacts.require("PoolTracker");
//var JustCauseERC721 = artifacts.require("JustCauseERC721");
//var JustCausePool = artifacts.require("JustCausePool");
require("dotenv").config({path: "../.env"});

module.exports = async function(deployer){
  const _poolAddressesProviderAddr = "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6";
  const _wethGatewayAddr = "0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17";

  await deployer.deploy(PoolTracker, _poolAddressesProviderAddr, _wethGatewayAddr);
  //deployer.deploy(JustCauseERC721);
  //deployer.deploy(JustCausePool);
};
