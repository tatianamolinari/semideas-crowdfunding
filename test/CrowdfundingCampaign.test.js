const CrowdfundingCampaign = artifacts.require("CrowdfundingCampaign");

const { time } = require('openzeppelin-test-helpers');
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("CrowdfundingCampaign Test", async accounts => {

    const [authorAddress, memberAccount, otherMemberAccount, anotherMemberAccount, recipientProposalAccount, noMemberAccount] = accounts;
    const ipfs_hash = "0x7405837400000000000000000000000000000000000000000000000000000000";
    const proposalCreatedHash = "0x7465737400000000000000000000000000000000000000000000000000000000";
    const progressUpdateHash =  "0x2465737400000000000000000000000000000000000000000000000000000000";

    beforeEach(async() => {
        this.campaign = await CrowdfundingCampaign.deployed();
        this.campaignToClose = await CrowdfundingCampaign.new(5, 300, ipfs_hash);
        await this.campaignToClose.contribute({ from: memberAccount, value: web3.utils.toWei("130", "wei") });
        await this.campaignToClose.contribute({ from: anotherMemberAccount, value: web3.utils.toWei("130", "wei") });
        await this.campaignToClose.contribute({ from: otherMemberAccount, value: web3.utils.toWei("170", "wei") });
        await this.campaignToClose.setActive({ from: authorAddress });
    })

    it("Checking CrowdFunding Campaign values from scratch", async() => {
        const campaign = this.campaign;

        expect(campaign).to.be.instanceof(CrowdfundingCampaign);

        expect(campaign.minimunContribution()).to.eventually.be.a.bignumber.equal(new BN(5));
        expect(campaign.goal()).to.eventually.be.a.bignumber.equal(new BN(300));
        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.membersCount()).to.eventually.be.a.bignumber.equal(new BN(0));

    });

    it("Checking CrowdFunding Campaign values from method get campaign info", async() => {
        const campaign = this.campaign;
        const campaingInfo = await campaign.getCampaignInfo();

        const owner = campaingInfo['0'];
        const status = campaingInfo['1'];
        const goal = campaingInfo['2'];
        const minimunContribution = campaingInfo['3'];
        const membersCount = campaingInfo['4'];
        const finalContributions = campaingInfo['5'];
        const remainingContributions = campaingInfo['6'];

        expect(owner).to.be.equal(authorAddress);
        expect(status).to.be.a.bignumber.equal(new BN(0));
        expect(goal).to.be.a.bignumber.equal(new BN(300));
        expect(minimunContribution).to.be.a.bignumber.equal(new BN(5));
        expect(membersCount).to.be.a.bignumber.equal(new BN(0));
        expect(finalContributions).to.be.a.bignumber.equal(new BN(0));
        expect(remainingContributions).to.be.a.bignumber.equal(new BN(0));
    });

    it("The owner should not be able to be an inversor", async() => {

        const campaign = this.campaign;

        expect(campaign.owner()).to.eventually.be.equal(authorAddress);
        expect(campaign.contribute({ from: authorAddress, value: web3.utils.toWei("10", "wei") })).to.eventually.be.rejectedWith("Sender is already a member.");
    });

    it("The inversor should invest more than de minimun contribution", async() => {

        const campaign = this.campaign;
        expect(campaign.contribute({ from: memberAccount, value: web3.utils.toWei("2", "wei") })).to.eventually.be.rejectedWith("The contribution is insuficient");
        
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
        expect(log.event).to.equal('NewContribution'); 

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

        await campaign.contribute({ from: anotherMemberAccount, value: web3.utils.toWei("130", "wei") });
        await campaign.contribute({ from: otherMemberAccount, value: web3.utils.toWei("170", "wei") });

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
        const campaignBalance = await web3.eth.getBalance(campaign.address); 

        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaign.setActive();
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('ChangeStatusCampaign');

        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(1));
        expect(campaign.getFinalContributions()).to.eventually.be.a.bignumber.equal(campaignBalance); 
    });

    it("Owner creates a Progress Update", async() => {

        const campaign = this.campaign;

        const tx = await campaign.saveProgressUpdate(progressUpdateHash); //, { from: memberAccount });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('ProgressUpdate');
        expect(log.args._ipfshash).to.equal(progressUpdateHash);
    });

    it("Only owner creates a Progress Update, not members", async() => {

        const campaign = this.campaign;

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        expect(campaign.saveProgressUpdate(progressUpdateHash, { from: memberAccount })).to.eventually.be.rejectedWith("Sender is not the owner.");
    });

    it("Only the owner should be able to create proposals", async() => {

        const campaign = this.campaign;

        expect(campaign.owner()).to.eventually.not.be.equal(memberAccount);
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
        expect(campaign.createProposal(3, memberAccount, proposalCreatedHash, { from: memberAccount })).to.eventually.be.rejectedWith("Sender is not the owner.");
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));
    });

    it("Owner creates a new proposal and a ProposalCreated event is emited", async() => {

        const campaign = this.campaign;
        
        const lastTimeBlock = await time.latest();
        const limitDateExpected = new Date(lastTimeBlock.toNumber() * 1000);
        limitDateExpected.setDate(limitDateExpected.getDate() + 7);

        expect(campaign.owner()).to.eventually.be.equal(authorAddress);
        expect(campaign.getProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaign.createProposal(3, recipientProposalAccount, proposalCreatedHash);
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('ProposalCreated');
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
        expect(status).to.be.a.bignumber.equal(new BN(0));
        expect(diffMinutes).to.be.lessThan(1);
        expect(diffMinutes).to.be.greaterThan(0);
    });


    it("Only members can approve a proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.approveProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        const afterResult = await campaign.getProposal(i_proposal);
        const afterApprovalsCount = afterResult['2'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(0));
    });

    it("Before vote a destruct hasVotedProposal should be false", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        expect(campaign.hasVotedProposal(i_proposal, { from: memberAccount })).to.eventually.be.false;
    });

    it("Members can approve a proposal and a event ProposalVoted is emited", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;

        const tx = await campaign.approveProposal(i_proposal, { from: memberAccount });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('ProposalVoted');

        const afterResult = await campaign.getProposal(i_proposal);
        const afterApprovalsCount = afterResult['2'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Before vote a destruct hasVotedProposal should be true", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        expect(campaign.hasVotedProposal(i_proposal, { from: memberAccount })).to.eventually.be.true;
    });

    it("Member can not approve a proposal twice", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const approvalsCount = result['2'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaign.approveProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejectedWith("The proposal has been already voted by the sender");;

        const afterResult = await campaign.getProposal(i_proposal);
        const afterApprovalsCount = afterResult['2'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Only members can disapprove a proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const disapprovalsCount = result['3'];
        expect(disapprovalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.disapproveProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        const afterResult = await campaign.getProposal(i_proposal);
        const afterDisapprovalsCount = afterResult['3'];
        expect(afterDisapprovalsCount).to.be.a.bignumber.equal(new BN(0));
    });

    it("Members can disapprove a proposal and a event ProposalVoted is emited", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const disapprovalsCount = result['3'];
        expect(disapprovalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(anotherMemberAccount)).to.eventually.be.true;
        
        const tx = await campaign.disapproveProposal(i_proposal, { from: anotherMemberAccount });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('ProposalVoted');

        const afterResult = await campaign.getProposal(i_proposal);
        const afterDisapprovalsCount = afterResult['3'];
        expect(afterDisapprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Member can not disapprove a proposal twice", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const disapprovalsCount = result['3'];
        expect(disapprovalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaign.disapproveProposal(i_proposal, { from: anotherMemberAccount })).to.eventually.be.rejectedWith("The proposal has been already voted by the sender");

        const afterResult = await campaign.getProposal(i_proposal);
        const afterDisapprovalsCount = afterResult['3'];
        expect(afterDisapprovalsCount).to.be.a.bignumber.equal(new BN(1));
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

    it("Members can close a proposal after vote time is finish", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const status = result['4'];
        expect(status).to.be.a.a.bignumber.equal(new BN(0));

        await time.increase(604800);

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        await campaign.closeProposal(i_proposal, { from: memberAccount });

        const afterResult = await campaign.getProposal(i_proposal);

        const afterStatus = afterResult['4'];
        expect(afterStatus).to.be.a.a.bignumber.not.equal(new BN(0));
        
    });

    it("When a proposal has equal approvals and disapprovals votes the result at close should be status DISAPPROVED", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const afterResult = await campaign.getProposal(i_proposal);
        const afterStatus = afterResult['4'];
        expect(afterStatus).to.be.a.a.bignumber.equal(new BN(2));
    });

    it("When a proposal has more disapprovals than approvals votes the result at close should be status DISAPPROVED", async() => {

        const campaign = this.campaign;
        await campaign.createProposal(5, recipientProposalAccount, proposalCreatedHash);
        
        const i_proposal = 1
        await campaign.disapproveProposal(i_proposal, { from: anotherMemberAccount });
        await campaign.disapproveProposal(i_proposal, { from: otherMemberAccount });
        await campaign.approveProposal(i_proposal, { from: memberAccount });

        await time.increase(604800);
        
        await campaign.closeProposal(i_proposal, { from: memberAccount });
        const afterResult = await campaign.getProposal(i_proposal);

        const afterStatus = afterResult['4'];
        expect(afterStatus).to.be.a.a.bignumber.equal(new BN(2));
    });

    it("When a proposal has more approvals than disapprovals votes the result at close should be status APPROVED", async() => {

        const campaign = this.campaign;
        await campaign.createProposal(5, recipientProposalAccount, proposalCreatedHash);
        
        const i_proposal = 2
        await campaign.approveProposal(i_proposal, { from: anotherMemberAccount });
        await campaign.approveProposal(i_proposal, { from: otherMemberAccount });
        await campaign.disapproveProposal(i_proposal, { from: memberAccount });

        await time.increase(604800);
        
        await campaign.closeProposal(i_proposal, { from: memberAccount });
        const afterResult = await campaign.getProposal(i_proposal);

        const afterStatus = afterResult['4'];
        expect(afterStatus).to.be.a.a.bignumber.equal(new BN(1));
    });

    it("Member can not approve a proposal if it is not longer active", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const status = result['4'];
        expect(status).to.be.a.a.bignumber.equal(new BN(2));

        expect(campaign.approveProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejectedWith("The proposal is not longer active.");
    });

    it("Members can not close a proposal after it is closed", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const status = result['4'];
        expect(status).to.be.a.a.bignumber.equal(new BN(2));

        expect(campaign.approveProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejectedWith("The proposal is not longer active.");
        
    });

    it("Can not release a proposal it is not with status APPROVED", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const status = result['4'];
        expect(status).to.be.a.a.bignumber.equal(new BN(2));

        expect(campaign.release(i_proposal, { from: authorAddress })).to.eventually.be.rejectedWith("The proposal is not approved.");
        
    });

    it("Owner release a proposal and the status and banlance change", async() => {

        const campaign = this.campaign;
        const campaignBalance = await web3.eth.getBalance(campaign.address);
        const ownerBalance = await web3.eth.getBalance(authorAddress);

        const i_proposal = 2

        const result = await campaign.getProposal(i_proposal);
        const status = result['4'];
        expect(status).to.be.a.a.bignumber.equal(new BN(1));

        const tx = await campaign.release(i_proposal, { from: authorAddress });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('ProposalRelease');

        const aftercampaignBalance = await web3.eth.getBalance(campaign.address);
        //const afterOwnerBalance = await web3.eth.getBalance(authorAddress);

        expect(parseInt(aftercampaignBalance)).to.be.equal(parseInt(campaignBalance) - 5);
        
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
        
        const lastTimeBlock = await time.latest();
        const limitDateExpected = new Date(lastTimeBlock.toNumber() * 1000);
        limitDateExpected.setDate(limitDateExpected.getDate() + 7);

        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(0));

        const tx = await campaign.createDestructProposal(proposalCreatedHash, { from: authorAddress });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('DestructProposalCreated');
        expect(log.args._ipfshash).to.equal(proposalCreatedHash);

        expect(campaign.getDestructProposalsCount()).to.eventually.be.a.bignumber.equal(new BN(1));
        const result = await campaign.getDestructProposal(0);

        const approvalsCount = result['0'];
        const disapprovalsCount = result['1'];
        const status = result['2'];
        const limitTimestamp = result['3'];
        
        const limitDate = new Date(limitTimestamp.toNumber() * 1000);
        const diffTime = Math.abs(limitDate - limitDateExpected);
        const diffMinutes = diffTime / (1000*60);

        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));
        expect(disapprovalsCount).to.be.a.bignumber.equal(new BN(0));
        expect(status).to.be.a.a.bignumber.equal(new BN(0));
        expect(diffMinutes).to.be.lessThan(1);
        expect(diffMinutes).to.be.greaterThan(0);
    });

    it("Only members can vote a destruct proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestructProposal(i_proposal);
        const approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.aproveDestructProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        const afterResult = await campaign.getDestructProposal(i_proposal);
        const afterApprovalsCount = afterResult['0'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Before vote a destruct hasVotedDestructProposal should be false", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        expect(campaign.hasVotedDestructProposal(i_proposal, { from: memberAccount })).to.eventually.be.false;
    });

    it("Members vote a destruct proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestructProposal(i_proposal);
        const approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        await campaign.aproveDestructProposal(i_proposal, { from: memberAccount });

        const afterResult = await campaign.getDestructProposal(i_proposal);
        const afterApprovalsCount = afterResult['0'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(2));
    });

    it("After vote a destruct hasVotedDestructProposal should be true", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        expect(campaign.hasVotedDestructProposal(i_proposal, { from: memberAccount })).to.eventually.be.true;
    });

    it("Member can not approve a destruct proposal twice", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestructProposal(i_proposal);
        const approvalsCount = result['0'];
        expect(approvalsCount).to.be.a.bignumber.equal(new BN(2));

        expect(campaign.aproveDestructProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejectedWith("The destruct proposal has been already voted by the sender");;

        const afterResult = await campaign.getDestructProposal(i_proposal);
        const afterApprovalsCount = afterResult['0'];
        expect(afterApprovalsCount).to.be.a.bignumber.equal(new BN(2));
    });

    it("Only members can disapprove a destruct proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestructProposal(i_proposal);
        const disapprovalsCount = result['1'];
        expect(disapprovalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.disapproveDestructProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

        const afterResult = await campaign.getDestructProposal(i_proposal);
        const afterDisapprovalsCount = afterResult['1'];
        expect(afterDisapprovalsCount).to.be.a.bignumber.equal(new BN(0));
    });

    it("Members can disapprove a destruct proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestructProposal(i_proposal);
        const disapprovalsCount = result['1'];
        expect(disapprovalsCount).to.be.a.bignumber.equal(new BN(0));

        expect(campaign.isMember(anotherMemberAccount)).to.eventually.be.true;
        await campaign.disapproveDestructProposal(i_proposal, { from: anotherMemberAccount });

        const afterResult = await campaign.getDestructProposal(i_proposal);
        const afterDisapprovalsCount = afterResult['1'];
        expect(afterDisapprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Member can not disapprove a destruct proposal twice", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestructProposal(i_proposal);
        const disapprovalsCount = result['1'];
        expect(disapprovalsCount).to.be.a.bignumber.equal(new BN(1));

        expect(campaign.disapproveDestructProposal(i_proposal, { from: anotherMemberAccount })).to.eventually.be.rejectedWith("The destruct proposal has been already voted by the sender");

        const afterResult = await campaign.getDestructProposal(i_proposal);
        const afterDisapprovalsCount = afterResult['1'];
        expect(afterDisapprovalsCount).to.be.a.bignumber.equal(new BN(1));
    });

    it("Only members can close a destruct proposal", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.closeDestructProposal(i_proposal, { from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");
    });

    it("Members can not close a destruct proposal until vote time is finish", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        expect(campaign.closeDestructProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejectedWith("The destruct proposal is still open for voting");
    });

    it("Members can close a destruct proposal after vote time is finish", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestructProposal(i_proposal);
        const status = result['2'];
        expect(status).to.be.a.a.bignumber.equal(new BN(0));

        await time.increase(604800);

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;

        const tx = await campaign.closeDestructProposal(i_proposal, { from: memberAccount });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 2)

        expect(logs[0].event).to.equal('DestructProposalClosed');
        expect(logs[1].event).to.equal('ChangeStatusCampaign');

        const afterResult = await campaign.getDestructProposal(i_proposal);

        const afterStatus = afterResult['2'];
        expect(afterStatus).to.be.a.a.bignumber.not.equal(new BN(0));
        
    });

    it("When a destruct proposal has more approvals than disapprovals votes the result at close should be status APPROVED", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const afterResult = await campaign.getDestructProposal(i_proposal);
        const afterStatus = afterResult['2'];
        expect(afterStatus).to.be.a.a.bignumber.equal(new BN(1));
    });

    it("When a destruct proposal has more disapprovals than approvals votes the result at close should be status DISAPPROVED", async() => {

        const campaign = this.campaignToClose;
        await campaign.createDestructProposal(proposalCreatedHash, { from: memberAccount })
        
        const i_proposal = 0
        await campaign.disapproveDestructProposal(i_proposal, { from: anotherMemberAccount });
        await campaign.disapproveDestructProposal(i_proposal, { from: otherMemberAccount });

        await time.increase(604800);
        
        await campaign.closeDestructProposal(i_proposal, { from: memberAccount });
        const afterResult = await campaign.getDestructProposal(i_proposal);

        const afterStatus = afterResult['2'];
        expect(afterStatus).to.be.a.a.bignumber.equal(new BN(2));
    });

    it("When a destruct proposal has equal approvals and disapprovals votes the result at close should be status DISAPPROVED", async() => {

        const campaign = this.campaignToClose;
        await campaign.createDestructProposal(proposalCreatedHash, { from: memberAccount })
        
        const i_proposal = 0
        await campaign.disapproveDestructProposal(i_proposal, { from: anotherMemberAccount });

        await time.increase(604800);
        
        await campaign.closeDestructProposal(i_proposal, { from: memberAccount });
        const afterResult = await campaign.getDestructProposal(i_proposal);

        const afterStatus = afterResult['2'];
        expect(afterStatus).to.be.a.a.bignumber.equal(new BN(2));
    });

    it("Member can not approve a proposal if it is not longer active", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestructProposal(i_proposal);
        const status = result['2'];
        expect(status).to.be.a.a.bignumber.equal(new BN(1));

        expect(campaign.aproveDestructProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejected;
    });

    it("Members can not close a proposal after it is closed", async() => {

        const campaign = this.campaign;
        const i_proposal = 0

        const result = await campaign.getDestructProposal(i_proposal);
        const status = result['2'];
        expect(status).to.be.a.a.bignumber.equal(new BN(1));

        expect(campaign.closeDestructProposal(i_proposal, { from: memberAccount })).to.eventually.be.rejected;
        
    });

    it("When a destruct proposal close as APPROVED and the author is the owner the campaign should have status SUCESSFULL", async() => {

        const campaign = this.campaign;
        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(3));
    });

    it("When a destruct proposal close as APPROVED and the author is a member the campign should have status FAIL", async() => {

        const campaign = this.campaignToClose;
        await campaign.createDestructProposal(proposalCreatedHash, { from: memberAccount })
        
        const i_proposal = 0

        await time.increase(604800);
        
        await campaign.closeDestructProposal(i_proposal, { from: memberAccount });

        expect(campaign.status()).to.eventually.be.a.bignumber.equal(new BN(2));
    });

    it("All Members can withdraw its founds when a campaing is Closed (Member 1)", async() => {

        const campaign = this.campaign;

        expect(campaign.isMember(memberAccount)).to.eventually.be.true;
        const contributorBalance = await web3.eth.getBalance(memberAccount);
        const campaignBalance = await web3.eth.getBalance(campaign.address);

        const tx = await campaign.withdraw({ from: memberAccount });
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)
        expect(logs[0].event).to.equal('withdrawFounds');

        const afterContributorBalance = await web3.eth.getBalance(memberAccount);
        const afterCampaignBalance = await web3.eth.getBalance(campaign.address);

        expect(parseInt(afterContributorBalance)).to.be.greaterThanOrEqual(parseInt(contributorBalance) + 4);
        expect(parseInt(afterCampaignBalance)).to.be.equal(parseInt(campaignBalance) - 4);
      
        
    });

    it("All Members can withdraw its founds when a campaing is Closed (Member 2)", async() => {

        const campaign = this.campaign;

        expect(campaign.isMember(otherMemberAccount)).to.eventually.be.true;
        const contributorBalance = await web3.eth.getBalance(otherMemberAccount);
        const campaignBalance = await web3.eth.getBalance(campaign.address);

        const tx1 = await campaign.withdraw({ from: otherMemberAccount });
        const { logs } = tx1;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)
        expect(logs[0].event).to.equal('withdrawFounds');

        const afterContributorBalance = await web3.eth.getBalance(otherMemberAccount);
        const afterCampaignBalance = await web3.eth.getBalance(campaign.address);

        expect(parseInt(afterContributorBalance)).to.be.greaterThanOrEqual(parseInt(contributorBalance) + 167);
        expect(parseInt(afterCampaignBalance)).to.be.equal(parseInt(campaignBalance) - 167);       
        
    });

    it("All Members can withdraw its founds when a campaing is Closed (Member 3)", async() => {

        const campaign = this.campaign;

        expect(campaign.isMember(anotherMemberAccount)).to.eventually.be.true;
        const contributorBalance = await web3.eth.getBalance(anotherMemberAccount);
        const campaignBalance = await web3.eth.getBalance(campaign.address);


        const tx2 = await campaign.withdraw({ from: anotherMemberAccount });
        const { logs } = tx2;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)
        expect(logs[0].event).to.equal('withdrawFounds');

        const afterContributorBalance = await web3.eth.getBalance(anotherMemberAccount);
        const afterCampaignBalance = await web3.eth.getBalance(campaign.address);

        expect(parseInt(afterContributorBalance)).to.be.greaterThanOrEqual(parseInt(contributorBalance) + 127);
        expect(parseInt(afterCampaignBalance)).to.be.equal(parseInt(campaignBalance) - 127);  
        
    });

    it("Member should not be able to withdraw founds twice", async() => {

        const campaign = this.campaign;

        expect(campaign.isMember(anotherMemberAccount)).to.eventually.be.true;
        expect(campaign.withdraw({ from: anotherMemberAccount })).to.eventually.be.rejectedWith("Sender already withdraw his founds.");

    });

    it("Owner should not be able to withdraw founds", async() => {

        const campaign = this.campaign;

        expect(campaign.owner()).to.eventually.be.equal(authorAddress);
        expect(campaign.withdraw({ from: authorAddress })).to.eventually.be.rejectedWith("Sender is the owner.");

    });

    it("Not member should not be able to withdraw founds", async() => {

        const campaign = this.campaign;

        expect(campaign.isMember(noMemberAccount)).to.eventually.be.false;
        expect(campaign.withdraw({ from: noMemberAccount })).to.eventually.be.rejectedWith("Sender is not a member.");

    });


});