var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing");

var chai = require('chai');

const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = chai.expect;

contract("CrowdFundingCampaing Test", async accounts => {
    const [authorAddress, memberAccount, anotherAccount] = accounts;

    it("Test campaing", async() => {
        let name = "Un nombre";
        let minimunContribution = 20;
        let goal = 200;
        let manager = authorAddress;
        await deployer.deploy(CrowdFundingCampaing, name, minimunContribution, goal, manager);
        let instance = await CrowdFundingCampaing.deployed();
        return true;
    });

});