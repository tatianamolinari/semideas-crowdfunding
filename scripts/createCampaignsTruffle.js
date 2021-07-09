


//const CrowdfundingCampaign = artifacts.require("CrowdfundingCampaign.sol");
const CrowdfundingCampaignDemo = artifacts.require("CrowdfundingCampaignDemo.sol");
const { create } = require('../node_modules/ipfs-http-client');
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
    const imgdata = fs.readFileSync(path_image);
    const result = await ipfs_client.add(imgdata);
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
    
        const path = await saveInfoIPFS(campaignInfo["imagesPath"],
                                        campaignInfo["title"],
                                        campaignInfo["description"],
                                        campaignInfo["created_date"]);

        const ipfsHash = "0x" + addressToHexBytes(path);

        const campaign = await CrowdfundingCampaignDemo.new(
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
            const value = contributionInfo["value"];
            const addr_index = contributionInfo["accountIndex"];
            const campaign = campaigns[i]
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.contribute.estimateGas({ from: addr[addr_index], value: value });      
            const transaction = await campaign.contribute.sendTransaction({ from: addr[addr_index], gasPrice: gasprice, gas: gas, value: value }) ; 
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
            const gas = await campaign.setActive.estimateGas({ from: addr[0] });      
            const transaction = await campaign.setActive.sendTransaction({ from: addr[0], gasPrice: gasprice, gas: gas }) ; 
            response = response && (transaction.type == "mined");
        }
        i=i+1;

    };
    return response;  

}

async function progressUpdates(web3, addr, jsonInfo, campaigns){

    let response = false;
    let i = 0;
    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
        if (campaignInfo["active"]["status"])
        {
            console.log(`Progress updates ${campaignInfo["title"]} ${i}`)
            for (const progressUpdates of campaignInfo["progressUpdates"]) {
                const path = await saveInfoIPFS(progressUpdates["imagesPath"],
                                                progressUpdates["title"],
                                                progressUpdates["description"],
                                                progressUpdates["created_date"]);

                const ipfsHash = "0x" + addressToHexBytes(path);

                const campaign = campaigns[i]
                const gasprice = await web3.eth.getGasPrice();
                const gas = await campaign.saveProgressUpdate.estimateGas(ipfsHash, { from: addr[0] });      
                const transaction = await campaign.saveProgressUpdate.sendTransaction(ipfsHash, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
                response = response && (transaction.type == "mined");
            }
        }
        i=i+1;

    };
    return response;  

}

async function proposals(web3, addr, jsonInfo, campaigns){

    let response = false;
    let i = 0;
    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
        if (campaignInfo["active"]["status"])
        {
            let i_proposal = 0;
            for (const proposal of campaignInfo["proposals"]) {
                const path = await saveInfoIPFS([],
                                                proposal["title"],
                                                proposal["description"],
                                                proposal["created_date"]);

                const ipfsHash = "0x" + addressToHexBytes(path);

                const value = proposal["value"]
                const recipient = addr[proposal["add_i"]]

                const campaign = campaigns[i]
                const gasprice = await web3.eth.getGasPrice();
                const gas = await campaign.createProposal.estimateGas(value, recipient, ipfsHash, { from: addr[0] });      
                const transaction = await campaign.createProposal.sendTransaction(value, recipient, ipfsHash, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
                response = response && (transaction.type == "mined");

                await voteProposals(web3, addr, i_proposal, proposal, campaign);
                await activateProposals(web3, addr, i_proposal, proposal, campaign);

                i_proposal = i_proposal + 1;
            }
        }
        i=i+1;

    };
    return response;  

}

async function voteProposals(web3, addr, i_proposal, jsonInfoProposal, campaign){

    let response = false;
    for (const vote of jsonInfoProposal["votes"]) {
        const member = addr[vote["accountIndex"]]

        if (vote["value"]) {
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.approveProposal.estimateGas(i_proposal, { from: member });      
            const transaction = await campaign.approveProposal.sendTransaction(i_proposal, { from: member, gasPrice: gasprice, gas: gas }) ; 
            response = response && (transaction.type == "mined");
        }
        else {
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.disapproveProposal.estimateGas(i_proposal, { from: member });      
            const transaction = await campaign.disapproveProposal.sendTransaction(i_proposal, { from: member, gasPrice: gasprice, gas: gas }) ; 
            response = response && (transaction.type == "mined");
        }
    };
    return response;  

}

