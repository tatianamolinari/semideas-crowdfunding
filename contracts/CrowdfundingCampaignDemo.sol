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

    /** @dev Allow to change the proposal limit date to seven days earlier to allow have close proposals in the demo.
     *  @param _index index of the proposal we want to change the limit date.
     */
    function changeLimitProposal(uint _index) public {

        Proposal storage proposal = proposals[_index];
        proposal.limitTime = proposal.limitTime - 604800;        
    }

     /** @dev Allow to change the proposal limit date to seven days earlier to allow have close proposals in the demo.
     *  @param _index index of the proposal we want to change the limit date.
     */
    function changeLimitDestructProposal(uint _index) public {

        DestructProposal storage dProposal = destructProposals[_index];
        dProposal.limitTime = dProposal.limitTime - 604800;        
    }


}