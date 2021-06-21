import getWeb3 from "../getWeb3";
import CrowdFundingCampaign from "../contracts/CrowdFundingCampaign.json";

import { getValuesFromHash } from "../helpers/utils.js"

class CampaignService {
    
  constructor() {
    this.init();
  }

  async init() {
    this.web3 = await getWeb3();
    this.accounts = await this.web3.eth.getAccounts();
    this.networkId = await this.web3.eth.net.getId();
    this.instance = null;
    return true;
  }

  async getAccounts(){
    return (await this.web3.eth.getAccounts());
  }

  getFirstAccount(){
    return this.accounts[0];
  }

  async isCorrectNetwork() {
    const initialized = await this.init();
    return CrowdFundingCampaign.networks[this.networkId];
  }

  async getCurrentBlock(){
    return (await this.web3.eth.getBlockNumber())
  }

  async setInstance() {
    this.instance = await new this.web3.eth.Contract(
      CrowdFundingCampaign.abi,
      CrowdFundingCampaign.networks[this.networkId] && CrowdFundingCampaign.networks[this.networkId].address,
    );
    return this.instance;
  }

  async setInstanceFromAddress(address) {
    this.instance = await new this.web3.eth.Contract(
      CrowdFundingCampaign.abi,
      CrowdFundingCampaign.networks[this.networkId] && address,
    );
    return this.instance;
  }

  getInstance(){
    return this.instance;
  }

  async getCampaignInfo() {
    const campaignValues = await this.instance.methods.getCampaignInfo().call();
    const campaignInfo = getValuesFromHash(campaignValues);
             
    const campaignData = new Object();
    campaignData.owner = campaignInfo[0];
    campaignData.status = await campaignInfo[1];
    campaignData.goal = campaignInfo[2]
    campaignData.minimunContribution = campaignInfo[3];
    campaignData.membersCount = campaignInfo[4];

    return campaignData;
  }

  async getMembershipFromAddress(address) {
    return (await this.instance.methods.isMember(address).call());
  }

  async getMembership() {
    return (this.getMembershipFromAddress(this.accounts[0]))
  }

  async getBalance(){
    return (await this.web3.eth.getBalance(this.instance.options.address));
  }

  async getMembersCount(){
    return (await this.instance.methods.membersCount().call());
  }

  async suscribeToNewContribution(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.newContribution({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
          console.log(subscriptionId);
      })
      .on('data', function(event){
          actualizeFunction();
          console.log(event); 
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToChangeStatus(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.changeStatusCampaign({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
          console.log(subscriptionId);
      })
      .on('data', function(event){
          actualizeFunction();
          console.log(event); 
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });


  }

  transactionOnError(error, receipt, statusResponse, resolve)  { 
    statusResponse.error = true;
      
    if (error["code"] === 4001) {
      statusResponse.errorMsg = "Acción denegada";
      console.log(statusResponse.errorMsg);
    }
    else if(error["code"] === -32603) {
      statusResponse.errorMsg = "Nonce error";
    }
    else if (receipt && (receipt.cumulativeGasUsed === receipt.gasUsed)) {
      statusResponse.errorMsg = "Gas insuficiente";
      console.log(receipt.cumulativeGasUsed);
      console.log(receipt.gasUsed);
    }
    else {
      statusResponse.errorMsg = "Error desconocido"
      console.log(statusResponse.errorMsg);
      console.log(error);
    }

    resolve(statusResponse);
  }

  transactionOnReipt(receipt, statusResponse, resolve){
    {
      console.log('reciept', receipt);
      if(receipt.status === '0x1' || receipt.status === 1  || receipt.status===true ){
        console.log('Transaction Success');
      }
      else {
        console.log('Transaction receipt but failed')
      }
    }
    resolve(statusResponse);
  }


  async contribute(value) {
    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.contribute().estimateGas({ from: this.accounts[0], value: value });      
    const transaction = this.instance.methods.contribute().send({ from: this.accounts[0], gasPrice: gasprice, gas: gas, value: value }) ;    
    var service = this;

    const promise = new Promise(function(resolve, reject) {

      const statusResponse = new Object();
      statusResponse.error = false;
      statusResponse.errorMsg = "";

      transaction.on('error', (error, receipt) => { service.transactionOnError(error, receipt, statusResponse, resolve) });
      transaction.on('receipt', (receipt) => service.transactionOnReipt(receipt, statusResponse, resolve));

    });

    return promise;
  }
}

export const campaignService = new CampaignService()
