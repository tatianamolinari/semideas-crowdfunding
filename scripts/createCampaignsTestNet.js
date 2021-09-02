const CrowdfundingCampaignDemo = artifacts.require("CrowdfundingCampaignDemo.sol");
const { create } = require('../node_modules/ipfs-http-client');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const SEED_PHRASE = "benefit cake raise family jungle scheme view potato merge tower cage soup";

const fs = require('fs');
const bs58 = require('bs58');
const Web3 = require("web3");
const ipfs_client = create('https://ipfs.infura.io:5001');

function sleep(ms) {
    
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function saveJsonIPFS(json_value){

    const result = await ipfs_client.add(JSON.stringify(json_value));
    return result.path;
}

async function saveImageIPFS(path_image){
    
    const img_data = fs.readFileSync(path_image);
    const result = await ipfs_client.add(img_data);
    return result.path;
}

async function saveInfoIPFS(imagesPath,title,description,date){
    
    const jsonData = {};
    const ipfsImagesPaths = [];

    for (const path of imagesPath) {
        const ipfsPath = await saveImageIPFS(path);
        ipfsImagesPaths.push(ipfsPath);
    }

    jsonData["title"] = title;
    jsonData["description"] = description;
    jsonData["created_date"] = date;
    jsonData["images"] = ipfsImagesPaths;

    const path = await saveJsonIPFS(jsonData);
    return path;
}

function addressToHexBytes(address){
    
    const out = bs58.decode(address);
    const hexBytes = new Buffer(out).toString('hex');
    return hexBytes.substring(4);
}

function getBasicInfo(){
    
    const basic_info = JSON.parse(fs.readFileSync("./scripts/campaigns_data/basic_info_test_net.json"));
    return basic_info;
}

function getWeb3(){
    
    const provider = new HDWalletProvider(SEED_PHRASE, `https://rinkeby.infura.io/v3/296eba79f82040fd95a0f48edd2289a9`);
    const web3 = new Web3(provider);
    return web3;
}

async function createCampaigns(jsonInfo){
    
    const campaigns = []
    const campaignsData = {};
    campaignsData["campaigns"] = [];

    let ipfsHash = null;
    let path = null;

    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
    
        if (ipfsHash == null) {
            path = await saveInfoIPFS(campaignInfo["imagesPath"],
                                            campaignInfo["title"],
                                            campaignInfo["description"],
                                            campaignInfo["created_date"]);

            ipfsHash = "0x" + addressToHexBytes(path);
        }

        const campaign = await CrowdfundingCampaignDemo.new(
                                campaignInfo["minimunContribution"], 
                                campaignInfo["goal"], 
                                ipfsHash);

        const blockNumber = await web3.eth.getBlockNumber();

        console.log(campaign);
        const jsonCampaignInfo = {}
        jsonCampaignInfo["address"] = campaign.address
        jsonCampaignInfo["ipfsPath"] = path
        jsonCampaignInfo["blockNumber"] = blockNumber;

        campaignsData["campaigns"].push(jsonCampaignInfo);
        campaigns.push(campaign);

        if (campaignInfo["out_grace_period"])
        {
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.changeCreatedAt.estimateGas();      
            await campaign.changeCreatedAt.sendTransaction({ gasPrice: gasprice, gas: gas }) ; 
        }
    }

    var fs = require('fs');
    fs.writeFileSync("./client/src/contracts/campaignAddressesTestNet.json", 
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

    let i = 0;
    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {

        for (const contributionInfo of campaignInfo["contributions"]) {
            const value = contributionInfo["value"];
            const addr_index = contributionInfo["accountIndex"];
            const campaign = campaigns[i]
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.contribute.estimateGas({ from: addr[addr_index], value: value });      
            await campaign.contribute.sendTransaction({ from: addr[addr_index], gasPrice: gasprice, gas: gas, value: value }) ; 
        }
        i=i+1;
    }
}

async function changeActive(web3, addr, jsonInfo, campaigns){

    let i = 0;
    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
        if (campaignInfo["active"]["status"])
        {
            const campaign = campaigns[i]
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.setActive.estimateGas({ from: addr[0] });      
            await campaign.setActive.sendTransaction({ from: addr[0], gasPrice: gasprice, gas: gas }) ; 
        }
        i=i+1;
    }
}

