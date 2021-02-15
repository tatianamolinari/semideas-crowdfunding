var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing");

//var chai = require('chai');
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("CrowdFundingCampaing Test", async accounts => {

    const [authorAddress, memberAccount, anotherAccount] = accounts;
    beforeEach(async() => {
        //let instanceCRUD = await CrowdFundingCampaingCRUD.deployed();
        //const tx = await instanceCRUD.createCrowdFundingCampaing("Test campaña", 5, 500);
        //const { logs } = tx;
        //const log = logs[0];
        //let campaingAdress = log.args._campaingAddress;
        //console.log("Address campaing: " + campaingAdress);
        this.campaing = await CrowdFundingCampaing.deployed(); //new("Test campaña", 5, 500, authorAddress) //.at(campaingAdress);

    })

    it("Checking CrowdFunding Campaing values from scratch", async() => {
        let campaing = this.campaing;

        expect(campaing).to.be.instanceof(CrowdFundingCampaing);

        expect(campaing.name()).to.eventually.be.equal("Test campaña");
        expect(campaing.minimunContribution()).to.eventually.be.a.bignumber.equal(new BN(5));
        expect(campaing.goal()).to.eventually.be.a.bignumber.equal(new BN(500));
        //expect(campaing.active()).to.eventually.be.equal(true);

        expect(campaing.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaing.membersCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("The manager should not be able to be an inversor", async() => {
        let campaing = this.campaing;

        expect(campaing.manager()).to.eventually.be.equal(authorAddress);
        expect(campaing.contribute({ from: authorAddress, value: web3.utils.toWei("10", "wei") })).to.eventually.be.rejected;


        return true;

    });

    it("The inversor should invest more than de minimun contribution", async() => {
        let campaing = this.campaing;
        expect(campaing.contribute({ from: memberAccount, value: web3.utils.toWei("2", "wei") })).to.eventually.be.rejected;
        return true;

    });

    it("A not member should be able to contribute", async() => {
        let campaing = this.campaing;

        let campaingBalance = await web3.eth.getBalance(campaing.address);
        let contributorBalance = await web3.eth.getBalance(memberAccount);

        await campaing.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") });

        let afterCampaingBalance = await web3.eth.getBalance(campaing.address);
        let afterContributorBalance = await web3.eth.getBalance(memberAccount);

        console.log(campaingBalance);
        console.log(contributorBalance);
        console.log(afterCampaingBalance);
        console.log(afterContributorBalance);

        expect(parseInt(afterContributorBalance)).to.be.lessThan(parseInt(contributorBalance) - 5);
        expect(parseInt(afterCampaingBalance)).to.be.equal(parseInt(campaingBalance) + 5);



        return true;

    });


});