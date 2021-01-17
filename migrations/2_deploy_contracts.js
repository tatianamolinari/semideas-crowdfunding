var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing.sol");
var CrowdFoundingCampaingCRUD = artifacts.require("CrowdFoundingCampaingCRUD.sol");
//require("dotenv").config({ path: "../.env" });

module.exports = async function(deployer) {
    //let addr = await web3.eth.getAccounts();
    //await deployer.deploy(CrowdFundingCampaing);
    await deployer.deploy(CrowdFoundingCampaingCRUD);
    //let instance = await CrowdFundingCampaing.deployed();
    let instanceCRUD = await CrowdFoundingCampaingCRUD.deployed();
}