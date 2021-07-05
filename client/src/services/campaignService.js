import getWeb3 from "../getWeb3";
import CrowdfundingCampaignDemo from "../contracts/CrowdfundingCampaignDemo.json";

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
    console.log(`Now initialized is ${initialized}`);
    return CrowdfundingCampaignDemo.networks[this.networkId];
  }

  async getCurrentBlock(){
    return (await this.web3.eth.getBlockNumber())
  }

  async setInstance() {
    this.instance = await new this.web3.eth.Contract(
      CrowdfundingCampaignDemo.abi,
      CrowdfundingCampaignDemo.networks[this.networkId] && CrowdfundingCampaignDemo.networks[this.networkId].address,
    );
    return this.instance;
  }

  async setInstanceFromAddress(address) {
    this.instance = await new this.web3.eth.Contract(
      CrowdfundingCampaignDemo.abi,
      CrowdfundingCampaignDemo.networks[this.networkId] && address,
    );
    return this.instance;
  }

  getInstance(){
    return this.instance;
  }

  async getCampaignInfo() {
    const campaignValues = await this.instance.methods.getCampaignInfo().call();
    const campaignInfo = getValuesFromHash(campaignValues);
             
    const campaignData = {};
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

  async getBalance() {
    return (await this.web3.eth.getBalance(this.instance.options.address));
  }

  async getMembersCount() {
    return (await this.instance.methods.membersCount().call());
  }

  async getStatus() {
    return (await this.instance.methods.getStatus().call());
  }

  async getProposalInfo(index) {
    const proposalValues = await this.instance.methods.getProposal(index).call({ from: this.accounts[0]});
    const proposalInfo = getValuesFromHash(proposalValues);
             
    const proposalData = {};
    proposalData.recipient = proposalInfo[0];
    proposalData.value = proposalInfo[1];
    proposalData.approvalsCount = proposalInfo[2]
    proposalData.disapprovalsCount = proposalInfo[3];
    proposalData.status = proposalInfo[4];
    proposalData.limitTime = proposalInfo[5];
    proposalData.inTime = proposalInfo[6];
    proposalData.senderHasVote = proposalInfo[7];

    return proposalData;
  }

  async hasVotedProposal(index) {
    const hasVoted = await this.instance.methods.hasVotedProposal(index).call();
    return hasVoted;
  }


/** Get past events */

async getProgressUpdates() {
  
  const block = await this.web3.eth.getBlockNumber();
  const opts = { fromBlock: block - 100, toBlock: block }
  const events = await this.instance.getPastEvents('progressUpdate', opts);
  return events;
}

async getProposals() {
  
  const block = await this.web3.eth.getBlockNumber();
  const opts = { fromBlock: block - 100, toBlock: block }
  const events = await this.instance.getPastEvents('proposalCreated', opts);
  return events;
}


/** Suscripción a eventos */

  async suscribeToNewContribution(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.newContribution({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
          //console.log(subscriptionId);
      })
      .on('data', function(event){
          actualizeFunction();
          //console.log(event); 
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
          //console.log(subscriptionId);
      })
      .on('data', function(event){
          actualizeFunction();
          //console.log(event); 
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });


  }

  async suscribeToVoteProposal(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.proposalVoted({
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

   async suscribeToClosedProposal(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.proposalClosed({
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

  async suscribeToProgressUpdate(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.progressUpdate({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
          console.log(subscriptionId);
      })
      .on('data', function(event){
          actualizeFunction(event);
          console.log(event); 
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToProposalWithdraw(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.proposalWithdraw({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
          console.log(subscriptionId);
      })
      .on('data', function(event){
          actualizeFunction(event);
          console.log(event); 
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }


/** Manejo de trasacciones y errores */

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
      console.log('reciept', receipt);
      if(receipt.status === '0x1' || receipt.status === 1  || receipt.status===true ){
        console.log('Transaction Success');
      }
      else {
        console.log('Transaction receipt but failed')
      }
    resolve(statusResponse);
  }


/** Trasancciones que cambian el estado de la campaña */

  async contribute(value) {
    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.contribute().estimateGas({ from: this.accounts[0], value: value });      
    const transaction = this.instance.methods.contribute().send({ from: this.accounts[0], gasPrice: gasprice, gas: gas, value: value }) ;    
    var service = this;

    const promise = new Promise(function(resolve, reject) {

      const statusResponse = {};
      statusResponse.error = false;
      statusResponse.errorMsg = "";

      transaction.on('error', (error, receipt) => { service.transactionOnError(error, receipt, statusResponse, resolve) });
      transaction.on('receipt', (receipt) => service.transactionOnReipt(receipt, statusResponse, resolve));

    });

    return promise;
  }

  async setActive() {
    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.setActive().estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.setActive().send({ from: this.accounts[0], gasPrice: gasprice, gas: gas}) ;    
    var service = this;

    const promise = new Promise(function(resolve, reject) {

      const statusResponse = {};
      statusResponse.error = false;
      statusResponse.errorMsg = "";

      transaction.on('error', (error, receipt) => { service.transactionOnError(error, receipt, statusResponse, resolve) });
      transaction.on('receipt', (receipt) => service.transactionOnReipt(receipt, statusResponse, resolve));

    });

    return promise;
  }

  async approveProposal(index) {

    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.approveProposal(index).estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.approveProposal(index).send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
    var service = this;

    const promise = new Promise(function(resolve, reject) {

      const statusResponse = {};
      statusResponse.error = false;
      statusResponse.errorMsg = "";

      transaction.on('error', (error, receipt) => { service.transactionOnError(error, receipt, statusResponse, resolve) });
      transaction.on('receipt', (receipt) => service.transactionOnReipt(receipt, statusResponse, resolve));

    });

    return promise;
  }

  async disapproveProposal(index) {

    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.disapproveProposal(index).estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.disapproveProposal(index).send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
    var service = this;

    const promise = new Promise(function(resolve, reject) {

      const statusResponse = {};
      statusResponse.error = false;
      statusResponse.errorMsg = "";

      transaction.on('error', (error, receipt) => { service.transactionOnError(error, receipt, statusResponse, resolve) });
      transaction.on('receipt', (receipt) => service.transactionOnReipt(receipt, statusResponse, resolve));

    });

    return promise;
  }

  async closeProposal(index) {

    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.closeProposal(index).estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.closeProposal(index).send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
    var service = this;

    const promise = new Promise(function(resolve, reject) {

      const statusResponse = {};
      statusResponse.error = false;
      statusResponse.errorMsg = "";

      transaction.on('error', (error, receipt) => { service.transactionOnError(error, receipt, statusResponse, resolve) });
      transaction.on('receipt', (receipt) => service.transactionOnReipt(receipt, statusResponse, resolve));

    });

    return promise;
  }

  async withdraw(index) {

    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.withdraw(index).estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.withdraw(index).send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
    var service = this;

    const promise = new Promise(function(resolve, reject) {

      const statusResponse = {};
      statusResponse.error = false;
      statusResponse.errorMsg = "";

      transaction.on('error', (error, receipt) => { service.transactionOnError(error, receipt, statusResponse, resolve) });
      transaction.on('receipt', (receipt) => service.transactionOnReipt(receipt, statusResponse, resolve));

    });

    return promise;
  }
  

}

export const campaignService = new CampaignService()
