//SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

import "./CrowdfundingCampaign.sol";

contract CrowdfundingCampaignDemo is CrowdfundingCampaign {

    /** @dev Constructor.
     *  @param _minimunContribution minimum contribution in wei that a person has to make to become a member.
     *  @param _goal goal in wei that the proyect has to reach to be succesfull.
     *  @param _ipfshash The url hash of the campaign data previusly stored in IPFS.
    **/
    constructor(uint _minimunContribution, uint _goal, bytes32 _ipfshash)
    CrowdfundingCampaign(_minimunContribution, _goal, _ipfshash) {

    }

    /** @dev Allow to change the created_at value to 14 days earlier to allow have close proposals in a CREATED campaign the demo.
     */
    function changeCreatedAt() public {
        created_at = created_at - 14 days;
    }
      
    /** @dev Allow to change the proposal limit date to seven days earlier to allow have close proposals in the demo.
     *  @param _index index of the proposal we want to change the limit date.
     */
    function changeLimitProposal(uint _index) public {
        Proposal storage proposal = proposals[_index];
        proposal.limitTime = proposal.limitTime - 7 days;        
    }

     /** @dev Allow to change the close proposal limit date to seven days earlier to allow have close proposals in the demo.
     *  @param _index index of the close proposal we want to change the limit date.
     */
    function changeLimitCloseProposal(uint _index) public {
        CloseProposal storage cProposal = closeProposals[_index];
        cProposal.limitTime = cProposal.limitTime - 7 days;        
    }


}