const PoolTracker = artifacts.require("PoolTracker");
const PoolAddressesProviderMock = artifacts.require("PoolAddressesProviderMock");
const PoolMock = artifacts.require("PoolMock");
const TestToken = artifacts.require("TestToken");
const aTestToken = artifacts.require("aTestToken");
const JCDepositorERC721 = artifacts.require("JCDepositorERC721");
const JCOwnerERC721 = artifacts.require("JCOwnerERC721");
const { expectRevert } = require('@openzeppelin/test-helpers');

const chai = require("./setupchai.js");
const BN =web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "../.env"});

contract("Pool Tracker", async (accounts) => {

    const [validator, depositor, owner, receiver] = accounts;
    beforeEach(async() => {
        this.testToken = await TestToken.new();
        this.testToken_2 = await TestToken.new();
        this.notApprovedToken = await TestToken.new();
        this.aToken = await aTestToken.new();
        this.poolMock = await PoolMock.new();
        await this.poolMock.setTestTokens(this.aToken.address, this.testToken.address, this.testToken_2.address, {from: validator});

        this.poolAddressesProviderMock = await PoolAddressesProviderMock.new();
        await this.poolAddressesProviderMock.setPoolImpl(this.poolMock.address, {from: validator});

        const poolAddressesProviderAddr = this.poolAddressesProviderMock.address;
        const wethGatewayAddr = "0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17";
        this.poolTracker = await PoolTracker.new(poolAddressesProviderAddr, wethGatewayAddr);
        this.jCDepositorERC721 = await JCDepositorERC721.at(await this.poolTracker.getDepositorERC721Address());
        this.jCOwnerERC721 = await JCOwnerERC721.at(await this.poolTracker.getOwnerERC721Address());

        this.INTEREST = "1000000000000000000";
    });

    it("pools created by validator should be added to verified pools", async() => {
        const startPoolsLength = (await this.poolTracker.getVerifiedPools()).length;
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator});
        assert.equal(startPoolsLength + 1, (await this.poolTracker.getVerifiedPools()).length, "The pool created by validator was not added to verified list");
    });

    it("should transfer each Owner an nft on pool creation", async() => {
        const startPoolsLength = (await this.poolTracker.getVerifiedPools()).length;

        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator});
        assert.equal(await this.jCOwnerERC721.balanceOf(receiver), 1, "owner nft balance not equal to 1");
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

        const aTokenBalance = web3.utils.toBN(depositAmount).add(web3.utils.toBN(this.INTEREST)).toString();
        const checkAmount = (await this.aToken.balanceOf(knownAddress)).toString();
        assert.strictEqual(aTokenBalance, checkAmount, "atoken not updated");
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
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await expectRevert(
            this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor}),
            "sender not approved"
        );
    });
    it("add deposit sends nft to depositor", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        assert.equal(await this.jCDepositorERC721.balanceOf(depositor), 1, "balance not equal to 1");
    });
    it("add deposit updates tvl", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const origTVL = await this.poolTracker.getTVL(this.testToken.address);
        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const newTVL = await this.poolTracker.getTVL(this.testToken.address);

        const valueString = origTVL.add(web3.utils.toBN(depositAmount)).toString();
        assert.strictEqual(valueString, newTVL.toString(), "tvl not updated");
    });
    it("withdrawDeposit reverts when _pool parameter is not a pool", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        await expectRevert(
            this.poolTracker.withdrawDeposit(depositAmount, this.testToken.address, owner, false, {from: depositor}),
            "not pool"
        );
    });
    it("withdrawDeposit withdraws _amount from JustCause pool", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        assert.equal(await this.testToken.balanceOf(depositor), 0, "testToken balance not equal to 0");

        await this.poolTracker.withdrawDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        assert.equal(await this.testToken.balanceOf(depositor), depositAmount, "testToken balance not equal to withdraw amount");
    });

    it("withdrawDeposit updates tvl", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        assert.equal(await this.testToken.balanceOf(depositor), 0, "testToken balance not equal to 0");

        const origTVL = await this.poolTracker.getTVL(this.testToken.address);
        await this.poolTracker.withdrawDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const newTVL = await this.poolTracker.getTVL(this.testToken.address);

        const valueString = origTVL.sub(web3.utils.toBN(depositAmount)).toString();
        assert.strictEqual(valueString, newTVL.toString(), "tvl not updated");
    });

    it("withdrawDeposit reverts if tvl overflows", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const overAmount = web3.utils.toWei("2", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, web3.utils.toWei("3", "ether"));
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const tokenId = await this.jCDepositorERC721.tokenOfOwnerByIndex(depositor, 0);
        const depositInfo = await this.jCDepositorERC721.getDepositInfo(tokenId);
        console.log('balance', depositInfo.balance, overAmount)
        await expectRevert(
            this.poolTracker.withdrawDeposit(overAmount, this.testToken.address, knownAddress, false, {from: depositor}),
            "Panic: Arithmetic overflow"
        );
    });

    it("claimInterest updates totalDonated", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        assert.equal(await this.testToken.balanceOf(depositor), 0, "testToken balance not equal to 0");

        const origDonated = await this.poolTracker.getTotalDonated(this.testToken.address);
        await this.poolTracker.claimInterest(this.testToken.address, knownAddress, false, {from: depositor});
        const newDonted = await this.poolTracker.getTotalDonated(this.testToken.address);

        const valueString = newDonted.sub(web3.utils.toBN(origDonated)).toString();
        assert.strictEqual(valueString, this.INTEREST, "tvl not updated");
    });

    it("claimInterest reverts when _pool parameter is not a pool", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        await expectRevert(
            this.poolTracker.claimInterest(this.aToken.address, owner, false, {from: depositor}),
            "not pool"
        );
    });

    it("claimInterest reverts when _asset is not accepted by aave", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await expectRevert(
            this.poolTracker.claimInterest(this.aToken.address, knownAddress, false, {from: depositor}),
            "token not approved"
        );
    });
});