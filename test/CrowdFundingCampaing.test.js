var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing");

//var chai = require('chai');
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("CrowdFundingCampaing Test", async accounts => {

    const [authorAddress, memberAccount, anotherMemberAccount] = accounts;
    beforeEach(async() => {
        this.campaing = await CrowdFundingCampaing.deployed();

    })

    it("Checking CrowdFunding Campaing values from scratch", async() => {
        let campaing = this.campaing;

        expect(campaing).to.be.instanceof(CrowdFundingCampaing);

        expect(campaing.minimunContribution()).to.eventually.be.a.bignumber.equal(new BN(5));
        expect(campaing.goal()).to.eventually.be.a.bignumber.equal(new BN(300));
        expect(campaing.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        expect(campaing.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaing.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaing.membersCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("The owner should not be able to be an inversor", async() => {

        let campaing = this.campaing;

        expect(campaing.owner()).to.eventually.be.equal(authorAddress);
        expect(campaing.contribute({ from: authorAddress, value: web3.utils.toWei("10", "wei") })).to.eventually.be.rejected;


        return true;

    });

    it("The inversor should invest more than de minimun contribution", async() => {

        let campaing = this.campaing;
        expect(campaing.contribute({ from: memberAccount, value: web3.utils.toWei("2", "wei") })).to.eventually.be.rejected;

        return true;

    });

    it("A not member should be able to contribute with more than minimun contribution and then be a member", async() => {
        let campaing = this.campaing;

        let notIsMember = await campaing.isMember(memberAccount);
        expect(notIsMember).to.be.equal(false);

        await campaing.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") });

        let nowIsMember = await campaing.isMember(memberAccount);
        expect(nowIsMember).to.be.equal(true);

        return true;

    });

    it("An already member should not be able to contribute", async() => {
        let campaing = this.campaing;

        let notIsMember = await campaing.isMember(memberAccount);
        expect(notIsMember).to.be.equal(true);

        expect(campaing.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") })).to.eventually.be.rejected;


        return true;

    });

    it("Can't set campaing active until reach the goal", async() => {

        let campaing = this.campaing;

        expect(campaing.status()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaing.setActive()).to.eventually.be.rejected;


        return true;

    });

    it("When a not member contributes should transfer the contribution to the campaing", async() => {
        let campaing = this.campaing;

        let campaingBalance = await web3.eth.getBalance(campaing.address);
        let contributorBalance = await web3.eth.getBalance(anotherMemberAccount);

        await campaing.contribute({ from: anotherMemberAccount, value: web3.utils.toWei("300", "wei") });

        let afterCampaingBalance = await web3.eth.getBalance(campaing.address);
        let afterContributorBalance = await web3.eth.getBalance(anotherMemberAccount);

        expect(parseInt(afterContributorBalance)).to.be.lessThan(parseInt(contributorBalance) - 300);
        expect(parseInt(afterCampaingBalance)).to.be.equal(parseInt(campaingBalance) + 300);


        return true;

    });

    it("Only the owner should be able to create proposals", async() => {

        let campaing = this.campaing;

        expect(campaing.owner()).to.eventually.not.be.equal(memberAccount);
        //expect(campaing.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") })).to.eventually.be.rejected;
        //expect(campaing.createProposal(3, memberAccount, "FaAf25MoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz");


        return true;

    });


});