var CrowdFundingCampaingCRUD = artifacts.require("CrowdFundingCampaingCRUD");

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
    })

    const [authorAddress, memberAccount, anotherAccount] = accounts;

    it("Test campaing", async() => {


        return true;
    });

});