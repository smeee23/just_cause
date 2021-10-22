var PoolTracker = artifacts.require("PoolTracker");

module.exports = function(deployer) {
  deployer.deploy(PoolTracker);
};
