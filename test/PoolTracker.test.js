const PoolTracker = artifacts.require("PoolTracker");
const PoolAddressesProviderMock = artifacts.require("PoolAddressesProviderMock");
const PoolMock = artifacts.require("PoolMock");
const TestToken = artifacts.require("TestToken");
const aTestToken = artifacts.require("aTestToken");
const 
const { expectRevert } = require('@openzeppelin/test-helpers');

const chai = require("./setupchai.js");
const BN =web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "../.env"});

contract("Pool Tracker", async (accounts) => {

    const [validator, depositor, owner, receiver] = accounts;
    beforeEach(async() => {
        this.testToken = await TestToken.new();
        this.notApprovedToken = await TestToken.new();
        this.aToken = await aTestToken.new();

        this.poolMock = await PoolMock.new();
        await this.poolMock.setTestTokens(this.aToken.address, this.testToken.address, {from: validator});

        this.poolAddressesProviderMock = await PoolAddressesProviderMock.new();
        await this.poolAddressesProviderMock.setPoolImpl(this.poolMock.address, {from: validator});

        const poolAddressesProviderAddr = this.poolAddressesProviderMock.address;
        const wethGatewayAddr = "0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17";
        this.poolTracker = await PoolTracker.new(poolAddressesProviderAddr, wethGatewayAddr);
    });

    it("all pools created by validator should be in verified pools", async() => {
        const startPoolsLength = (await this.poolTracker.getVerifiedPools()).length;

        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator});
        assert.equal(startPoolsLength + 1, (await this.poolTracker.getVerifiedPools()).length, "The pool created by validator was not added to verified list");
    });

    it("pools created by non-validator addresses should not be in verified pools", async() => {
        const startPoolsLength = (await this.poolTracker.getVerifiedPools()).length;
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        assert.equal(startPoolsLength, (await this.poolTracker.getVerifiedPools()).length, "The pool created by non-validator address was added to verified list");
    });

    it("getAddressFromName should return an address based on unique name", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator});
        const testAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        assert.strictEqual(testAddress, knownAddress, "The pool name did not return the correct address");
    });

    it("checkPool should return true if address is that of a pool", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const isPool = await this.poolTracker.checkPool(knownAddress);
        assert.isTrue(isPool, "known address not found");
    });

    it("createJCPoolClone should revert when passed a non-accepted token", async() =>{
        await expectRevert(
            this.poolTracker.createJCPoolClone([this.notApprovedToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator}),
            "tokens not approved"
        );
    });

    it("add deposit ends with aTokens in JustCause pool", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        expect(this.aToken.balanceOf(knownAddress)).to.eventually.be.a.bignumber.equal(new BN(depositAmount));
    });
    it("add deposit reverts when _pool parameter is not a pool", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        await expectRevert(
            this.poolTracker.addDeposit(depositAmount, this.testToken.address, owner, false, {from: depositor}),
            "not pool"
        );
    });
    it("add deposit reverts when PoolTracker does not have allowance for token from depositor", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        //await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await expectRevert(
            this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor}),
            "sender not approved"
        );
    });
    it("add deposit ends with NFT sent to depositor", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});

        expect(this.aToken.balanceOf(knownAddress)).to.eventually.be.a.bignumber.equal(new BN(depositAmount));
    });
})