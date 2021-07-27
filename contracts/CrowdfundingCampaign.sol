//SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

contract CrowdfundingCampaign {

    /* Enums */

    enum CampaignStatus { CREATED, ACTIVE, FAIL, SUCCESSFUL }
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

    /** @dev Struct close proposal
        This struct represents the proposal that members can make to get their founds back.
    **/
    struct CloseProposal {
        uint approvalsCount;
        uint disapprovalsCount;
        mapping(address => bool) voters;
        ProposalStatus status;
        uint limitTime;
        address author;
    }

    /* Storage */

    CampaignStatus public status;
    
    address public owner;
    
    uint public goal;
    uint public minimunContribution;
    uint public membersCount;
    uint public finalContributions;
    uint public remainingContributions;
    uint public created_at;
    
    mapping(address => uint) public contributions;
    mapping(address => bool) public withdraws;
    
    Proposal[] public proposals;
    CloseProposal[] public closeProposals;
    

    /** @dev Constructor.
     *  @param _minimunContribution minimum contribution in wei that a person has to make to become a member.
     *  @param _goal goal in wei that the project has to reach to be successful.
     *  @param _ipfshash The url hash of the campaign data previously stored in IPFS.
    **/
    constructor(uint _minimunContribution, uint _goal, bytes32 _ipfshash) {
        owner = msg.sender;
        goal = _goal;
        minimunContribution = _minimunContribution;
        status = CampaignStatus.CREATED;
        membersCount = 0;
        created_at = block.timestamp;

        emit CampaignCreated(_ipfshash);
    }


    /* Modifiers */

    modifier restricted() { 
        require( msg.sender==owner, "Sender is not the owner." ); 
        _; 
    }

    modifier membering() { 
        require( (contributions[msg.sender]>0) || (msg.sender == owner), 
            "Sender is not a member." ); 
        _; 
    }

    modifier notMembering() { 
        require( (contributions[msg.sender]==0) && (msg.sender != owner),
            "Sender is already a member." );
         _; 
    }

    modifier statusCreated() { 
        require( status == CampaignStatus.CREATED, 
            "The campaign status is not created." ); 
        _; 
    }

    modifier statusActive() { 
        require( status == CampaignStatus.ACTIVE, 
            "The campaign status is not active." ); 
        _; 
    }

    modifier statusClosed() { 
        require( status == CampaignStatus.SUCCESSFUL || status == CampaignStatus.FAIL, 
            "The campaign status is not close yet." ); 
        _; 
    }

    modifier proposalActive(uint _index) { 
        require( proposals[_index].status == ProposalStatus.ACTIVE, 
            "The proposal is not longer active." ); 
        _; 
    }

    modifier proposalApproved(uint _index) { 
        require( proposals[_index].status == ProposalStatus.APPROVED,
            "The proposal is not approved." ); 
        _; 
    }

    modifier beInTimeProposal(uint _index) { 
        require ( block.timestamp <= proposals[_index].limitTime, 
            "The proposal is close for voting." ); 
        _; 
    }

    modifier passedTimeProposal(uint _index) { 
        require ( block.timestamp > proposals[_index].limitTime, 
            "The proposal is still open for voting." ); 
        _; 
    }
    modifier statusNotClosed() {
        require( status == CampaignStatus.ACTIVE || status == CampaignStatus.CREATED,
            "The campaign status is CLOSED." );
        _;
    }

    modifier closeProposalActive(uint _index) {
        require( closeProposals[_index].status == ProposalStatus.ACTIVE,
            "The close proposal is not longer active." );
        _;
    }

    modifier closeProposalApproved(uint _index) {
        require( closeProposals[_index].status == ProposalStatus.APPROVED,
            "The close proposal is not approved." );
        _;
    }

    modifier beInTimeCloseProposal(uint _index) { 
        require ( block.timestamp <= closeProposals[_index].limitTime, 
            "The close proposal is close for voting." ); 
        _; 
    }

    modifier passedTimeCloseProposal(uint _index) { 
        require ( block.timestamp > closeProposals[_index].limitTime, 
            "The close proposal is still open for voting." ); 
        _; 
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

    /** @dev Emitted when a proposal is release.
     *  @param _index The index of the proposal.
     */
    event ProposalRelease(uint _index);

     /** @dev Emitted when a member creates a proposal to close the campaign and get the founds back.
     *  @param _ipfshash The url hash of the close proposal data stored in IPFS.
     */
    event CloseProposalCreated(bytes32 _ipfshash);

    /** @dev Emitted when a close proposal is voted.
     *  @param _index The index of the close proposal.
     */
    event CloseProposalVoted(uint _index);

    /** @dev Emitted when the author creates a progress update to show how the project is going.
     *  @param _ipfshash The url hash of the progress update data stored in IPFS.
     */
    event ProgressUpdate(bytes32 _ipfshash);

    /** @dev Emitted when the status of the campaign change.
     */
    event ChangeStatusCampaign(CampaignStatus status);

    /** @dev Emitted when a member withdraw his founds.
     */
    event WithdrawFounds(address _member, uint contribution, uint goal, uint256 payment, uint founds);


    /* Functions */

    /** @dev Allow not members to contribute with the campaign and be a member of it.
     */
    function contribute() public notMembering statusCreated payable {
        require(msg.value >= minimunContribution, "The contribution is insufficient");
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

        emit ChangeStatusCampaign(status);
         
    }

    /** @dev Allow only owner to save a new progress Update data ipfs hash.
     *  @param _ipfshash url hash of the progress update data (description and pictures) previously stored in IPFS.
     */
    function saveProgressUpdate(bytes32 _ipfshash) 
        public restricted statusActive {
        emit ProgressUpdate(_ipfshash); 
    }

    /** @dev Allow only owner to create a new proposal to get more founds.
     *  @param _value founds in wei that the owner want to release.
     *  @param _recipient address where the founds are going to be after release them.
     *  @param _ipfshash url hash of the proposal data (description and pictures) previously stored in IPFS.
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
    function release(uint _index) public restricted statusActive proposalApproved(_index) {

        Proposal storage proposal = proposals[_index];
        proposal.status = ProposalStatus.SUCCESSFUL; 
        payable(proposal.recipient).transfer(proposal.value);
        
        emit ProposalRelease(_index);
    }

    /** @dev Allow only members to create a new proposal to finish de project and get the founds back.
     *  @param _ipfshash url hash of the close proposal data (description) previously stored in IPFS.
     */
    function createCloseProposal(bytes32 _ipfshash) public membering statusNotClosed {

        bool out_grace_period = ((created_at + 14 days) <= block.timestamp) && status == CampaignStatus.CREATED;
        require( out_grace_period || status == CampaignStatus.ACTIVE,
            "The campaing created must have 14 days old." );

        CloseProposal storage newCProposal = closeProposals.push();
        newCProposal.approvalsCount = 0;
        newCProposal.disapprovalsCount = 0;
        newCProposal.status = ProposalStatus.ACTIVE;
        newCProposal.limitTime= block.timestamp + 7 days;
        newCProposal.author = msg.sender;

        newCProposal.voters[msg.sender] = true;
        newCProposal.approvalsCount++;

        emit CloseProposalCreated(_ipfshash);
         
    }

    /** @dev Allow only members to approve an active close proposal that they haven't voted before.
     *  @param _index index of the close proposal the member wants to approve.
     */
    function approveCloseProposal(uint _index) public membering statusNotClosed closeProposalActive(_index) beInTimeCloseProposal(_index) {

        CloseProposal storage cProposal = closeProposals[_index];
        require(!cProposal.voters[msg.sender], "The close proposal has been already voted by the sender");

        cProposal.voters[msg.sender] = true;
        cProposal.approvalsCount++;

        emit CloseProposalVoted(_index);
        
    }

    /** @dev Allow only members to disapprove an active close proposal that they haven't voted before.
     *  @param _index index of the close proposal the member wants to disapprove.
     */
    function disapproveCloseProposal(uint _index) public membering statusNotClosed closeProposalActive(_index) beInTimeCloseProposal(_index) {

        CloseProposal storage cProposal = closeProposals[_index];
        require(!cProposal.voters[msg.sender], "The close proposal has been already voted by the sender");

        cProposal.voters[msg.sender] = true;
        cProposal.disapprovalsCount++;

        emit CloseProposalVoted(_index);
        
    }

    /** @dev Allow only members to close an active proposal that already has its voting time over.
     *  @param _index index of the proposal the member wants to approve.
     */
    function closeCloseProposal(uint _index) public membering statusNotClosed closeProposalActive(_index) passedTimeCloseProposal(_index) {

        CloseProposal storage cProposal = closeProposals[_index];

        if (cProposal.approvalsCount > cProposal.disapprovalsCount) {
            if (cProposal.author == owner) {
                status = CampaignStatus.SUCCESSFUL;
            } else {
                status = CampaignStatus.FAIL;
            }
            cProposal.status = ProposalStatus.APPROVED; 
            remainingContributions = address(this).balance;
        }
        else {
            cProposal.status = ProposalStatus.DISAPPROVED;
        }

        emit ChangeStatusCampaign(status);
    }

    /** @dev Allow only members to withdraw the remaining founds once the campaign is closed.
     */
    function withdraw() public membering statusClosed {

        require( msg.sender != owner, "Sender is the owner." );
        require( !withdraws[msg.sender], "Sender already withdraw his founds." );

        uint256 payment = ((contributions[msg.sender]*remainingContributions) / finalContributions);
        
        require( payment < address(this).balance, "Payment can't be more than balance.");

        withdraws[msg.sender] = true;
        payable(msg.sender).transfer(payment);

        emit WithdrawFounds(msg.sender, contributions[msg.sender], finalContributions, payment, remainingContributions );
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

    /** @dev Function to get all the balances of the campaign
     */
    function getBalancesInfo() public view returns (uint, uint, uint, uint) {
        return (goal, finalContributions, remainingContributions, address(this).balance);
    }

    /** @dev Function to get the data of the campaign
     */
    function getCampaignInfo() public view returns (address, CampaignStatus, uint, uint, uint, uint, uint, bool) {
        bool out_grace_period = (created_at + 14 days) <= block.timestamp;
        return (owner, status, goal, minimunContribution, membersCount, finalContributions, remainingContributions, out_grace_period);
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

    /** @dev Function to get the data of a close proposal.
     *  @param _index index of the proposal to return
     */
    function getCloseProposal(uint _index) public view returns (uint, uint, ProposalStatus, uint, bool, bool, address) {
        CloseProposal storage cProposal = closeProposals[_index];
        bool inTime = block.timestamp <= cProposal.limitTime;
        bool senderHasVote = cProposal.voters[msg.sender];
        return (cProposal.approvalsCount, cProposal.disapprovalsCount, cProposal.status, cProposal.limitTime, inTime, senderHasVote, cProposal.author);
    } 

    /** @dev Function to know if a member has already vot a close proposal.
     *  @param _index index of the proposal
     */
    function hasVotedCloseProposal(uint _index) public view returns (bool) {
        CloseProposal storage cProposal = closeProposals[_index];
        return cProposal.voters[msg.sender];
    } 

    /** @dev Function to get the total number of close proposals.
     */
    function getCloseProposalsCount() public view returns (uint) {
        return closeProposals.length;
    }

    /** @dev Function to know if a member has withdraw it's founds 
    */
    function hasWithdraw() public view returns (bool) {
        return withdraws[msg.sender];
    }
   
}