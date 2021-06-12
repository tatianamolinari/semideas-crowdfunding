var CrowdFundingCampaign = artifacts.require("CrowdFundingCampaign.sol");
//const ipfsService = require("../client/src/services/ipfsService.js");
//require("dotenv").config({ path: "../.env" });
//const { create } = require('ipfs-http-client');

module.exports = async function(deployer) {

    let ipfs_hash = "0x7465737415000400000000000000000000000000000000000000000000000000"
    await deployer.deploy(CrowdFundingCampaign, 5, 300, ipfs_hash)
}