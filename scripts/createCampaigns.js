


const CrowdFundingCampaign = artifacts.require("CrowdFundingCampaign.sol");
//import { create }  from '../node_modules/ipfs-http-client'; //-------------> falla porque no le gusta el import
//const { create } = require('ipfs-http-client') //---------> falla porque no encuentra el modulo
const { create } = require('../node_modules/ipfs-http-client'); //---> encuentra el modulo pero falla dentro de ipfs
const fs = require('fs');
const bs58 = require('bs58');
const Web3 = require("web3");
const ipfs_client = create('https://ipfs.infura.io:5001');


async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

function getWeb3(){
    const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
    const web3 = new Web3(provider);
    return web3;
}

async function createCampaigns(jsonInfo){
    const campaigns = []
    const campaignsData = {};
    campaignsData["campaigns"] = [];

    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
    
        const path = await saveCampaignInfoIPFS(campaignInfo["imagesPath"],
                                            campaignInfo["title"],
                                            campaignInfo["description"],
                                            campaignInfo["created_date"]);

        const ipfsHash = "0x" + addressToHexBytes(path);

        const campaign = await CrowdFundingCampaign.new(
                                campaignInfo["minimunContribution"], 
                                campaignInfo["goal"], 
                                ipfsHash);

        const campaingInfo = {}
        campaingInfo["address"] = campaign.address
        campaingInfo["ipfsPath"] = path

        campaignsData["campaigns"].push(campaingInfo);
        campaigns.push(campaign);
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
    
    return campaigns;

}

async function sendContributions(web3, addr, jsonInfo, campaigns){

    let response = false;
    let i = 0;
    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {

        for (const contributionInfo of campaignInfo["contributions"]) {
            console.log(`${i} ${contributionInfo["value"]} ${campaignInfo['title']} ${campaigns[i]}`);
            const value = contributionInfo["value"];
            const addr_index = contributionInfo["accountIndex"];
            const campaign = campaigns[i]
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.methods['contribute()'].estimateGas({ from: addr[addr_index], value: value });      
            const transaction = await campaign.methods['contribute()'].sendTransaction({ from: addr[addr_index], gasPrice: gasprice, gas: gas, value: value }) ; 
            response = response && (transaction.logs.type == "mined");
        };
        i=i+1;
    };
    return response;  

}

async function changeActive(web3, addr, jsonInfo, campaigns){

    let response = false;
    let i = 0;
    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
        if (campaignInfo["active"]["status"])
        {
            const campaign = campaigns[i]
            const gasprice = await web3.eth.getGasPrice();
            //const balance = await web3.eth.getBalance(campaign.address);
            //const goal = await campaign.methods['goal()'].call()
            //console.log(campaign.methods);
            //console.log(`${i} ${campaignInfo['title']} goal: ${goal} balance: ${balance} ${campaigns[i]} status ${campaignInfo["active"]["status"]}`);
            const gas = await campaign.methods['setActive()'].estimateGas({ from: addr[0] });      
            const transaction = await campaign.methods['setActive()'].sendTransaction({ from: addr[0], gasPrice: gasprice, gas: gas }) ; 
            response = response && (transaction.type == "mined");
        }
        i=i+1;

    };
    return response;  

}



async function main() {

    const web3 = getWeb3();
    const addr = await web3.eth.getAccounts();
    const jsonInfo = getBasicInfo();
    const campaigns = await createCampaigns(jsonInfo);
    const contributed = await sendContributions(web3, addr, jsonInfo, campaigns);
    console.log(contributed);
    const actived = await changeActive(web3, addr, jsonInfo, campaigns)
    console.log(actived);
    

    
}

module.exports = function(callback) {
    main().then(() => callback()).catch((err) => callback(err));
}