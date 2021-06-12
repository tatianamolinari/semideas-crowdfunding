


const CrowdFundingCampaing = artifacts.require("CrowdFundingCampaign.sol");
//const { create } = require('ipfs-http-client');

async function main() {
    const campaignAddressesData = {};
    campaignAddressesData["campaigns"] = [];
    const ipfsHash = "0x7465737415000400000000000000000000000000000000000000000000000000"
    const response = await CrowdFundingCampaing.new(10, 305, ipfsHash);
    campaignAddressesData["campaigns"].push(response.address);
    console.log(campaignAddressesData);
    var fs = require('fs');
    fs.writeFileSync("../client/src/contracts/campaignAddresses.json", 
                      JSON.stringify(campaignAddressesData), 
                      function(err) {
                        if (err) {
                            console.log(err);
                        }
                        console.log("complete");
                    });
}

module.exports = function(callback) {
    main().then(() => callback()).catch((err) => callback(err));
}