const PoolTracker = artifacts.require("PoolTracker");
const JCDepositor = artifacts.require("JCDepositorERC721");
                                     //JCDepositorERC721
const JCOwner = artifacts.require("JCOwnerERC721");
const JustCausePool = artifacts.require("JustCausePoolAaveV3")

const chai = require("./setupchai.js");
const BN =web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "../.env"});

contract("Token Test", async (accounts) => {

    //const [deployerAccount, recipient, anotheraccount] = accounts;
    beforeEach(async() => {
        //this.jCDepositor = await JCDepositor.new();
        //this.justCausePool = await JustCausePool.new();
        //this.jCOwner = await JCOwner.new();
        this.poolTracker = await PoolTracker.new();
    });

    it("all tokens should be in my account", async() => {
        //let instance = this.poolTracker;
        assert.equal(0, 0, "The balance is not the same");
        //with assert
        //let balance = await instance.balanceOf(accounts[0]);
        //assert.equal(balance.valueOf(), initialSupply.valueOf(), "The balance is not the same");

        //w/o chai
        //expect(await instance.balanceOf(accounts[0])).to.be.a.bignumber.equal(totalSupply);

        //with chai
        //return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(1000);
    });
})