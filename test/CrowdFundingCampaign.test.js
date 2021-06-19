const CrowdFundingCampaign = artifacts.require("CrowdFundingCampaign");

//var chai = require('chai');
const { time } = require('openzeppelin-test-helpers');
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("CrowdFundingCampaign Test", async accounts => {

    const [authorAddress, memberAccount, anotherMemberAccount, recipientProposalAccount, noMemberAccount] = accounts;
    const proposalCreatedHash = "0x7465737400000000000000000000000000000000000000000000000000000000";

    beforeEach(async() => {
        this.campaign = await CrowdFundingCampaign.deployed()
    })

    it("Checking CrowdFunding Campaign values from scratch", async() => {
        let campaign = this.campaign;

        expect(campaign).to.be.instanceof(CrowdFundingCampaign);

        expect(campaign.minimunContribution()).to.eventually.be.a.bignumber.equal(new BN(5));
        expect(campaign.goal()).to.eventually.be.a.bignumber.equal(new BN(300));
        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.membersCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("The owner should not be able to be an inversor", async() => {

        let campaign = this.campaign;

        expect(campaign.owner()).to.eventually.be.equal(authorAddress);
        expect(campaign.contribute({ from: authorAddress, value: web3.utils.toWei("10", "wei") })).to.eventually.be.rejectedWith("Sender is already a member.");


        return true;

    });

    it("The inversor should invest more than de minimun contribution", async() => {

        let campaign = this.campaign;
        expect(campaign.contribute({ from: memberAccount, value: web3.utils.toWei("2", "wei") })).to.eventually.be.rejectedWith("The contribution is insuficient");
        await time.advanceBlock();

        return true;

    });

    it("A not member should be able to contribute with more than minimun contribution and then be a member", async() => {
        let campaign = this.campaign;

        let notIsMember = await campaign.isMember(memberAccount);
        expect(notIsMember).to.be.equal(false);

        const tx = await campaign.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('newContribution'); 

        let nowIsMember = await campaign.isMember(memberAccount);
        expect(nowIsMember).to.be.equal(true);

        return true;

    });

    it("An already member should not be able to contribute", async() => {
        let campaign = this.campaign;

        let notIsMember = await campaign.isMember(memberAccount);
        expect(notIsMember).to.be.equal(true);

        expect(campaign.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") })).to.eventually.be.rejectedWith("Sender is already a member.");


        return true;

    });

    it("Can't set campaign active until reach the goal", async() => {

        let campaign = this.campaign;

        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.setActive()).to.eventually.be.rejectedWith("The contributions are insufficient");


        return true;

    });

    it("When a not member contributes should transfer the contribution to the campaign", async() => {
        let campaign = this.campaign;

        let campaignBalance = await web3.eth.getBalance(campaign.address);
        let contributorBalance = await web3.eth.getBalance(anotherMemberAccount);

        await campaign.contribute({ from: anotherMemberAccount, value: web3.utils.toWei("300", "wei") });

        let aftercampaignBalance = await web3.eth.getBalance(campaign.address);
        let afterContributorBalance = await web3.eth.getBalance(anotherMemberAccount);

        expect(parseInt(afterContributorBalance)).to.be.lessThanOrEqual(parseInt(contributorBalance) - 300);
        expect(parseInt(aftercampaignBalance)).to.be.equal(parseInt(campaignBalance) + 300);


        return true;

    });


    it("Can't create a new proposal if the campaign is not ACTIVE", async() => {

        let campaign = this.campaign;

        expect(campaign.owner()).to.eventually.be.equal(authorAddress);
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        expect(campaign.createProposal(3, memberAccount, proposalCreatedHash)).to.eventually.be.rejectedWith("The campaign status is not active.");;
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));


        return true;

    });

    it("Only owner set campaign active", async() => {

        let campaign = this.campaign;

        expect(campaign.owner()).to.eventually.not.be.equal(memberAccount);
        expect(campaign.setActive({ from: memberAccount })).to.eventually.be.rejectedWith("Sender is not the owner.");

        return true;

    });

    it("Owner set campaign active", async() => {

        let campaign = this.campaign; 

        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaign.setActive();
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('changeStatusCampaign');

        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(3));

        return true;

    });


    it("Only the owner should be able to create proposals", async() => {

        let campaign = this.campaign;

        expect(campaign.owner()).to.eventually.not.be.equal(memberAccount);
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.createProposal(3, memberAccount, proposalCreatedHash, { from: memberAccount })).to.eventually.be.rejectedWith("Sender is not the owner.");
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("Owner creates a new proposal and a proposalCreated event is emited", async() => {

        let campaign = this.campaign;

        expect(campaign.owner()).to.eventually.be.equal(authorAddress);
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaign.createProposal(3, recipientProposalAccount, proposalCreatedHash);
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('proposalCreated');
        expect(log.args._ipfshash).to.equal(proposalCreatedHash);

        console.log(log.args._ipfshash);
        console.log(proposalCreatedHash);

        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(1));

        let result = await campaign.getProposal(0);

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

        let campaign = this.campaign;
        let i_proposal = 0

        let result = await campaign.getProposal(i_proposal);
        let approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.aproveProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        result = await campaign.getProposal(i_proposal);
        approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("Members vote a proposal", async() => {

        let campaign = this.campaign;
        let i_proposal = 0

        let result = await campaign.getProposal(i_proposal);
        let approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        await campaign.aproveProposal(i_proposal, { from: memberAccount });

        result = await campaign.getProposal(i_proposal);
        approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        return true;

    });

    it("Member can not vote a proposal twice", async() => {

        let campaign = this.campaign;
        let i_proposal = 0

        let result = await campaign.getProposal(i_proposal);
        let approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaign.aproveProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejectedWith("The proposal has been already approved by the sender");;

        result = await campaign.getProposal(i_proposal);
        approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        return true;

    });

    it("Only members should be able to create destrcut proposals", async() => {

        let campaign = this.campaign;

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.createDestructProposal(proposalCreatedHash, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");
        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("Member creates a destrcut proposal", async() => {

        let campaign = this.campaign;

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaign.createDestructProposal(proposalCreatedHash, { from: memberAccount });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('destructProposalCreated');
        expect(log.args._ipfshash).to.equal(proposalCreatedHash);

        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(1));
        let result = await campaign.getDestuctProposal(0);

        let approvalsCount = result['0'];
        let status = result['1'];

        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));
        expect(status).to.be.a.a.bignumber.equal(new BN(3));

        return true;

    });

    it("Only members can vote a destrcut proposal", async() => {

        let campaign = this.campaign;
        let i_proposal = 0

        let result = await campaign.getDestuctProposal(i_proposal);
        let approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.aproveDestructProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        result = await campaign.getDestuctProposal(i_proposal);
        approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        return true;

    });

    it("Members vote a destrcut proposal", async() => {

        let campaign = this.campaign;
        let i_proposal = 0

        let result = await campaign.getDestuctProposal(i_proposal);
        let approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(anotherMemberAccount)).to.eventually.be.true;
        await campaign.aproveDestructProposal(i_proposal, { from: anotherMemberAccount });

        result = await campaign.getDestuctProposal(i_proposal);
        approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        return true;

    });

    it("Member can not vote a proposal twice", async() => {

        let campaign = this.campaign;
        let i_proposal = 0

        let result = await campaign.getDestuctProposal(i_proposal);
        let approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaign.aproveDestructProposal(i_proposal, { from: anotherMemberAccount })).to.eventually.be.rejectedWith("The proposal has been already approved by the sender");;

        result = await campaign.getDestuctProposal(i_proposal);
        approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        return true;

    });


});