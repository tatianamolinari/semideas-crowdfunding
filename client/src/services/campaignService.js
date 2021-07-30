import getWeb3 from "../getWeb3";
import CrowdfundingCampaignDemo from "../contracts/CrowdfundingCampaignDemo.json";

class CampaignService {
    
  constructor() {
    this.init();
  }

  /**
   * Creates a new connection to the blockchain network selected. 
   * @returns {Boolean} true when connect.
   */
  async init() {
    this.web3 = await getWeb3();
    this.accounts = await this.web3.eth.getAccounts();
    this.networkId = await this.web3.eth.net.getId();
    this.instance = null;
    this.initialBlockNumber = null;
    return true;
  }

  /**
   * Returns the list of accounts in the wallet.
   * @returns {Array} accounts.
   */
  async getAccounts(){
    return (await this.web3.eth.getAccounts());
  }

  /**
   * Get the selected account from the wallet.
   * @returns {String} address of selected account.
   */
  getFirstAccount(){
    return this.accounts[0];
  }

  /**
   * Check if the network selected has the contract deployed.
   * @returns {Boolean} true if the network select is correct and false otherwise
   */
  async isCorrectNetwork() {
    const initialized = await this.init();
    console.log(`Now initialized is ${initialized}`);
    return CrowdfundingCampaignDemo.networks[this.networkId];
  }

  /**
   * Get the currect block of the network.
   * @returns {Number} current block number.
   */
  async getCurrentBlock(){
    return (await this.web3.eth.getBlockNumber())
  }

  /**
   * Get the initial block of the contract.
   * @returns {Number} initial block number.
   */
  getInitialBlock() {
    return this.initialBlockNumber;
  }

  /**
   *  Set the initial block number and an instance of the contract from an address.
   * @param {String} address the address contract.
   * @param {Number} blockNumber initial block number.
   * @returns {Object} a CrowdfundingCampaignDemo instance.
   */
  async setInstanceFromAddress(address, blockNumber) {
    this.instance = await new this.web3.eth.Contract(
      CrowdfundingCampaignDemo.abi,
      CrowdfundingCampaignDemo.networks[this.networkId] && address,
    );
    this.initialBlockNumber = blockNumber;
    return this.instance;
  }

  /**
   * Get the current CrowdfundingCampaignDemo instance.
   * @returns {Object} the CrowdfundingCampaignDemo instance.
   */
  getInstance(){
    return this.instance;
  }

  /**
   * Returns a json object with the campaign info of the current CrowdfundingCampaignDemo instance.
   * @returns {JSON} campaign info as json.
   * */
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

  /**
   * Returns a json object with the balance campaign info of the current CrowdfundingCampaignDemo instance.
   * @returns {JSON} balance campaign info as json.
   * */
  async getBalancesInfo() {
    const balanceValues = await this.instance.methods.getBalancesInfo().call();

    const balancesData = {};
    balancesData.goal = balanceValues._goal;
    balancesData.finalContributions = balanceValues._finalContributions;
    balancesData.remainingContributions = balanceValues._remainingContributions;
    balancesData.actualBalance = balanceValues._actualBalance;

    return balancesData;
  }

  /**
   * Check if an address it's from a member of the campaign.
   * @param {String} address
   * @returns {Boolean} true if the address passed as param is a member and false otherwise. 
   */
  async getMembershipFromAddress(address) {
    return (await this.instance.methods.isMember(address).call());
  }

  /**
   * Check if the selected address it's from a member of the campaign.
   * @returns {Boolean} true if the selected address passed as param is a member and false otherwise. 
   */
  async getMembership() {
    return (this.getMembershipFromAddress(this.accounts[0]))
  }

  /**
   * Get the balance of the campaign.
   * @returns {Number} campaign balance in wei. 
   */
  async getBalance() {
    return (await this.web3.eth.getBalance(this.instance.options.address));
  }

  /**
   * Get the quantity of members of the campaign.
   * @returns {Number} qty memmbers. 
   */
  async getMembersCount() {
    return (await this.instance.methods.membersCount().call());
  }

  /**
   * Get the campaign status.
   * @returns {Number} current campaign status. 
   */
  async getStatus() {
    return (await this.instance.methods.getStatus().call());
  }

  /**
   * Returns a json object with the proposal info of the index passed by param.
   * @param {Number} index the proposal index.
   * @returns {JSON} proposal info as json.
   * */
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

  /**
   * Check if the selected account has voted the proposal of the index passed by param.
   * @param {Number} index the proposal index.
   * @returns {Boolean} true if the account has voted the proposal and false otherwise.
   * */
  async hasVotedProposal(index) {
    const hasVoted = await this.instance.methods.hasVotedProposal(index).call();
    return hasVoted;
  }

  /**
   * Returns a json object with the close proposal info of the index passed by param.
   * @param {Number} index the close proposal index.
   * @returns {JSON} close proposal info as json.
   * */
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

  /**
   * Check if the selected account has voted the close proposal of the index passed by param.
   * @param {Number} index the close proposal index.
   * @returns {Boolean} true if the account has voted the close proposal and false otherwise.
   * */
  async hasVotedCloseProposal(index) {
    const hasVoted = await this.instance.methods.hasVotedCloseProposal(index).call();
    return hasVoted;
  }

  /**
   * Check if the selected account has withdraw his remaining founds.
   * @param {Number} index the close proposal index.
   * @returns {Boolean} true if the selected account has withdraw his remaining founds and false otherwise.
   * */
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


/** Events subscriptions */

  async subscribeToNewContribution(actualizeFunction){

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

  async subscribeToChangeStatus(actualizeFunction){

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

  async subscribeToVoteProposal(actualizeFunction){

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

  async subscribeToClosedProposal(actualizeFunction){

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

  async subscribeToCreateCloseProposal(actualizeFunction){

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

  async subscribeToVoteCloseProposal(actualizeFunction){

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

  async subscribeToCloseProposalDissaproved(actualizeFunction){

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

  async subscribeToProgressUpdate(actualizeFunction){

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

  async subscribeToProposalRelease(actualizeFunction){

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

  async subscribeToWithdraw(actualizeFunction){

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


/** Handle transactions */

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
    }
    else {
      statusResponse.errorMsg = "Error desconocido"
      console.log(statusResponse.errorMsg);
      console.log(error);
    }
    resolve(statusResponse, receipt);
  }

  transactionOnReceipt(receipt, statusResponse, resolve){
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


/** Transactions */

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
