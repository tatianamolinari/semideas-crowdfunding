const CrowdfundingCampaign = artifacts.require("CrowdfundingCampaign.sol");
const CrowdfundingCampaignDemo = artifacts.require("CrowdfundingCampaignDemo.sol");
const Migrations = artifacts.require("Migrations.sol");

module.exports = async () => {
    const ipfs_hash = "0x7465737415000400000000000000000000000000000000000000000000000000"
    
    const crowdfundingCampaign = await CrowdfundingCampaign.new( 5, 300, ipfs_hash);
    CrowdfundingCampaign.setAsDeployed(crowdfundingCampaign);

    const crowdfundingCampaignDemo = await CrowdfundingCampaignDemo.new( 5, 255, ipfs_hash);
    CrowdfundingCampaignDemo.setAsDeployed(crowdfundingCampaignDemo);

    const migrations = await Migrations.new();
    Migrations.setAsDeployed(migrations);
}