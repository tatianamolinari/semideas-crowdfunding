pragma solidity ^0.6.0;

import "./CrowdfundingCampaign.sol";

contract CrowdfundingCampaignDemo is CrowdfundingCampaign {

    /** @dev Constructor.
     *  @param _minimunContribution minimum contribution in wei that a person has to make to become a member.
     *  @param _goal goal in wei that the proyect has to reach to be succesfull.
     *  @param _ipfshash The url hash of the campaign data previusly stored in IPFS.
    **/
    constructor(uint _minimunContribution, uint _goal, bytes32 _ipfshash)
    CrowdfundingCampaign(_minimunContribution, _goal, _ipfshash) public {

    }


}