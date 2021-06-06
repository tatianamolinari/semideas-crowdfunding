import getWeb3 from "../getWeb3";
import CrowdFundingCampaing from "../contracts/CrowdFundingCampaing.json";

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
  }

  getFirstAccount(){
    return this.accounts[0];
  }

  isCorrectNetwork() {
    return CrowdFundingCampaing.networks[this.networkId];
  }

  async setInstance() {
    this.instance = await new this.web3.eth.Contract(
      CrowdFundingCampaing.abi,
      CrowdFundingCampaing.networks[this.networkId] && CrowdFundingCampaing.networks[this.networkId].address,
    );
  }

  async getCampaingInfo() {
    let campaingValues = await this.instance.methods.getCampaingInfo().call();
    let campaingInfo = getValuesFromHash(campaingValues);
             
    var campaingData = new Object();
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

}

export const campaignService = new CampaignService()
