var PoolTracker = artifacts.require("PoolTracker");
//var JustCauseERC721 = artifacts.require("JustCauseERC721");

module.exports = function(deployer) {
  deployer.deploy(PoolTracker);
  //deployer.deploy(JustCauseERC721);
};
