var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing.sol");
var CrowdFundingCampaingCRUD = artifacts.require("CrowdFundingCampaingCRUD.sol");
//require("dotenv").config({ path: "../.env" });

module.exports = async function(deployer) {
    let addr = await web3.eth.getAccounts();
    await deployer.deploy(CrowdFundingCampaingCRUD);
    await deployer.deploy(CrowdFundingCampaing, "Test campaña", 5, 300, addr[0])
}