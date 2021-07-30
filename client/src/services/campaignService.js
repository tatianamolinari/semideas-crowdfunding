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
    this.initialBlockNumber = null;
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

  getInitialBlock() {
    return this.initialBlockNumber;
  }

  async setInstance() {
    this.instance = await new this.web3.eth.Contract(
      CrowdfundingCampaignDemo.abi,
      CrowdfundingCampaignDemo.networks[this.networkId] && CrowdfundingCampaignDemo.networks[this.networkId].address,
    );
    return this.instance;
  }

  async setInstanceFromAddress(address, blockNumber) {
    this.instance = await new this.web3.eth.Contract(
      CrowdfundingCampaignDemo.abi,
      CrowdfundingCampaignDemo.networks[this.networkId] && address,
    );
    this.initialBlockNumber = blockNumber;
    return this.instance;
  }

  getInstance(){
    return this.instance;
  }

  async getCampaignInfo() {
    const campaignValues = await this.instance.methods.getCampaignInfo().call();

    const campaignData = {};
    campaignData.owner = campaignValues._owner;
    campaignData.status = campaignValues._status;
    campaignData.goal = campaignValues._goal;
    campaignData.minimunContribution = campaignValues._minimunContribution;
    campaignData.membersCount = campaignValues._membersCount;
    campaignData.finalContributions = campaignValues._finalContributions;
    campaignData.remainingContributions = campaignValues._remainingContributions;
    campaignData.out_grace_period = campaignValues._out_grace_period;

    return campaignData;
  }

  async getBalancesInfo() {
    const balanceValues = await this.instance.methods.getBalancesInfo().call();

    const balancesData = {};
    balancesData.goal = balanceValues._goal;
    balancesData.finalContributions = balanceValues._finalContributions;
    balancesData.remainingContributions = balanceValues._remainingContributions;
    balancesData.actualBalance = balanceValues._actualBalance;

    return balancesData;
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
            
    const proposalData = {};
    proposalData.recipient = proposalValues._recipient;
    proposalData.value = proposalValues._value;
    proposalData.approvalsCount = proposalValues._approvalsCount;
    proposalData.disapprovalsCount = proposalValues._disapprovalsCount;
    proposalData.status = proposalValues._status;
    proposalData.limitTime = proposalValues._limitTime;
    proposalData.inTime = proposalValues._inTime;
    proposalData.senderHasVote = proposalValues._senderHasVote;

    return proposalData;
  }

  async hasVotedProposal(index) {
    const hasVoted = await this.instance.methods.hasVotedProposal(index).call();
    return hasVoted;
  }

  async getCloseProposalInfo(index) {
    const dProposalValues = await this.instance.methods.getCloseProposal(index).call({ from: this.accounts[0]});
             
    const dProposalData = {};
    dProposalData.approvalsCount = dProposalValues._approvalsCount;
    dProposalData.disapprovalsCount = dProposalValues._disapprovalsCount;
    dProposalData.status = dProposalValues._status;
    dProposalData.limitTime = dProposalValues._limitTime;
    dProposalData.inTime = dProposalValues._inTime;
    dProposalData.senderHasVote = dProposalValues._senderHasVote;
    dProposalData.author = dProposalValues._author;

    return dProposalData;
  }

  async hasVotedCloseProposal(index) {
    const hasVoted = await this.instance.methods.hasVotedCloseProposal(index).call();
    return hasVoted;
  }

  async hasWithdraw() {
    const senderHasWithdraw = await this.instance.methods.hasWithdraw().call({ from: this.accounts[0]});
    return senderHasWithdraw;
  }


/** Get past events */

async getProgressUpdates() {
  
  const initialBlock = this.getInitialBlock();
  const block = await this.web3.eth.getBlockNumber();
  const opts = { fromBlock: initialBlock, toBlock: block }
  const events = await this.instance.getPastEvents('ProgressUpdate', opts);
  return events;
}

async getProposals() {
  
  const initialBlock = this.getInitialBlock();
  const block = await this.web3.eth.getBlockNumber();
  const opts = { fromBlock: initialBlock, toBlock: block }
  const events = await this.instance.getPastEvents('ProposalCreated', opts);
  return events;
}

async getCloseProposals() {
  
  const initialBlock = this.getInitialBlock();
  const block = await this.web3.eth.getBlockNumber();
  const opts = { fromBlock: initialBlock, toBlock: block }
  const events = await this.instance.getPastEvents('CloseProposalCreated', opts);
  return events;
}


/** Suscripción a eventos */

  async suscribeToNewContribution(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.NewContribution({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
          actualizeFunction();
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToChangeStatus(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.ChangeStatusCampaign({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
          console.log("llego un evento");
          actualizeFunction();
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });


  }

  async suscribeToVoteProposal(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.ProposalVoted({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
          actualizeFunction();
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToClosedProposal(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.ProposalClosed({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
          actualizeFunction();
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToCreateCloseProposal(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.CloseProposalCreated({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
          actualizeFunction();
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToVoteCloseProposal(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.CloseProposalVoted({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
          actualizeFunction();
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToCloseProposalDissaproved(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.CloseProposalDissaproved({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
          actualizeFunction();
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToProgressUpdate(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.ProgressUpdate({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
          actualizeFunction(event);
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToProposalRelease(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.ProposalRelease({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
          actualizeFunction(event);
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });
  }

  async suscribeToWithdraw(actualizeFunction){

    const currentBlock = await this.getCurrentBlock();

    this.instance.events.WithdrawFounds({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
      })
      .on('data', function(event){
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        actualizeFunction(event);
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
      //console.log(receipt.cumulativeGasUsed);
      //console.log(receipt.gasUsed);
    }
    else {
      statusResponse.errorMsg = "Error desconocido"
      console.log(statusResponse.errorMsg);
      console.log(error);
    }

    resolve(statusResponse, receipt);
  }

  transactionOnReipt(receipt, statusResponse, resolve){
      statusResponse.res = receipt;
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

  async release(index) {

    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.release(index).estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.release(index).send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
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

  async createCloseProposal(ipfshash) {
    
    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.createCloseProposal(ipfshash).estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.createCloseProposal(ipfshash).send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
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
 
  async approveCloseProposal(index) {

    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.approveCloseProposal(index).estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.approveCloseProposal(index).send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
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

  async disapproveCloseProposal(index) {

    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.disapproveCloseProposal(index).estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.disapproveCloseProposal(index).send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
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

  async closeCloseProposal(index) {

    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.closeCloseProposal(index).estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.closeCloseProposal(index).send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
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

  async withdraw() {

    const gasprice = await this.web3.eth.getGasPrice();
    const gas = await this.instance.methods.withdraw().estimateGas({ from: this.accounts[0] });      
    const transaction = this.instance.methods.withdraw().send({ from: this.accounts[0], gasPrice: gasprice, gas: gas }) ;    
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
