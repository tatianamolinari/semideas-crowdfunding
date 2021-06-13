


const CrowdFundingCampaing = artifacts.require("CrowdFundingCampaign.sol");
//import { create }  from '../node_modules/ipfs-http-client'; //-------------> falla porque no le gusta el import
const { create } = require('ipfs-http-client') //---------> falla porque no encuentra el modulo
//const { create } = require('../node_modules/ipfs-http-client'); //---> encuentra el modulo pero falla dentro de ipfs

console.log(create);
async function main() {
    const campaignAddressesData = {};
    campaignAddressesData["campaigns"] = [];

    const json_value = {}
    json_value["holi"] = "llegueeeeeeeeeeee"

    const ipfs_client = create('https://ipfs.infura.io:5001');
    const result = await ipfs_client.add(JSON.stringify(json_value));
    console.log(result.path);

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