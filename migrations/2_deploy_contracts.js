var PoolTracker = artifacts.require("PoolTracker");
var PoolAddressesProviderMock = artifacts.require("PoolAddressesProviderMock");
var PoolMock = artifacts.require("PoolMock");
var WethGatewayTest = artifacts.require("WethGatewayTest");
var TestToken = artifacts.require("TestToken");
var aTestToken = artifacts.require("aTestToken");

require("dotenv").config({path: "../.env"});

module.exports = async function(deployer, network, accounts){
  let poolAddressesProviderAddr;
  let wethGatewayAddr;
  let multiSig;
  console.log('log', network);
  if(network === "matic_mumbai"){
    poolAddressesProviderAddr = "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6";
    wethGatewayAddr = "0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17";
    multiSig = "0x78726673245fdb56425c8bd782f6FaA3E447625A";
  }
  else {
    await deployer.deploy(PoolMock);
    await deployer.deploy(WethGatewayTest);
    await deployer.deploy(PoolAddressesProviderMock);
    await deployer.deploy(TestToken);
    await deployer.deploy(aTestToken);

    multiSig = accounts[0];
    wethGatewayTest = await WethGatewayTest.deployed();
    poolAddressesProviderMock = await PoolAddressesProviderMock.deployed();
    await poolAddressesProviderMock.setPoolImpl(PoolMock.address);
    console.log("address", wethGatewayTest.address);
    poolAddressesProviderAddr = poolAddressesProviderMock.address;
    //poolAddressesProviderAddr = "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6";
    wethGatewayAddr = wethGatewayTest.address;
  }

  await deployer.deploy(PoolTracker, poolAddressesProviderAddr, wethGatewayAddr, multiSig);
};
