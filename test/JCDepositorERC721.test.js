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

contract("JCDepositorERC721", async (accounts) => {

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

        this.INTEREST = "1000000000000000000";
    });

    it("addFunds reverts if any address but PoolTracker calls it", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        await expectRevert(
            this.jCDepositorERC721.addFunds(depositor, depositAmount, 111, knownAddress, this.testToken.address, "metaInfo", {from: depositor}),
            "Ownable: caller is not the owner"
        );

    });

    it("jCDepositorERC721 instance should get liquidity index from Aave Pool", async() => {
        const liquidityIndex = 1234;
        assert.equal(await this.jCDepositorERC721.getAaveLiquidityIndex(this.testToken.address), liquidityIndex, "liquidity index is incorrect");
    });

    it("addFunds updates deposits", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, web3.utils.toWei("3", "ether"));
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const tokenId = await this.jCDepositorERC721.tokenOfOwnerByIndex(depositor, 0);
        const depositInfo = await this.jCDepositorERC721.getDepositInfo(tokenId);
        assert.strictEqual(depositInfo.balance, depositAmount, "balance not updated");
        assert.strictEqual(depositInfo.pool, knownAddress, "pool not updated");
        assert.strictEqual(depositInfo.asset, this.testToken.address, " not updated");
        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const newBalance = web3.utils.toBN(depositAmount).add(web3.utils.toBN(depositAmount)).toString();
        const balance = await this.jCDepositorERC721.getUserBalance(tokenId);
        assert.strictEqual(balance.toString(), newBalance, "balance not updated");
    });

    it("withdrawFunds reverts if tokenId does not exist", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, web3.utils.toWei("3", "ether"));
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        await expectRevert(
            this.poolTracker.withdrawDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: owner}),
            "tokenId doesn't exist"
        );
    });

    it("withdrawFunds reverts if balance is insufficient", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const overAmount = web3.utils.toWei("2", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");

        await this.testToken.mint(depositor, web3.utils.toWei("3", "ether"));
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});

        await this.testToken.mint(validator, web3.utils.toWei("3", "ether"));
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: validator});

        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        await this.poolTracker.addDeposit(overAmount, this.testToken.address, knownAddress, false, {from: validator});
        const tokenId = await this.jCDepositorERC721.tokenOfOwnerByIndex(depositor, 0);
        const depositInfo = await this.jCDepositorERC721.getDepositInfo(tokenId);
        await expectRevert(
            this.poolTracker.withdrawDeposit(overAmount, this.testToken.address, knownAddress, false, {from: depositor}),
            "insufficient balance"
        );
    });

    it("withdrawDeposit updates deposits", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const withdrawAmount = web3.utils.toWei("10000000", "gwei");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, web3.utils.toWei("3", "ether"));
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const tokenId = await this.jCDepositorERC721.tokenOfOwnerByIndex(depositor, 0);
        const origBalance = await this.jCDepositorERC721.getUserBalance(tokenId);
        await this.poolTracker.withdrawDeposit(withdrawAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const newBalance = await this.jCDepositorERC721.getUserBalance(tokenId);
        const valueString = web3.utils.toBN(newBalance).add(web3.utils.toBN(withdrawAmount)).toString();
        assert.strictEqual(valueString, origBalance.toString(), "balance not updated");
        await this.poolTracker.withdrawDeposit(newBalance, this.testToken.address, knownAddress, false, {from: depositor});
        const depositInfo = await this.jCDepositorERC721.getDepositInfo(tokenId);
        assert.strictEqual(depositInfo.timeStamp, "0", "timeStamp updated");
    });

    it("transferFrom reverts as token is non-transferrable", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const withdrawAmount = web3.utils.toWei("10000000", "gwei");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, web3.utils.toWei("3", "ether"));
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const tokenId = await this.jCDepositorERC721.tokenOfOwnerByIndex(depositor, 0);
        await expectRevert(
            this.jCDepositorERC721.transferFrom(depositor, owner, tokenId, {from: depositor}),
            "non-transferrable"
        );
    });
});