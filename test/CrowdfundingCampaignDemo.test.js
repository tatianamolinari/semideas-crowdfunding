const CrowdfundingCampaignDemo = artifacts.require("CrowdfundingCampaignDemo");

const { time } = require('openzeppelin-test-helpers');
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("CrowdfundingCampaignDemo Test", async accounts => {

    const [authorAddress, memberAccount, otherMemberAccount, recipientProposalAccount] = accounts;
    const proposalCreatedHash = "0x7465737400000000000000000000000000000000000000000000000000000000";

    beforeEach(async() => {
        this.campaign = await CrowdfundingCampaignDemo.deployed();
    })


    it("When change limit time proposal the limit time should be 7 days earlier", async() => {

        const campaign = this.campaign;

        await campaign.contribute({ from: memberAccount, value: web3.utils.toWei("130", "wei") });
        await campaign.contribute({ from: otherMemberAccount, value: web3.utils.toWei("170", "wei") });
        await campaign.setActive({ from: authorAddress });

        const lastTimeBlock = await time.latest();
        const limitDateExpected = new Date(lastTimeBlock.toNumber() * 1000);
        limitDateExpected.setDate(limitDateExpected.getDate() + 7);
        
        const limitDateExpectedAfter = new Date(lastTimeBlock.toNumber() * 1000);

        await campaign.createProposal(5, recipientProposalAccount, proposalCreatedHash);
        
        const i_proposal = 0

        const result = await campaign.getProposal(i_proposal);
        const limitTimestamp = result['5'];
        
        const limitDate = new Date(limitTimestamp.toNumber() * 1000);
        const diffTime = Math.abs(limitDate - limitDateExpected);
        const diffMinutes = diffTime / (1000*60); 

        await campaign.changeLimitProposal(i_proposal);

        const resultAfter = await campaign.getProposal(i_proposal);
        const limitTimestampAfter = resultAfter['5'];
        
        const limitDateAfter = new Date(limitTimestampAfter.toNumber() * 1000);
        const diffTimeAfter = Math.abs(limitDateExpectedAfter - limitDateAfter);
        const diffMinutesAfter = diffTimeAfter / (1000*60); 

        expect(diffMinutes).to.be.lessThan(1);
        expect(diffMinutes).to.be.greaterThan(0);
        expect(diffMinutesAfter).to.be.lessThan(1);
        expect(diffMinutesAfter).to.be.greaterThan(0);

        
    });

    it("When change limit time close roposal the limit time should be 7 days earlier", async() => {

        const campaign = this.campaign;


        const lastTimeBlock = await time.latest();
        const limitDateExpected = new Date(lastTimeBlock.toNumber() * 1000);
        limitDateExpected.setDate(limitDateExpected.getDate() + 7);
        
        const limitDateExpectedAfter = new Date(lastTimeBlock.toNumber() * 1000);

        await campaign.createCloseProposal(proposalCreatedHash, { from: memberAccount });
        
        const i_proposal = 0

        const result = await campaign.getCloseProposal(i_proposal);
        const limitTimestamp = result['3'];
        
        const limitDate = new Date(limitTimestamp.toNumber() * 1000);
        const diffTime = Math.abs(limitDate - limitDateExpected);
        const diffMinutes = diffTime / (1000*60); 

        await campaign.changeLimitCloseProposal(i_proposal);

        const resultAfter = await campaign.getCloseProposal(i_proposal);
        const limitTimestampAfter = resultAfter['3'];
        
        const limitDateAfter = new Date(limitTimestampAfter.toNumber() * 1000);
        const diffTimeAfter = Math.abs(limitDateExpectedAfter - limitDateAfter);
        const diffMinutesAfter = diffTimeAfter / (1000*60); 

        expect(diffMinutes).to.be.lessThan(1);
        expect(diffMinutes).to.be.greaterThan(0);
        expect(diffMinutesAfter).to.be.lessThan(1);
        expect(diffMinutesAfter).to.be.greaterThan(0);

        
    });

    


});