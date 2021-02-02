var CrowdFundingCampaingCRUD = artifacts.require("CrowdFundingCampaingCRUD");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("CrowdFundingCampaingCRUD Test", async accounts => {
    const [authorAddress, memberAccount, anotherAccount] = accounts;

    it("List of Campaings should be empty", async() => {
        let instanceCRUD = await CrowdFundingCampaingCRUD.deployed();
        let listOfCFC = await instanceCRUD.getListOfCFC();
        expect(listOfCFC).to.be.instanceof(Array);
        expect(listOfCFC).to.have.property('length', 0);
        return true;
    });

    it("Should can create a new CrowdFundingCamaping", async() => {
        let instanceCRUD = await CrowdFundingCampaingCRUD.deployed();
        expect(instanceCRUD.getListOfCFC()).to.eventually.be.empty;

        const tx = await instanceCRUD.createCrowdFundingCampaing("Nombre campaña", 5, 500);
        const { logs } = tx;
        expect(logs).to.be.an.instanceof(Array);
        expect(logs).to.have.property('length', 1)

        const log = logs[0];
        expect(log.event).to.equal('CampaingCreation');
        expect(log.args._manager).to.equal(authorAddress);
        //expect(log.args._campaingAddress).to.be.an.instanceOf(Address);

        expect(instanceCRUD.getListOfCFC()).not.to.eventually.be.empty;
        expect(instanceCRUD.getListOfCFC()).to.eventually.have.property('length', 1);

        return true;
    });

    it("Should can't create two CrowdFundingCamaping with same name", async() => {
        let instanceCRUD = await CrowdFundingCampaingCRUD.deployed();
        expect(instanceCRUD.getListOfCFC()).to.eventually.have.property('length', 1);

        await instanceCRUD.createCrowdFundingCampaing("Otro campaña", 5, 500);
        expect(instanceCRUD.getListOfCFC()).not.to.eventually.be.empty;
        expect(instanceCRUD.getListOfCFC()).to.eventually.have.property('length', 2);

        expect(instanceCRUD.createCrowdFundingCampaing("Otro campaña", 10, 1000)).to.eventually.be.rejected;
        expect(instanceCRUD.getListOfCFC()).to.eventually.have.property('length', 2);

        return true;
    });

});