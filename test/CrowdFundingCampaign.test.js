const CrowdFundingCampaign = artifacts.require("CrowdFundingCampaign");

//var chai = require('chai');
const { time } = require('openzeppelin-test-helpers');
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("CrowdFundingCampaign Test", async accounts => {

    const [authorAddress, memberAccount, anotherMemberAccount, recipientProposalAccount, noMemberAccount] = accounts;
    const proposalCreatedHash = "0x7465737400000000000000000000000000000000000000000000000000000000";
    const progressUpdateHash =  "0x2465737400000000000000000000000000000000000000000000000000000000";

    beforeEach(async() => {
        this.campaign = await CrowdFundingCampaign.deployed()
    })

    it("Checking CrowdFunding Campaign values from scratch", async() => {
        const campaign = this.campaign;

        expect(campaign).to.be.instanceof(CrowdFundingCampaign);

        expect(campaign.minimunContribution()).to.eventually.be.a.bignumber.equal(new BN(5));
        expect(campaign.goal()).to.eventually.be.a.bignumber.equal(new BN(300));
        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.membersCount()).to.eventually.be.a.bignumber.equal(new BN(0));
    });

    it("The owner should not be able to be an inversor", async() => {

        const campaign = this.campaign;

        expect(campaign.owner()).to.eventually.be.equal(authorAddress);
        expect(campaign.contribute({ from: authorAddress, value: web3.utils.toWei("10", "wei") })).to.eventually.be.rejectedWith("Sender is already a member.");
    });

    it("The inversor should invest more than de minimun contribution", async() => {

        const campaign = this.campaign;
        expect(campaign.contribute({ from: memberAccount, value: web3.utils.toWei("2", "wei") })).to.eventually.be.rejectedWith("The contribution is insuficient");
        await time.advanceBlock();
    });

    it("A not member should be able to contribute with more than minimun contribution and then be a member", async() => {
        const campaign = this.campaign;

        const notIsMember = await campaign.isMember(memberAccount);
        expect(notIsMember).to.be.equal(false);

        const tx = await campaign.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('newContribution'); 

        const nowIsMember = await campaign.isMember(memberAccount);
        expect(nowIsMember).to.be.equal(true);
    });

    it("An already member should not be able to contribute", async() => {
        const campaign = this.campaign;

        const notIsMember = await campaign.isMember(memberAccount);
        expect(notIsMember).to.be.equal(true);

        expect(campaign.contribute({ from: memberAccount, value: web3.utils.toWei("5", "wei") })).to.eventually.be.rejectedWith("Sender is already a member.");
    });

    it("Can't set campaign active until reach the goal", async() => {

        const campaign = this.campaign;

        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.setActive()).to.eventually.be.rejectedWith("The contributions are insufficient");
    });

    it("When a not member contributes should transfer the contribution to the campaign", async() => {
        const campaign = this.campaign;

        const campaignBalance = await web3.eth.getBalance(campaign.address);
        const contributorBalance = await web3.eth.getBalance(anotherMemberAccount);

        await campaign.contribute({ from: anotherMemberAccount, value: web3.utils.toWei("300", "wei") });

        const aftercampaignBalance = await web3.eth.getBalance(campaign.address);
        const afterContributorBalance = await web3.eth.getBalance(anotherMemberAccount);

        expect(parseInt(afterContributorBalance)).to.be.lessThanOrEqual(parseInt(contributorBalance) - 300);
        expect(parseInt(aftercampaignBalance)).to.be.equal(parseInt(campaignBalance) + 300);
    });


    it("Can't create a new proposal if the campaign is not ACTIVE", async() => {

        const campaign = this.campaign;

        expect(campaign.owner()).to.eventually.be.equal(authorAddress);
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        expect(campaign.createProposal(3, memberAccount, proposalCreatedHash)).to.eventually.be.rejectedWith("The campaign status is not active.");;
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
    });

    it("Only owner set campaign active", async() => {

        const campaign = this.campaign;

        expect(campaign.owner()).to.eventually.not.be.equal(memberAccount);
        expect(campaign.setActive({ from: memberAccount })).to.eventually.be.rejectedWith("Sender is not the owner.");
    });

    it("Owner set campaign active", async() => {

        const campaign = this.campaign; 

        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaign.setActive();
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('changeStatusCampaign');

        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(3));
    });


    it("Only the owner should be able to create proposals", async() => {

        const campaign = this.campaign;

        expect(campaign.owner()).to.eventually.not.be.equal(memberAccount);
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.createProposal(3, memberAccount, proposalCreatedHash, { from: memberAccount })).to.eventually.be.rejectedWith("Sender is not the owner.");
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
    });

    it("Owner creates a new proposal and a proposalCreated event is emited", async() => {

        const campaign = this.campaign;
        
        const limitDateExpected = new Date();
        limitDateExpected.setDate(limitDateExpected.getDate() + 7);

        expect(campaign.owner()).to.eventually.be.equal(authorAddress);
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaign.createProposal(3, recipientProposalAccount, proposalCreatedHash);
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('proposalCreated');
        expect(log.args._ipfshash).to.equal(proposalCreatedHash);

        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(1));

        const result = await campaign.getProposal(0);

        const recipient = result['0'];
        const value = result['1'];
        const approvalsCount = result['2'];
        const disapprovalsCount = result['3'];
        const status = result['4'];
        const limitTimestamp = result['5'];
        
        const limitDate = new Date(limitTimestamp.toNumber() * 1000);
        const diffTime = Math.abs(limitDate - limitDateExpected);
        const diffMinutes = diffTime / (1000*60); 


        expect(recipient).to.be.equal(recipientProposalAccount);
        expect(value).to.be.a.bignumber.equal(new BN(3));
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));
        expect(disapprovalsCount).to.be.a.bignumber.equal(new BN(0));
        expect(status).to.be.a.a.bignumber.equal(new BN(3));
        expect(diffMinutes).to.be.lessThan(1);
        expect(diffMinutes).to.be.greaterThan(0);
    });


    it("Only members can vote a proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.aproveProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        const afterResult = await campaign.getProposal(i_proposal);
        const afterApprovalsCount = afterResult['2'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(0));
    });

    it("Members vote a proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        await campaign.aproveProposal(i_proposal, { from: memberAccount });

        const afterResult = await campaign.getProposal(i_proposal);
        const afterApprovalsCount = afterResult['2'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Member can not vote a proposal twice", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaign.aproveProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejectedWith("The proposal has been already voted by the sender");;

        const afterResult = await campaign.getProposal(i_proposal);
        const afterApprovalsCount = afterResult['2'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Only members can close a proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.closeProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");
    });

    it("Members can not close a proposal until vote time is finish", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        expect(campaign.closeProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejectedWith("The proposal is still open for voting");
    });

    it("Only members should be able to create destruct proposals", async() => {

        const campaign = this.campaign;

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.createDestructProposal(proposalCreatedHash, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");
        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
    });

    it("Member creates a destruct proposal", async() => {

        const campaign = this.campaign;

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
        const result = await campaign.getDestuctProposal(0);

        const approvalsCount = result['0'];
        const status = result['1'];

        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));
        expect(status).to.be.a.a.bignumber.equal(new BN(3));
    });

    it("Only members can vote a destruct proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestuctProposal(i_proposal);
        const approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.aproveDestructProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        const afterResult = await campaign.getDestuctProposal(i_proposal);
        const afterApprovalsCount = afterResult['0'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(0));
    });

    it("Members vote a destruct proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestuctProposal(i_proposal);
        const approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(anotherMemberAccount)).to.eventually.be.true;
        await campaign.aproveDestructProposal(i_proposal, { from: anotherMemberAccount });

        const afterResult = await campaign.getDestuctProposal(i_proposal);
        const afterApprovalsCount = afterResult['0'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Member can not vote a destruct proposal twice", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestuctProposal(i_proposal);
        const approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaign.aproveDestructProposal(i_proposal, { from: anotherMemberAccount })).to.eventually.be.rejectedWith("The proposal has been already approved by the sender");;

        const afterResult = await campaign.getDestuctProposal(i_proposal);
        const afterApprovalsCount = afterResult['0'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Owner creates a Progress Update", async() => {

        const campaign = this.campaign;

        const tx = await campaign.saveProgressUpdate(progressUpdateHash); //, { from: memberAccount });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('progressUpdate');
        expect(log.args._ipfshash).to.equal(progressUpdateHash);
    });

    it("Only owner creates a Progress Update, not members", async() => {

        const campaign = this.campaign;

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        expect(campaign.saveProgressUpdate(progressUpdateHash, { from: memberAccount })).to.eventually.be.rejectedWith("Sender is not the owner.");
    });


});