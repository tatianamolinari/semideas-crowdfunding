//SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

contract CrowdfundingCampaign {

    /* Enums */

    enum CampaignStatus { CREATED, ACTIVE, DESTROYED, SUCCESSFUL }
    enum ProposalStatus { ACTIVE, APPROVED, DISAPPROVED, SUCCESSFUL }

    
    /* Structs */

    /** @dev Struct proposal
        This struct represents the proposals that only owner can make to get more founds.
    **/
    struct Proposal {
        uint value;
        address recipient;
        uint approvalsCount;
        uint disapprovalsCount;
        mapping(address => bool) voters;
        ProposalStatus status;
        uint limitTime;
    }

    /** @dev Struct destruct proposal
        This struct represents the proposal that members can make to get their founds back.
    **/
    struct DestructProposal {
        uint approvalsCount;
        uint disapprovalsCount;
        mapping(address => bool) voters;
        ProposalStatus status;
        uint limitTime;
    }

    /* Storage */

    CampaignStatus public status;
    
    address public owner;
    
    uint public goal;
    uint public minimunContribution;
    uint public membersCount;
    uint public finalContributions;
    uint public remainingContributions;
    
    mapping(address => uint) public contributions;
    mapping(address => bool) public withdraws;
    
    Proposal[] public proposals;
    DestructProposal[] public destructProposals;
    

    /** @dev Constructor.
     *  @param _minimunContribution minimum contribution in wei that a person has to make to become a member.
     *  @param _goal goal in wei that the proyect has to reach to be succesfull.
     *  @param _ipfshash The url hash of the campaign data previusly stored in IPFS.
    **/
    constructor(uint _minimunContribution, uint _goal, bytes32 _ipfshash) {
        owner = msg.sender;
        goal = _goal;
        minimunContribution = _minimunContribution;
        status = CampaignStatus.CREATED;
        membersCount = 0;
        //finalContributions = 0;

        emit CampaignCreated(_ipfshash);
    }


    /* Modifiers */

    modifier restricted() { require(msg.sender==owner, "Sender is not the owner."); _; }

    modifier membering() { require( (contributions[msg.sender]>0) || (msg.sender == owner), "Sender is not a member."); _; }

    modifier notMembering() { require( (contributions[msg.sender]==0) && (msg.sender != owner) , "Sender is already a member."); _; }

    modifier statusCreated() 
        { require(status == CampaignStatus.CREATED, "The campaign status is not created."); _; }

    modifier statusActive()
        { require(status == CampaignStatus.ACTIVE, "The campaign status is not active."); _; }

    modifier proposalActive(uint _index) 
        { require(proposals[_index].status == ProposalStatus.ACTIVE, "The proposal is not longer active."); _; }

    modifier proposalApproved(uint _index) 
        { require(proposals[_index].status == ProposalStatus.APPROVED, "The proposal is not approved." ); _; }

    modifier beInTimeProposal(uint _index)
        { require (block.timestamp <= proposals[_index].limitTime, "The proposal is close for voting."); _; }

    modifier passedTimeProposal(uint _index)
        { require (block.timestamp > proposals[_index].limitTime, "The proposal is still open for voting."); _; }

    modifier destructProposalActive(uint _index) {
        require(
            destructProposals[_index].status == ProposalStatus.ACTIVE,
            "The destruct proposal is not longer active.");
        _;
    }

    modifier destructProposalApproved(uint _index) {
        require(
            destructProposals[_index].status == ProposalStatus.APPROVED,
            "The destruct proposal is not approved.");
        _;
    }

    modifier beInTimeDestructProposal(uint _index) { 
        require (block.timestamp <= destructProposals[_index].limitTime, "The destruct proposal is close for voting."); _; 
    }

    modifier passedTimeDestructProposal(uint _index) { 
        require (block.timestamp > destructProposals[_index].limitTime, "The destruct proposal is still open for voting."); _; 
    }


    /* Events */

    /** @dev Emitted when the author creates the campaign.
     *  @param _ipfshash The url hash of the campaign data stored in IPFS.
     */
    event CampaignCreated(bytes32 _ipfshash);

    /** @dev Emitted when a new person contributes with the campaign.
     */
    event NewContribution();

    /** @dev Emitted when the author creates a proposal to free founds.
     *  @param _ipfshash The url hash of the proposal data stored in IPFS.
     */
    event ProposalCreated(bytes32 _ipfshash);

     /** @dev Emitted when a proposal is voted.
     *  @param _index The index of the proposal.
     */
    event ProposalVoted(uint _index);

    /** @dev Emitted when a proposal is Closed.
     *  @param _index The index of the proposal.
     */
    event ProposalClosed(uint _index);

    /** @dev Emitted when a proposal was withdraw.
     *  @param _index The index of the proposal.
     */
    event ProposalWithdraw(uint _index);

     /** @dev Emitted when a member creates a proposal to destruct the campaign and get the founds back.
     *  @param _ipfshash The url hash of the destruct proposal data stored in IPFS.
     */
    event DestructProposalCreated(bytes32 _ipfshash);

    /** @dev Emitted when a destruct proposal is voted.
     *  @param _index The index of the destruct proposal.
     */
    event DestructProposalVoted(uint _index);

    /** @dev Emitted when a  destruct proposal is Closed.
     *  @param _index The index of the destruct proposal.
     */
    event DestructProposalClosed(uint _index);

    /** @dev Emitted when the author creates a progress update to show how the proyect is going.
     *  @param _ipfshash The url hash of the progress update data stored in IPFS.
     */
    event ProgressUpdate(bytes32 _ipfshash);

    /** @dev Emitted when the status of the campaign change.
     */
    event ChangeStatusCampaign();


    /* Functions */

    /** @dev Allow not members to contribute with the campaign and be a member of it.
     */
    function contribute() public notMembering statusCreated payable {
        require(msg.value >= minimunContribution, "The contribution is insuficient");
        contributions[msg.sender] = msg.value;
        membersCount++;
        emit NewContribution();
    }

    /** @dev Allow only owner to change the status of the cCampaign from CREATED to ACTIVE.
     */
    function setActive() public restricted statusCreated {
        
        require(address(this).balance >= goal,"The contributions are insufficient");
        status = CampaignStatus.ACTIVE;
        finalContributions = address(this).balance;

        emit ChangeStatusCampaign();
         
    }

    /** @dev Allow only owner to save a new progress Update data ipfs hash.
     *  @param _ipfshash url hash of the progress update data (description and pictures) previusly stored in IPFS.
     */
    function saveProgressUpdate(bytes32 _ipfshash) 
        public restricted statusActive {
        emit ProgressUpdate(_ipfshash); 
    }

    /** @dev Allow only owner to create a new proposal to get more founds.
     *  @param _value founds in wei that the owner want to withdraw.
     *  @param _recipient address where the founds are going to be after withdraw them.
     *  @param _ipfshash url hash of the proposal data (description and pictures) previusly stored in IPFS.
     */
    function createProposal(uint _value, address _recipient, bytes32 _ipfshash) 
        public restricted statusActive {

        require(address(this).balance >= _value, "The founds are insufficient");

        Proposal storage newProposal = proposals.push();
        newProposal.recipient = _recipient;
        newProposal.value = _value;
        newProposal.approvalsCount = 0;
        newProposal.disapprovalsCount = 0;
        newProposal.status = ProposalStatus.ACTIVE;
        newProposal.limitTime= block.timestamp + 7 days;

        emit ProposalCreated(_ipfshash);
        
    }

    /** @dev Allow only members to approve an active proposal that they haven't voted before.
     *  @param _index index of the proposal the member wants to approve.
     */
    function approveProposal(uint _index) public membering statusActive proposalActive(_index) beInTimeProposal(_index) {

        Proposal storage proposal = proposals[_index];
        require(!proposal.voters[msg.sender], "The proposal has been already voted by the sender");

        proposal.voters[msg.sender] = true;
        proposal.approvalsCount++;

        emit ProposalVoted(_index);        
    }

    /** @dev Allow only members to disapprove an active proposal that they haven't voted before.
     *  @param _index index of the proposal the member wants to disapprove.
     */
    function disapproveProposal(uint _index) public membering statusActive proposalActive(_index) beInTimeProposal(_index) {

        Proposal storage proposal = proposals[_index];
        require(!proposal.voters[msg.sender], "The proposal has been already voted by the sender");

        proposal.voters[msg.sender] = true;
        proposal.disapprovalsCount++;
        
        emit ProposalVoted(_index);
    }

    /** @dev Allow only members to close an active proposal that already has its voting time over.
     *  @param _index index of the proposal the member wants to approve.
     */
    function closeProposal(uint _index) public membering statusActive proposalActive(_index) passedTimeProposal(_index) {

        Proposal storage proposal = proposals[_index];

        if (proposal.approvalsCount > proposal.disapprovalsCount) {
            proposal.status = ProposalStatus.APPROVED; 
        }
        else {
            proposal.status = ProposalStatus.DISAPPROVED;
        }

        emit ProposalClosed(_index);
    }

    /** @dev Allow only members to close an active proposal that already has its voting time over.
     *  @param _index index of the proposal the member wants to approve.
     */
    function withdraw(uint _index) public restricted statusActive proposalApproved(_index) {

        Proposal storage proposal = proposals[_index];
        proposal.status = ProposalStatus.SUCCESSFUL; 
        payable(proposal.recipient).transfer(proposal.value);
        
        emit ProposalWithdraw(_index);
    }

    /** @dev Allow only members to create a new proposal to finish de proyect and get the founds back.
     *  @param _ipfshash url hash of the destruct proposal data (description) previusly stored in IPFS.
     */
    function createDestructProposal(bytes32 _ipfshash) public membering statusActive {

        DestructProposal storage newDProposal = destructProposals.push();
        newDProposal.approvalsCount = 0;
        newDProposal.disapprovalsCount = 0;
        newDProposal.status = ProposalStatus.ACTIVE;
        newDProposal.limitTime= block.timestamp + 7 days;

        emit DestructProposalCreated(_ipfshash);
         
    }

    /** @dev Allow only members to approve an active destruct proposal that they haven't voted before.
     *  @param _index index of the destruct proposal the member wants to approve.
     */
    function aproveDestructProposal(uint _index) public membering statusActive destructProposalActive(_index) beInTimeDestructProposal(_index) {

        DestructProposal storage dProposal = destructProposals[_index];
        require(!dProposal.voters[msg.sender], "The destruct proposal has been already voted by the sender");

        dProposal.voters[msg.sender] = true;
        dProposal.approvalsCount++;
        
    }

    /** @dev Allow only members to disapprove an active destruct proposal that they haven't voted before.
     *  @param _index index of the destruct proposal the member wants to disapprove.
     */
    function disapproveDestructProposal(uint _index) public membering statusActive destructProposalActive(_index) beInTimeDestructProposal(_index) {

        DestructProposal storage dProposal = destructProposals[_index];
        require(!dProposal.voters[msg.sender], "The destruct proposal has been already voted by the sender");

        dProposal.voters[msg.sender] = true;
        dProposal.disapprovalsCount++;
        
    }

    /** @dev Allow only members to close an active proposal that already has its voting time over.
     *  @param _index index of the proposal the member wants to approve.
     */
    function closeDestructProposal(uint _index) public membering statusActive destructProposalActive(_index) passedTimeDestructProposal(_index) {

        DestructProposal storage dProposal = destructProposals[_index];

        if (dProposal.approvalsCount > dProposal.disapprovalsCount) {
            dProposal.status = ProposalStatus.APPROVED; 
        }
        else {
            dProposal.status = ProposalStatus.DISAPPROVED;
        }

        emit DestructProposalClosed(_index);
    }

     /* Aux functions */

    /** @dev Function to return if someone is member.
     */
    function isMember(address _address) public view returns (bool) {
        return contributions[_address]>0;
    }

    /** @dev Function to get the actual status of the campaign.
     */
    function getStatus() public view returns (CampaignStatus) {
        return status;
    }

    /** @dev Function to get the finalContributions of the campaign.
     */
    function getFinalContributions() public view returns (uint) {
        return finalContributions;
    }

    /** @dev Function to get the remainingContributions of the campaign.
     */
    function getRemainingContributions() public view returns (uint) {
        return remainingContributions;
    }

    /** @dev Function to get the data of the campaign
     */
    function getCampaignInfo() public view returns (address, CampaignStatus, uint, uint, uint, uint, uint) {
        return (owner, status, goal, minimunContribution, membersCount, finalContributions, remainingContributions);
    } 

    /** @dev Function to get the data of a proposal.
     *  @param _index index of the proposal to return
     */
    function getProposal(uint _index) public view returns (address, uint, uint, uint, ProposalStatus, uint, bool, bool) {
        Proposal storage proposal = proposals[_index];
        bool inTime = block.timestamp <= proposal.limitTime;
        bool senderHasVote = proposal.voters[msg.sender];
        return (proposal.recipient, proposal.value, proposal.approvalsCount, proposal.disapprovalsCount, proposal.status, proposal.limitTime, inTime, senderHasVote);
    } 

     /** @dev Function to know if a member has already vot a proposal.
     *  @param _index index of the proposal
     */
    function hasVotedProposal(uint _index) public view returns (bool) {
        Proposal storage proposal = proposals[_index];
        return proposal.voters[msg.sender];
    } 

    /** @dev Function to get the total number of proposals.
     */
    function getProposalsCount() public view returns (uint) {
        return proposals.length;
    }

     /** @dev Function to get the data of destruct proposal.
     *  @param _index index of the destruct proposal to return
     */
    function getDestructProposal(uint _index) public view returns (uint, uint, ProposalStatus, uint, bool, bool) {
        DestructProposal storage dProposal = destructProposals[_index];
        bool inTime = block.timestamp <= dProposal.limitTime;
        bool senderHasVote = dProposal.voters[msg.sender];
        return (dProposal.approvalsCount, dProposal.disapprovalsCount, dProposal.status, dProposal.limitTime, inTime, senderHasVote);
    } 

    /** @dev Function to know if a member has already vot a destruct proposal.
     *  @param _index index of the proposal
     */
    function hasVotedDestructProposal(uint _index) public view returns (bool) {
        DestructProposal storage dProposal = destructProposals[_index];
        return dProposal.voters[msg.sender];
    } 

    /** @dev Function to get the total number of destruct proposals.
     */
    function getDestructProposalsCount() public view returns (uint) {
        return destructProposals.length;
    }
   
}