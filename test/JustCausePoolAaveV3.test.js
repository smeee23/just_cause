const PoolTracker = artifacts.require("PoolTracker");
const PoolAddressesProviderMock = artifacts.require("PoolAddressesProviderMock");
const PoolMock = artifacts.require("PoolMock");
const TestToken = artifacts.require("TestToken");
const aTestToken = artifacts.require("aTestToken");
const JCDepositorERC721 = artifacts.require("JCDepositorERC721");
const JustCausePoolAaveV3 = artifacts.require("JustCausePoolAaveV3");
const WethGatewayTest = artifacts.require("WethGatewayTest");
const { expectRevert } = require('@openzeppelin/test-helpers');

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "../.env"});

contract("JustCausePoolAaveV3", async (accounts) => {

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
        
        this.INTEREST = "1000000000000000000";
        this.RESERVE_NORMALIZED_INCOME = "7755432354";
        this.LIQUIDITY_INDEX = "1234"
    });

    it("JustCausePoolAaveV3 reverts if initialize is called on base", async() => {
        const jCPool = await JustCausePoolAaveV3.at(await this.poolTracker.getBaseJCPoolAddress());
        const erc721Address = await jCPool.getERC721Address();
        await expectRevert(
            jCPool.initialize([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, this.poolMock.address, this.wethGateway.address, erc721Address, false, {from: validator}),
            "Cannot initialize base"
        );
    });

    it("JustCausePoolAaveV3 initialize cannot be called twice", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const erc721Address = await jCPool.getERC721Address();
        await expectRevert(
            jCPool.initialize([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, this.poolMock.address, this.wethGateway.address, erc721Address, false, {from: validator}),
            "Initializable: contract is already initialized"
        );
    });

    it("JustCausePoolAaveV3 initialize reverts if name is over 30 characters", async() => {
        const name = "Test Pool gpiorgjt uhoioi oioix";
        await expectRevert.assertion(
            this.poolTracker.createJCPoolClone([this.testToken.address], name, "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        );
    });

    it("JustCausePoolAaveV3 deposit can only be called from PoolTracker", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        await expectRevert(
            jCPool.deposit(this.testToken.address, 100000, {from: validator}),
            "not the owner"
        );
    });

    it("JustCausePoolAaveV3 deposit can only be with tokens accepted by JCPool", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken_2.mint(depositor, depositAmount);
        await this.testToken_2.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        await expectRevert(
            this.poolTracker.addDeposit(depositAmount, this.testToken_2.address, knownAddress, false, {from: depositor}),
            "token not accepted by jcpool"
        );
    });

    it("add deposit updates totalDeposits for that asset", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const origDeposit = (await jCPool.getTotalDeposits(this.testToken.address)).toString();

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const newDeposit = await jCPool.getTotalDeposits(this.testToken.address);

        const checkAmount = newDeposit.sub(web3.utils.toBN(depositAmount)).toString();
        assert.strictEqual(checkAmount, origDeposit, "totalDeposits not updated");
    });

    it("JustCausePoolAaveV3 withdraw can only be called from PoolTracker", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        await expectRevert(
            jCPool.withdraw(this.testToken.address, 100000, validator, false, {from: validator}),
            "not the owner"
        );
    });

    it("JustCausePoolAaveV3 withdraw updates totalDeposits", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("2", "ether");
        const withdrawAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        await this.poolTracker.withdrawDeposit(withdrawAmount, this.testToken.address, knownAddress, false, {from: depositor});

        const newDeposit = await jCPool.getTotalDeposits(this.testToken.address);
        const checkAmount = web3.utils.toBN(depositAmount).sub(web3.utils.toBN(withdrawAmount)).toString();

        assert.strictEqual(newDeposit.toString(), checkAmount, "totalDeposits not updated");
    });

    it("JustCausePoolAaveV3 withdrawDonations can only be called from PoolTracker", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        await expectRevert(
            jCPool.withdrawDonations(this.testToken.address, false, {from: validator}),
            "not the owner"
        );
    });

    it("JustCausePoolAaveV3 withdrawDonations updates interestEarned", async() => {
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

        const jCPool = await JustCausePoolAaveV3.at(knownAddress);

        const newDonted = await this.poolTracker.getTotalDonated(this.testToken.address);

        const valueString = newDonted.sub(web3.utils.toBN(origDonated)).toString();
        assert.strictEqual(valueString, this.INTEREST, "tvl not updated");
    });

    it("JustCausePoolAaveV3 withdrawDonations sends donations to receiver", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        assert.equal(await this.testToken.balanceOf(depositor), 0, "testToken balance not equal to 0");

        await this.poolTracker.claimInterest(this.testToken.address, knownAddress, false, {from: depositor});
        const receiverBalance = await this.testToken.balanceOf(receiver);
        assert.strictEqual(receiverBalance.toString(), this.INTEREST, "receiver did not receive donations");
    });

    it("JustCausePoolAaveV3 getAcceptedTokens returns accepted tokens", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const acceptedTokens = await jCPool.getAcceptedTokens();
        assert.isTrue(acceptedTokens.includes(this.testToken.address), "token not in list");
        assert.isTrue(acceptedTokens.includes(this.testToken_2.address), "token not in list");
    });

    it("JustCausePoolAaveV3 getName returns name", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator})
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const name = await jCPool.getName();
        assert.strictEqual(name, "Test Pool", "name incorrect");
    });

    it("JustCausePoolAaveV3 getAbout returns about", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const about = await jCPool.getAbout();
        assert.strictEqual(about, "ABOUT_HASH", "about hash incorrect");
    });

    it("JustCausePoolAaveV3 getPicHash returns about", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const picHash = await jCPool.getPicHash();
        assert.strictEqual(picHash, "picHash", "pic hash incorrect");
    });

    it("JustCausePoolAaveV3 getMetaUri returns metaUri", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const metaUri = await jCPool.getMetaUri();
        assert.strictEqual(metaUri, "metaUri", "metaUri hash incorrect");
    });

    it("JustCausePoolAaveV3 getIsVerified returns true if validator creates", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: validator});
        const knownAddress = (await this.poolTracker.getVerifiedPools())[0];
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const isVerified = await jCPool.getIsVerified();
        assert.isTrue(isVerified, "pool is not verified");
    });

    it("JustCausePoolAaveV3 getIsVerified returns false if other than validator creates", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const isVerified = await jCPool.getIsVerified();
        assert.isTrue((!isVerified), "pool is not verified");
    });

    it("JustCausePoolAaveV3 getRecipient returns receiver", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const receiverCheck = await jCPool.getRecipient();
        assert.equal(receiverCheck, receiver, "receiver is not correct");
    });

    it("JustCausePoolAaveV3 getPoolInfo returns all of the above pool info", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const poolInfo = await jCPool.getPoolInfo();

        const acceptedTokens = poolInfo[0];
        assert.isTrue(acceptedTokens.includes(this.testToken.address), "token not in list");

        const receiverCheck = poolInfo[1];
        assert.equal(receiverCheck, receiver, "receiver is not correct");

        const isVerified = poolInfo[2];
        assert.isTrue((!isVerified), "pool is not verified");

        const metaUri = poolInfo[3];
        assert.strictEqual(metaUri, "metaUri", "metaUri hash incorrect");

        const picHash = poolInfo[4];
        assert.strictEqual(picHash, "picHash", "pic hash incorrect");

        const about = poolInfo[5];
        assert.strictEqual(about, "ABOUT_HASH", "about hash incorrect");

        const name = poolInfo[6];
        assert.strictEqual(name, "Test Pool", "name incorrect");
    });


    it("JustCausePoolAaveV3 getATokenAddress returns the aTokenAddress", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const aTokenAddress = await jCPool.getATokenAddress(this.testToken.address);
        assert.equal(aTokenAddress, this.aToken.address, "receiver is not correct");
    });

    it("JustCausePoolAaveV3 getTotalDeposits returns the total deposits", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        let totalDeposits = (await jCPool.getTotalDeposits(this.testToken.address)).toString();
        assert.strictEqual(totalDeposits, "0", "total deposits is not 0 to start");

        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        totalDeposits = (await jCPool.getTotalDeposits(this.testToken.address)).toString();
        assert.strictEqual(totalDeposits, depositAmount.toString(), "total deposits is not updated");
    });

    it("JustCausePoolAaveV3 getUnclaimedInterest returns the unclaimed interest", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        let unclaimed = (await jCPool.getUnclaimedInterest(this.testToken.address)).toString();
        assert.strictEqual(unclaimed, "0", "unclaimed interest is not 0 to start");

        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        unclaimed = (await jCPool.getUnclaimedInterest(this.testToken.address)).toString();
        assert.strictEqual(unclaimed, this.INTEREST, "unclaimed interest is not updated");
    });

    it("JustCausePoolAaveV3 getClaimedInterest returns the claimed interest", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        let claimed = (await jCPool.getClaimedInterest(this.testToken.address)).toString();
        assert.strictEqual(claimed, "0", "claimed interest is not 0 to start");

        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        await this.poolTracker.claimInterest(this.testToken.address, knownAddress, false, {from: depositor});

        claimed = (await jCPool.getClaimedInterest(this.testToken.address)).toString();
        assert.strictEqual(claimed, this.INTEREST, "claimed interest is not updated");
    });

    it("JustCausePoolAaveV3 getATokenBalance returns the aToken balance", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        let aTokenBalance = (await jCPool.getATokenBalance(this.testToken.address)).toString();
        assert.strictEqual(aTokenBalance, "0", "unclaimed interest is not 0 to start");

        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});
        const balanceCheck = (await this.aToken.balanceOf(knownAddress)).toString();
        aTokenBalance = (await jCPool.getATokenBalance(this.testToken.address)).toString();
        assert.strictEqual(aTokenBalance, balanceCheck, "claimed interest is not updated");
    });

    it("JustCausePoolAaveV3 getReserveNormalizedIncome returns the aTokenAddress", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const reserveNormalizedIncome = await jCPool.getReserveNormalizedIncome(this.testToken.address);
        assert.strictEqual(this.RESERVE_NORMALIZED_INCOME, reserveNormalizedIncome.toString(), "reserveNormalizedIncome is incorrect");
    });

    it("JustCausePoolAaveV3 getAaveLiquidityIndex returns the aTokenAddress", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address, this.testToken_2.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);
        const liquidityIndex = await jCPool.getAaveLiquidityIndex(this.testToken.address);
        assert.strictEqual(this.LIQUIDITY_INDEX, liquidityIndex.toString(), "reserveNormalizedIncome is incorrect");
    });

    it("JustCausePoolAaveV3 getPoolTokenInfo returns above pool token info from for asset", async() => {
        await this.poolTracker.createJCPoolClone([this.testToken.address], "Test Pool", "ABOUT_HASH", "picHash", "metaUri", receiver, {from: owner});
        const knownAddress = await this.poolTracker.getAddressFromName("Test Pool");
        const jCPool = await JustCausePoolAaveV3.at(knownAddress);

        const depositAmount = web3.utils.toWei("1", "ether");
        const approveAmount = web3.utils.toWei("1000000", "ether");
        await this.testToken.mint(depositor, depositAmount);
        await this.testToken.approve(this.poolTracker.address, approveAmount, {from: depositor});

        await this.poolTracker.addDeposit(depositAmount, this.testToken.address, knownAddress, false, {from: depositor});

        let poolTokenInfo = await jCPool.getPoolTokenInfo(this.testToken.address);

        const balanceCheck = (await this.aToken.balanceOf(knownAddress)).toString();
        aTokenBalance = poolTokenInfo[2].toString();
        assert.strictEqual(aTokenBalance, balanceCheck, "atoken balance is not updated");

        const unclaimed = poolTokenInfo[4].toString();
        assert.strictEqual(unclaimed, this.INTEREST, "unclaimed interest is not updated");

        const totalDeposits = poolTokenInfo[5].toString();
        assert.strictEqual(totalDeposits, depositAmount.toString(), "total deposits is not updated");

        await this.poolTracker.claimInterest(this.testToken.address, knownAddress, false, {from: depositor});

        poolTokenInfo = await jCPool.getPoolTokenInfo(this.testToken.address);

        const claimed = poolTokenInfo[3].toString();;
        assert.strictEqual(claimed, this.INTEREST, "claimed interest is not updated");

        const liquidityIndex = poolTokenInfo[0].toString();
        assert.strictEqual(this.LIQUIDITY_INDEX, liquidityIndex, "reserveNormalizedIncome is incorrect");

        const reserveNormalizedIncome = poolTokenInfo[1].toString();
        assert.strictEqual(this.RESERVE_NORMALIZED_INCOME, reserveNormalizedIncome.toString(), "reserveNormalizedIncome is incorrect");

        const aTokenAddress = poolTokenInfo[6].toString();
        assert.equal(aTokenAddress, this.aToken.address, "receiver is not correct");

    });
});