var CrowdFundingCampaingCRUD = artifacts.require("CrowdFundingCampaingCRUD");
var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing");

var chai = require('chai');

const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = chai.expect;

contract("CrowdFundingCampaing Test", async accounts => {

    beforeEach(async() => {
        let instanceCRUD = await CrowdFundingCampaingCRUD.deployed();
        const tx = await instanceCRUD.createCrowdFundingCampaing("Nombre campaña", 5, 500);
        const { logs } = tx;
        const log = logs[0];
        let campaingAdress = log.args._campaingAddress;
        console.log("Address campaing: " + campaingAdress);
        this.campaing = await CrowdFundingCampaing.at(campaingAdress);

    })

    const [authorAddress, memberAccount, anotherAccount] = accounts;

    it("Checking CrowdFunding Campaing values from scratch", async() => {
        let campaing = this.campaing

        expect(campaing).to.be.instanceof(CrowdFundingCampaing);

        expect(campaing.name()).to.eventually.be.equal("Nombre campaña");
        expect(campaing.minimunContribution()).to.eventually.be.a.bignumber.equal(5);
        expect(campaing.goal()).to.eventually.be.equal(500);
        expect(campaing.active()).to.eventually.be.equal(true);

        expect(campaing.proposals()).to.eventually.be.instanceof(Array);
        expect(campaing.proposals()).to.eventually.have.property('length', 0);

        expect(campaing.members()).to.eventually.be.instanceof(Array);
        expect(campaing.members()).to.eventually.have.property('length', 1);
        expect(campaing.membersCount()).to.eventually.be.equal(0);


    });

});