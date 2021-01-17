var CrowdFoundingCampaingCRUD = artifacts.require("CrowdFoundingCampaingCRUD");

var chai = require('chai');

const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = chai.expect;

contract("CrowdFoundingCampaingCRUD Test", async accounts => {
    const [autorAddress, memberAccount, anotherAccount] = accounts;

    it("List of Campaings should be empty", async() => {
        let instanceCRUD = await CrowdFoundingCampaingCRUD.deployed();
        let listOfCFC = await instanceCRUD.getListOfCFC();
        expect(listOfCFC).to.be.instanceof(Array);
        expect(listOfCFC.length).to.equal(0);;
        return true;
    });
});