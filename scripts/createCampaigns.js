


const CrowdFundingCampaing = artifacts.require("CrowdFundingCampaign.sol");
//import { create }  from '../node_modules/ipfs-http-client'; //-------------> falla porque no le gusta el import
//const { create } = require('ipfs-http-client') //---------> falla porque no encuentra el modulo
const { create } = require('../node_modules/ipfs-http-client'); //---> encuentra el modulo pero falla dentro de ipfs
const fs = require('fs');
const bs58 = require('bs58');
const ipfs_client = create('https://ipfs.infura.io:5001');

async function saveJsonIPFS(json_value){
    
    const result = await ipfs_client.add(JSON.stringify(json_value));
    return result.path;
}

async function saveImageIPFS(path_image){
    const imgdata = fs.readFileSync(path_image);
    const result = await ipfs_client.add(imgdata);
    return result.path;
}

async function saveCampaignInfoIPFS(imagesPath,title,description,date)
{
    const campaignData = {};
    const ipfsImagesPaths = [];

    for (const path of imagesPath) {
        const ipfsPath = await saveImageIPFS(path);
        ipfsImagesPaths.push(ipfsPath);
    }

    campaignData["title"] = title;
    campaignData["description"] = description;
    campaignData["created_date"] = date;
    campaignData["images"] = ipfsImagesPaths;

    const path = await saveJsonIPFS(campaignData);
    return path;
}

function addressToHexBytes(address){
    const out = bs58.decode(address);
    const hexBytes = new Buffer(out).toString('hex');
    return hexBytes.substring(4);
}

function getBasicInfo(){
    const basic_info = JSON.parse(fs.readFileSync("./scripts/campaigns_data/basic_info.json"));
    return basic_info;
}

async function main() {

    
    const jsonInfo = getBasicInfo();
    const campaignsData = {};
    campaignsData["campaigns"] = [];

    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
    
        const path = await saveCampaignInfoIPFS(campaignInfo["imagesPath"],
                                            campaignInfo["title"],
                                            campaignInfo["description"],
                                            campaignInfo["created_date"]);

        const ipfsHash = "0x" + addressToHexBytes(path);

        const response = await CrowdFundingCampaing.new(
                                campaignInfo["minimunContribution"], 
                                campaignInfo["goal"], 
                                ipfsHash);

        const campaingInfo = {}
        campaingInfo["address"] = response.address
        campaingInfo["ipfsPath"] = path

        campaignsData["campaigns"].push(campaingInfo);
    }


    var fs = require('fs');
    fs.writeFileSync("./client/src/contracts/campaignAddresses.json", 
                      JSON.stringify(campaignsData), 
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