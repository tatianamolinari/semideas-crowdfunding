
const hre = require("hardhat");

async function main() {

    const CrowdFundingCampaign = await hre.ethers.getContractFactory("CrowdFundingCampaign");
    const ipfs_hash = "0x7465737415000400000000000000000000000000000000000000000000000000"
    const crowdFundingCampaign = await CrowdFundingCampaign.new( 5, 300, ipfs_hash);

    await crowdFundingCampaign.deployed();

    console.log("CrowdFundingCampaign deployed to:", crowdFundingCampaign.address);
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });