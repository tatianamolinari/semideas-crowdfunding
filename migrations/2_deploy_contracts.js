var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing.sol");
var CrowdFundingCampaingCRUD = artifacts.require("CrowdFundingCampaingCRUD.sol");
//require("dotenv").config({ path: "../.env" });

module.exports = async function(deployer) {
    //let addr = await web3.eth.getAccounts();
    //await deployer.deploy(CrowdFundingCampaing);
    await deployer.deploy(CrowdFundingCampaingCRUD);
    //let instance = await CrowdFundingCampaing.deployed();
    let instanceCRUD = await CrowdFundingCampaingCRUD.deployed();
}