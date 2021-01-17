var CrowdFundingCampaingCRUD = artifacts.require("CrowdFundingCampaingCRUD");
var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing");

var chai = require('chai');

const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = chai.expect;

contract("CrowdFundingCampaingCRUD Test", async accounts => {
    const [autorAddress, memberAccount, anotherAccount] = accounts;

    it("List of Campaings should be empty", async() => {
        let instanceCRUD = await CrowdFundingCampaingCRUD.deployed();
        let listOfCFC = await instanceCRUD.getListOfCFC();
        expect(listOfCFC).to.be.instanceof(Array);
        expect(listOfCFC.length).to.equal(0);;
        return true;
    });

    it("Should can create a new CrowdFundingCamaping", async() => {
        let instanceCRUD = await CrowdFundingCampaingCRUD.deployed();
        expect(instanceCRUD.getListOfCFC()).to.eventually.be.empty;

        instanceCRUD.createCrowdFundingCampaing("Nombre campaña", 5, 500);
        expect(instanceCRUD.getListOfCFC()).not.to.eventually.be.empty;

        return true;
    });
});