async function progressUpdates(web3, addr, jsonInfo, campaigns){

    let i = 0;
    const saved = {};
    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
        if (campaignInfo["active"]["status"])
        {
            for (const progressUpdates of campaignInfo["progressUpdates"]) {

                let ipfsHash = null;
                if (saved[progressUpdates["title"]] == null)  {
                    await sleep(3000);
                    const path = await saveInfoIPFS(progressUpdates["imagesPath"],
                                                    progressUpdates["title"],
                                                    progressUpdates["description"],
                                                    progressUpdates["created_date"]);

                    ipfsHash = "0x" + addressToHexBytes(path);
                    saved[progressUpdates["title"]] = ipfsHash;

                } else {

                    ipfsHash = saved[progressUpdates["title"]];
                }

                const campaign = campaigns[i]
                const gasprice = await web3.eth.getGasPrice();
                const gas = await campaign.saveProgressUpdate.estimateGas(ipfsHash, { from: addr[0] });      
                await campaign.saveProgressUpdate.sendTransaction(ipfsHash, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
            }
        }
        i=i+1;
    }
}

async function proposals(web3, addr, jsonInfo, campaigns){

    let i = 0;
    const saved = {};
    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
        if (campaignInfo["active"]["status"])
        {
            let i_proposal = 0;
            for (const proposal of campaignInfo["proposals"]) {

                let ipfsHash = null;
                if (saved[proposal["title"]] == null)  {
                    await sleep(3000);
                    const path = await saveInfoIPFS([],
                                                    proposal["title"],
                                                    proposal["description"],
                                                    proposal["created_date"]);

                    ipfsHash = "0x" + addressToHexBytes(path);
                    saved[proposal["title"]] = ipfsHash;

                } else {
                    
                    ipfsHash = saved[proposal["title"]];
                
                }

                const value = proposal["value"]
                const recipient = addr[proposal["add_i"]]

                const campaign = campaigns[i]
                const gasprice = await web3.eth.getGasPrice();
                const gas = await campaign.createProposal.estimateGas(value, recipient, ipfsHash, { from: addr[0] });      
                await campaign.createProposal.sendTransaction(value, recipient, ipfsHash, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 

                await voteProposals(web3, addr, i_proposal, proposal, campaign);
                await activateProposals(web3, addr, i_proposal, proposal, campaign);
                await releaseProposals(web3, addr, i_proposal, proposal, campaign)

                i_proposal = i_proposal + 1;
            }
        }
        i=i+1;
    }
}

async function voteProposals(web3, addr, i_proposal, jsonInfoProposal, campaign){

    for (const vote of jsonInfoProposal["votes"]) {
        const member = addr[vote["accountIndex"]]

        if (vote["value"]) {
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.approveProposal.estimateGas(i_proposal, { from: member });      
            await campaign.approveProposal.sendTransaction(i_proposal, { from: member, gasPrice: gasprice, gas: gas }) ; 
        }
        else {
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.disapproveProposal.estimateGas(i_proposal, { from: member });      
            await campaign.disapproveProposal.sendTransaction(i_proposal, { from: member, gasPrice: gasprice, gas: gas }) ; 
        }
    }
}

