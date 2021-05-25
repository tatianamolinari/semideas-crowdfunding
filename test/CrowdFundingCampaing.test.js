var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing");

//var chai = require('chai');
const { time } = require('openzeppelin-test-helpers');
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("CrowdFundingCampaing Test", async accounts => {

    const [authorAddress, memberAccount, anotherMemberAccount, recipientProposalAccount, noMemberAccount] = accounts;
    const proposalCreatedHash = "0x7465737400000000000000000000000000000000000000000000000000000000";

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
        expect(campaing.contribute({ from: authorAddress, value: web3.utils.toWei("10", "wei") })).to.eventually.be.rejectedWith("Sender is already a member.");


        return true;

    });

    it("The inversor should invest more than de minimun contribution", async() => {

        let campaing = this.campaing;
        expect(campaing.contribute({ from: memberAccount, value: web3.utils.toWei("2", "wei") })).to.eventually.be.rejectedWith("The contribution is insuficient");
        await time.advanceBlock()

        return true;

    });

    it("A not member should be able to contribute with more than minimun contribution and then be a member", async() => {
        let campaing = this.campaing;

        let notIsMember = await campaing.isMember(memberAccount);
        expect(notIsMember).to.be.equal(false);

        const tx = await campaing.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('newContribution'); 

        let nowIsMember = await campaing.isMember(memberAccount);
        expect(nowIsMember).to.be.equal(true);

        return true;

    });

    it("An already member should not be able to contribute", async() => {
        let campaing = this.campaing;

        let notIsMember = await campaing.isMember(memberAccount);
        expect(notIsMember).to.be.equal(true);

        expect(campaing.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") })).to.eventually.be.rejectedWith("Sender is already a member.");


        return true;

    });

    it("Can't set campaing active until reach the goal", async() => {

        let campaing = this.campaing;

        expect(campaing.status()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaing.setActive()).to.eventually.be.rejectedWith("The contributions are insufficient");


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


    it("Can't create a new proposal if the campaing is not ACTIVE", async() => {

        let campaing = this.campaing;

        expect(campaing.owner()).to.eventually.be.equal(authorAddress);
        expect(campaing.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaing.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        expect(campaing.createProposal(3, memberAccount, proposalCreatedHash)).to.eventually.be.rejectedWith("The campaing status is not active.");;
        expect(campaing.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));


        return true;

    });

    it("Only owner set campaing active", async() => {

        let campaing = this.campaing;

        expect(campaing.owner()).to.eventually.not.be.equal(memberAccount);
        expect(campaing.setActive({ from: memberAccount })).to.eventually.be.rejectedWith("Sender is not the owner.");

        return true;

    });

    it("Owner set campaing active", async() => {

        let campaing = this.campaing;

        expect(campaing.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        await campaing.setActive();

        expect(campaing.status()).to.eventually.be.a.bignumber.equal(new BN(3));

        return true;

    });


    it("Only the owner should be able to create proposals", async() => {

        let campaing = this.campaing;

        expect(campaing.owner()).to.eventually.not.be.equal(memberAccount);
        expect(campaing.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaing.createProposal(3, memberAccount, proposalCreatedHash, { from: memberAccount })).to.eventually.be.rejectedWith("Sender is not the owner.");
        expect(campaing.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("Owner creates a new proposal and a proposalCreated event is emited", async() => {

        let campaing = this.campaing;

        expect(campaing.owner()).to.eventually.be.equal(authorAddress);
        expect(campaing.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaing.createProposal(3, recipientProposalAccount, proposalCreatedHash);
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('proposalCreated');
        expect(log.args._ipfshash).to.equal(proposalCreatedHash);

        expect(campaing.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(1));

        let result = await campaing.getProposal(0);

        let recipient = result['0'];
        let value = result['1'];
        let approvalsCount = result['2'];
        let status = result['3'];

        expect(recipient).to.be.equal(recipientProposalAccount);
        expect(value).to.be.a.bignumber.equal(new BN(3));
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));
        expect(status).to.be.a.a.bignumber.equal(new BN(3));

        return true;

    });


    it("Only members can vote a proposal", async() => {

        let campaing = this.campaing;
        let i_proposal = 0

        let result = await campaing.getProposal(i_proposal);
        let approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaing.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaing.aproveProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        result = await campaing.getProposal(i_proposal);
        approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("Members vote a proposal", async() => {

        let campaing = this.campaing;
        let i_proposal = 0

        let result = await campaing.getProposal(i_proposal);
        let approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaing.isMember(memberAccount)).to.eventually.be.true;
        await campaing.aproveProposal(i_proposal, { from: memberAccount });

        result = await campaing.getProposal(i_proposal);
        approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        return true;

    });

    it("Member can not vote a proposal twice", async() => {

        let campaing = this.campaing;
        let i_proposal = 0

        let result = await campaing.getProposal(i_proposal);
        let approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaing.aproveProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejectedWith("The proposal has been already approved by the sender");;

        result = await campaing.getProposal(i_proposal);
        approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        return true;

    });

    it("Only members should be able to create destrcut proposals", async() => {

        let campaing = this.campaing;

        expect(campaing.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaing.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaing.createDestructProposal(proposalCreatedHash, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");
        expect(campaing.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("Member creates a destrcut proposal", async() => {

        let campaing = this.campaing;

        expect(campaing.isMember(memberAccount)).to.eventually.be.true;
        expect(campaing.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaing.createDestructProposal(proposalCreatedHash, { from: memberAccount });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('destructProposalCreated');
        expect(log.args._ipfshash).to.equal(proposalCreatedHash);

        expect(campaing.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(1));
        let result = await campaing.getDestuctProposal(0);

        let approvalsCount = result['0'];
        let status = result['1'];

        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));
        expect(status).to.be.a.a.bignumber.equal(new BN(3));

        return true;

    });

    it("Only members can vote a destrcut proposal", async() => {

        let campaing = this.campaing;
        let i_proposal = 0

        let result = await campaing.getDestuctProposal(i_proposal);
        let approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaing.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaing.aproveDestructProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        result = await campaing.getDestuctProposal(i_proposal);
        approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("Members vote a destrcut proposal", async() => {

        let campaing = this.campaing;
        let i_proposal = 0

        let result = await campaing.getDestuctProposal(i_proposal);
        let approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaing.isMember(anotherMemberAccount)).to.eventually.be.true;
        await campaing.aproveDestructProposal(i_proposal, { from: anotherMemberAccount });

        result = await campaing.getDestuctProposal(i_proposal);
        approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        return true;

    });

    it("Member can not vote a proposal twice", async() => {

        let campaing = this.campaing;
        let i_proposal = 0

        let result = await campaing.getDestuctProposal(i_proposal);
        let approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaing.aproveDestructProposal(i_proposal, { from: anotherMemberAccount })).to.eventually.be.rejectedWith("The proposal has been already approved by the sender");;

        result = await campaing.getDestuctProposal(i_proposal);
        approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        return true;

    });


});