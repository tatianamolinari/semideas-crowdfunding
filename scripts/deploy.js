
const hre = require("hardhat");

async function main() {

    const CrowdfundingCampaign = await hre.ethers.getContractFactory("CrowdfundingCampaign");
    const ipfs_hash = "0x7465737415000400000000000000000000000000000000000000000000000000"
    const crowdfundingCampaign = await CrowdfundingCampaign.new( 5, 300, ipfs_hash);

    await crowdfundingCampaign.deployed();

    console.log("CrowdfundingCampaign deployed to:", crowdfundingCampaign.address);
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });