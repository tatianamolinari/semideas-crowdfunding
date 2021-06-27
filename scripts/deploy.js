
const hre = require("hardhat");

async function main() {

    const ipfs_hash = "0x7465737415000400000000000000000000000000000000000000000000000000"

    const CrowdfundingCampaign = await hre.ethers.getContractFactory("CrowdfundingCampaign");
    const CrowdfundingCampaignDemo = await hre.ethers.getContractFactory("CrowdfundingCampaignDemo");

    const crowdfundingCampaign = await CrowdfundingCampaign.new(5, 300, ipfs_hash);
    const crowdfundingCampaignDemo = await CrowdfundingCampaignDemo.new(5, 255, ipfs_hash);

    await crowdfundingCampaign.deployed();
    await crowdfundingCampaignDemo.deployed();

    console.log("CrowdfundingCampaign deployed to:", crowdfundingCampaign.address);
    console.log("CrowdfundingCampaign deployed to:", crowdfundingCampaignDemo.address);
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });