const PoolTracker = artifacts.require("PoolTracker");
const PoolAddressesProviderMock = artifacts.require("PoolAddressesProviderMock");
const PoolMock = artifacts.require("PoolMock");
const WethGatewayTest = artifacts.require("WethGatewayTest");
const TestToken = artifacts.require("TestToken");
const aTestToken = artifacts.require("aTestToken");
const JCDepositorERC721 = artifacts.require("JCDepositorERC721");
const JCOwnerERC721 = artifacts.require("JCOwnerERC721");
const { expectRevert } = require('@openzeppelin/test-helpers');

const chai = require("./setupchai.js");
const BN =web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "../.env"});

contract("JCOwnerERC721", async (accounts) => {

    const [validator, depositor, owner, receiver] = accounts;

    beforeEach(async() => {
        this.testToken = await TestToken.new();
        this.testToken_2 = await TestToken.new();
        this.notApprovedToken = await TestToken.new();
        this.wethToken = await TestToken.new();
        this.aToken = await aTestToken.new();
        this.aWethToken = await aTestToken.new();
        this.poolMock = await PoolMock.new();
        await this.poolMock.setTestTokens(this.aToken.address, this.testToken.address, this.testToken_2.address, this.wethToken.address, this.aWethToken.address, {from: validator});

        this.poolAddressesProviderMock = await PoolAddressesProviderMock.new();
        await this.poolAddressesProviderMock.setPoolImpl(this.poolMock.address, {from: validator});

        this.wethGateway = await WethGatewayTest.new();
        await this.wethGateway.setValues(this.wethToken.address, this.aWethToken.address, {from: validator});

        const poolAddressesProviderAddr = this.poolAddressesProviderMock.address;
        const wethGatewayAddr = this.wethGateway.address;
        this.poolTracker = await PoolTracker.new(poolAddressesProviderAddr, wethGatewayAddr);
        this.jCDepositorERC721 = await JCDepositorERC721.at(await this.poolTracker.getDepositorERC721Address());
        this.jCOwnerERC721 = await JCOwnerERC721.at(await this.poolTracker.getOwnerERC721Address());
    });

    it("createReceiverToken generates token for receiver", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        assert.equal(await this.jCOwnerERC721.balanceOf(receiver), 1, "balance not equal to 1");
    });

    it("createReceiverToken increments tokenId", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const receiverInfo = await this.jCOwnerERC721.getCreation("1");
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        assert.equal(knownAddress, receiverInfo.pool, "pool address does not match");
    });

    it("createReceiverToken stores tokenURI", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "http://www.SomeFakeMetaUri.com/tokens/", receiver, {from: validator})
        const tokenURI = await this.jCOwnerERC721.tokenURI("1");
        assert.strictEqual(tokenURI, "http://www.SomeFakeMetaUri.com/tokens/", "token uri does not match");
    });
});