async function activateProposals(web3, addr, i_proposal, proposal, campaign){
    
    if (proposal["timeReached"]) {
        const gasprice = await web3.eth.getGasPrice();
        const gas = await campaign.changeLimitProposal.estimateGas(i_proposal, { from: addr[0] });      
        await campaign.changeLimitProposal.sendTransaction(i_proposal, { from: addr[0], gasPrice: gasprice, gas: gas }) ;
    }

    if (proposal["timeReached"] && proposal["closed"]) {
        await sleep(3000);
        const gasprice = await web3.eth.getGasPrice();
        const gas = await campaign.closeProposal.estimateGas(i_proposal, { from: addr[0] });      
        await campaign.closeProposal.sendTransaction(i_proposal, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
    }
}

async function releaseProposals(web3, addr, i_proposal, proposal, campaign){
    
    if (proposal["release"]) {
        const gasprice = await web3.eth.getGasPrice();
        const gas = await campaign.release.estimateGas(i_proposal, { from: addr[0] });      
        await campaign.release.sendTransaction(i_proposal, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
    }
}

async function closeProposals(web3, addr, jsonInfo, campaigns){

    let i = 0;
    const saved = {};

    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
        if (campaignInfo["active"]["status"])
        {
            let i_cproposal = 0;
            for (const dproposal of campaignInfo["closeProposals"]) {

                let ipfsHash = null;
                if (saved[dproposal["title"]] == null)  {
                    await sleep(3000);
                    const path = await saveInfoIPFS([],
                                                    dproposal["title"],
                                                    dproposal["description"],
                                                    dproposal["created_date"]);

                    ipfsHash = "0x" + addressToHexBytes(path);
                    saved[dproposal["title"]] = ipfsHash;
                } else {
                    
                    ipfsHash = saved[dproposal["title"]];
                }
                
                const author = addr[dproposal["author_i"]]

                const campaign = campaigns[i]
                const gasprice = await web3.eth.getGasPrice();
                const gas = await campaign.createCloseProposal.estimateGas(ipfsHash, { from: author });      
                await campaign.createCloseProposal.sendTransaction(ipfsHash, { from: author, gasPrice: gasprice, gas: gas }) ; 

                await voteCloseProposals(web3, addr, i_cproposal, dproposal, campaign);
                await activateCloseProposals(web3, addr, i_cproposal, dproposal, campaign);

                i_cproposal = i_cproposal + 1;
            }
        }
        i=i+1;
    };
}

async function voteCloseProposals(web3, addr, i_cproposal, jsonInfoProposal, campaign){

    for (const vote of jsonInfoProposal["votes"]) {
        const member = addr[vote["accountIndex"]]

        if (vote["value"]) {
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.approveCloseProposal.estimateGas(i_cproposal, { from: member });      
            await campaign.approveCloseProposal.sendTransaction(i_cproposal, { from: member, gasPrice: gasprice, gas: gas }) ; 
        }
        else {
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.disapproveCloseProposal.estimateGas(i_cproposal, { from: member });      
            await campaign.disapproveCloseProposal.sendTransaction(i_cproposal, { from: member, gasPrice: gasprice, gas: gas }) ; 
        }
    }
}

async function activateCloseProposals(web3, addr, i_cproposal, dproposal, campaign){
    
    if (dproposal["timeReached"]) {
        const gasprice = await web3.eth.getGasPrice();
        const gas = await campaign.changeLimitCloseProposal.estimateGas(i_cproposal, { from: addr[0] });      
        await campaign.changeLimitCloseProposal.sendTransaction(i_cproposal, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
    }

    if (dproposal["closed"]) {
        await sleep(3000);
        const gasprice = await web3.eth.getGasPrice();
        const gas = await campaign.closeCloseProposal.estimateGas(i_cproposal, { from: addr[0] });      
        await campaign.closeCloseProposal.sendTransaction(i_cproposal, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
    }
}


async function main() {

    const web3 = getWeb3();
    const addr = await web3.eth.getAccounts();
    const jsonInfo = getBasicInfo();
    const campaigns = await createCampaigns(jsonInfo);
    console.log(`Creation passed: ${campaigns.length} new campaigns`);
    
    await sendContributions(web3, addr, jsonInfo, campaigns);
    console.log(`Contribution to campaigns completed.`);
    
    await changeActive(web3, addr, jsonInfo, campaigns);
    console.log(`Campaigns activation completed.`);
    
    await progressUpdates(web3, addr, jsonInfo, campaigns)
    console.log(`Campaigns Progress Update creation completed.`);     
    
    await proposals(web3, addr, jsonInfo, campaigns);
    console.log(`Campaigns Proposals creation completed.`);
    
    await closeProposals(web3, addr, jsonInfo, campaigns);
    console.log(`Campaigns Close Proposals creation completed.`);  

    console.log(`Creation process completed.`);
}

module.exports = function(callback) {
    main().then(() => callback()).catch((err) => callback(err));
}
