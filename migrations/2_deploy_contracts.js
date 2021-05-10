var CrowdFundingCampaing = artifacts.require("CrowdFundingCampaing.sol");
//require("dotenv").config({ path: "../.env" });

module.exports = async function(deployer) {
    let addr = await web3.eth.getAccounts();
    let ipfs_hash = "0x7465737415000000000000000000000000000000000000000000000000000000"
    await deployer.deploy(CrowdFundingCampaing, 5, 300, ipfs_hash)
}