async function activateProposals(web3, addr, i_proposal, proposal, campaign){

    let response = false;
    
    if (proposal["timeReached"]) {
        const gasprice = await web3.eth.getGasPrice();
        const gas = await campaign.changeLimitProposal.estimateGas(i_proposal, { from: addr[0] });      
        const transaction = await campaign.changeLimitProposal.sendTransaction(i_proposal, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
        response = response && (transaction.type == "mined");
    }

    if (proposal["timeReached"] && proposal["closed"]) {
        console.log(`Closing ${i_proposal}`)
        await sleep(3000);
        const gasprice = await web3.eth.getGasPrice();
        const gas = await campaign.closeProposal.estimateGas(i_proposal, { from: addr[0] });      
        const transaction = await campaign.closeProposal.sendTransaction(i_proposal, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
        response = response && (transaction.type == "mined");
    }

    //const p = await campaign.getProposal.call(i_proposal);
    //console.log(p);

    return response;

}

async function destructProposals(web3, addr, jsonInfo, campaigns){

    let response = false;
    let i = 0;
    for (const campaignInfo of jsonInfo["campaignsToCreate"]) {
        if (campaignInfo["active"]["status"])
        {
            console.log(`${campaignInfo["title"]} ${i}`)
            let i_dproposal = 0;
            for (const dproposal of campaignInfo["destructPproposals"]) {
                console.log(`DP ${i_dproposal}`)
                const path = await saveInfoIPFS([],
                                                dproposal["title"],
                                                dproposal["description"],
                                                dproposal["created_date"]);

                const ipfsHash = "0x" + addressToHexBytes(path);
                const author = addr[dproposal["author_i"]]

                const campaign = campaigns[i]
                const gasprice = await web3.eth.getGasPrice();
                const gas = await campaign.createDestructProposal.estimateGas(ipfsHash, { from: author });      
                const transaction = await campaign.createDestructProposal.sendTransaction(ipfsHash, { from: author, gasPrice: gasprice, gas: gas }) ; 
                response = response && (transaction.type == "mined");

                await voteDestructProposals(web3, addr, i_dproposal, dproposal, campaign);
                await activateDestructProposals(web3, addr, i_dproposal, dproposal, campaign);

                i_dproposal = i_dproposal + 1;
            }
        }
        i=i+1;

    };
    return response;  

}

async function voteDestructProposals(web3, addr, i_dproposal, jsonInfoProposal, campaign){

    let response = false;
    for (const vote of jsonInfoProposal["votes"]) {
        const member = addr[vote["accountIndex"]]

        if (vote["value"]) {
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.aproveDestructProposal.estimateGas(i_dproposal, { from: member });      
            const transaction = await campaign.aproveDestructProposal.sendTransaction(i_dproposal, { from: member, gasPrice: gasprice, gas: gas }) ; 
            response = response && (transaction.type == "mined");
        }
        else {
            const gasprice = await web3.eth.getGasPrice();
            const gas = await campaign.disapproveDestructProposal.estimateGas(i_dproposal, { from: member });      
            const transaction = await campaign.disapproveDestructProposal.sendTransaction(i_dproposal, { from: member, gasPrice: gasprice, gas: gas }) ; 
            response = response && (transaction.type == "mined");
        }
    };
    return response;  

}

async function activateDestructProposals(web3, addr, i_dproposal, dproposal, campaign){

    let response = false;
    
    if (dproposal["timeReached"]) {
        const gasprice = await web3.eth.getGasPrice();
        const gas = await campaign.changeLimitDestructProposal.estimateGas(i_dproposal, { from: addr[0] });      
        const transaction = await campaign.changeLimitDestructProposal.sendTransaction(i_dproposal, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
        response = response && (transaction.type == "mined");
    }

    if (dproposal["closed"]) {
        console.log(`Closing d ${i_dproposal}`)
        await sleep(3000);
        const gasprice = await web3.eth.getGasPrice();
        const gas = await campaign.closeDestructProposal.estimateGas(i_dproposal, { from: addr[0] });      
        const transaction = await campaign.closeDestructProposal.sendTransaction(i_dproposal, { from: addr[0], gasPrice: gasprice, gas: gas }) ; 
        response = response && (transaction.type == "mined");
    }

    return response;

}


async function main() {

    const web3 = getWeb3();
    const addr = await web3.eth.getAccounts();
    const jsonInfo = getBasicInfo();
    const campaigns = await createCampaigns(jsonInfo);
    console.log(`Creation passed: ${campaigns.length} new campaigns`);
    const contributed = await sendContributions(web3, addr, jsonInfo, campaigns);
    console.log(`Contributed passed: ${contributed}`);
    const actived = await changeActive(web3, addr, jsonInfo, campaigns);
    console.log(`Actived passed: ${actived}`);
    const progress = await progressUpdates(web3, addr, jsonInfo, campaigns)
    console.log(`Progress creation passed: ${progress}`);     
    const proposalsS = await proposals(web3, addr, jsonInfo, campaigns);
    console.log(`Proposals creation passed: ${proposalsS}`);
    const destructProposalsS = await destructProposals(web3, addr, jsonInfo, campaigns);
    console.log(`Destruct Proposals creation passed: ${destructProposalsS}`);  
}

module.exports = function(callback) {
    main().then(() => callback()).catch((err) => callback(err));
}
