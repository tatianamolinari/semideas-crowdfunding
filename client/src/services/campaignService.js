import getWeb3 from "../getWeb3";
import CrowdFundingCampaing from "../contracts/CrowdFundingCampaing.json";

import { getValuesFromHash } from "../helpers/utils.js"
import { stat } from "fs";


class CampaignService {
    
  constructor() {
    this.init();
  }

  async init() {
    this.web3 = await getWeb3();
    this.accounts = await this.web3.eth.getAccounts();
    this.networkId = await this.web3.eth.net.getId();
    this.instance = null;
  }

  async getAccounts(){
    return (await this.web3.eth.getAccounts());
  }

  getFirstAccount(){
    return this.accounts[0];
  }

  isCorrectNetwork() {
    return CrowdFundingCampaing.networks[this.networkId];
  }

  async getCurrentBlock(){
    return (await this.web3.eth.getBlockNumber())
  }

  async setInstance() {
    this.instance = await new this.web3.eth.Contract(
      CrowdFundingCampaing.abi,
      CrowdFundingCampaing.networks[this.networkId] && CrowdFundingCampaing.networks[this.networkId].address,
    );
    return this.instance;
  }

  getInstance(){
    return this.instance;
  }

  async getCampaingInfo() {
    let campaingValues = await this.instance.methods.getCampaingInfo().call();
    let campaingInfo = getValuesFromHash(campaingValues);
             
    let campaingData = new Object();
    campaingData.owner = campaingInfo[0];
    campaingData.status = await campaingInfo[1];
    campaingData.goal = campaingInfo[2]
    campaingData.minimunContribution = campaingInfo[3];
    campaingData.membersCount = campaingInfo[4];

    return campaingData;
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
    let gasprice = await this.web3.eth.getGasPrice();
    let gas = await this.instance.methods.contribute().estimateGas({ from: this.accounts[0], value: value });      
    let transaction = this.instance.methods.contribute().send({ from: this.accounts[0], gasPrice: gasprice, gas: gas, value: value }) ;    
    var service = this;

    var promise = new Promise(function(resolve, reject) {

    let statusResponse = new Object();
    statusResponse.error = false;
    statusResponse.errorMsg = "";

    transaction.on('error', (error, receipt) => { service.transactionOnError(error, receipt, statusResponse, resolve) });
    transaction.on('receipt', (receipt) => service.transactionOnReipt(receipt, statusResponse, resolve));

    });

    return promise;
  }
}

export const campaignService = new CampaignService()