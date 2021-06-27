const CrowdfundingCampaign = artifacts.require("CrowdfundingCampaign.sol");

module.exports = async () => {
    const ipfs_hash = "0x7465737415000400000000000000000000000000000000000000000000000000"
    const crowdfundingCampaign = await CrowdfundingCampaign.new( 5, 300, ipfs_hash);
    CrowdfundingCampaign.setAsDeployed(crowdfundingCampaign);
}