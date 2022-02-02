var PoolTracker = artifacts.require("PoolTracker");
//var JustCauseERC721 = artifacts.require("JustCauseERC721");
//var JustCausePool = artifacts.require("JustCausePool");

module.exports = function(deployer) {
  deployer.deploy(PoolTracker);
  //deployer.deploy(JustCauseERC721);
  //deployer.deploy(JustCausePool);
};
