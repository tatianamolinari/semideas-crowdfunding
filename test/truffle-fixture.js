const CrowdFundingCampaign = artifacts.require("CrowdFundingCampaign.sol");

module.exports = async () => {
    const ipfs_hash = "0x7465737415000400000000000000000000000000000000000000000000000000"
    const crowdFundingCampaign = await CrowdFundingCampaign.new( 5, 300, ipfs_hash);
    CrowdFundingCampaign.setAsDeployed(crowdFundingCampaign);
}