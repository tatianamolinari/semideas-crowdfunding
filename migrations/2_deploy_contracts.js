var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing.sol");
//require("dotenv").config({ path: "../.env" });

module.exports = async function(deployer) {
    let addr = await web3.eth.getAccounts();
    await deployer.deploy(CrowdFundingCampaing, 5, 300, "0xQmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz")
}