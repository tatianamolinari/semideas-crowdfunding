pragma solidity ^0.6.0;

contract CrowdfundingCampaign {

    /* Enums */

    enum Status { CREATED, APPROVED, DISAPPROVED, ACTIVE, DESTROYED }

    
    /* Structs */

    /** @dev Struct proposal
        This struct represents the proposals that only owner can make to get more founds.
    **/
    struct Proposal{
        uint value;
        address recipient;
        uint approvalsCount;
        uint disapprovalsCount;
        mapping(address => bool) voters;
        Status status;
        uint limitTime;
    }

    /** @dev Struct destruct proposal
        This struct represents the proposal that members can make to get their founds back.
    **/
    struct DestructProposal{
        uint approvalsCount;
        uint disapprovalsCount;
        mapping(address => bool) voters;
        Status status;
        uint limitTime;
    }

    /* Storage */

    Status public status;
    address public owner;
    uint public goal;
    uint public minimunContribution;
    mapping(address => uint) public contributions;
    uint public membersCount;
    Proposal[] public proposals;
    DestructProposal[] public destructProposals;
    

    /** @dev Constructor.
     *  @param _minimunContribution minimum contribution in wei that a person has to make to become a member.
     *  @param _goal goal in wei that the proyect has to reach to be succesfull.
     *  @param _ipfshash The url hash of the campaign data previusly stored in IPFS.
    **/
    constructor(uint _minimunContribution, uint _goal, bytes32 _ipfshash) public {
        owner = msg.sender;
        goal = _goal;
        minimunContribution = _minimunContribution;
        status = Status.CREATED;
        membersCount = 0;

        emit campaignCreated(_ipfshash);
    }


    /* Modifiers */

    modifier restricted() { require(msg.sender==owner, "Sender is not the owner."); _; }

    modifier membering() { require( (contributions[msg.sender]>0) || (msg.sender == owner), "Sender is not a member."); _; }

    modifier notMembering() { require( (contributions[msg.sender]==0) && (msg.sender != owner) , "Sender is already a member."); _; }

    modifier statusCreated() 
        { require(status == Status.CREATED, "The campaign status is not created."); _; }

    modifier statusActive()
        { require(status == Status.ACTIVE, "The campaign status is not active."); _; }

    modifier proposalActive(uint _index) 
        { require(proposals[_index].status == Status.ACTIVE, "The proposal is not longer active."); _; }

    modifier proposalApproved(uint _index) 
        { require(proposals[_index].status == Status.APPROVED, "The proposal is not approved." ); _; }

    modifier beInTimeProposal(uint _index)
        { require (now <= proposals[_index].limitTime, "The proposal is close for voting."); _; }

    modifier passedTimeProposal(uint _index)
        { require (now > proposals[_index].limitTime, "The proposal is still open for voting."); _; }

    modifier destructProposalActive(uint _index) {
        require(
            destructProposals[_index].status == Status.ACTIVE,
            "The destruct proposal is not longer active.");
        _;
    }

    modifier destructProposalApproved(uint _index) {
        require(
            destructProposals[_index].status == Status.APPROVED,
            "The destruct proposal is not approved.");
        _;
    }

    modifier beInTimeDestructProposal(uint _index) { 
        require (now <= destructProposals[_index].limitTime, "The destruct proposal is close for voting."); _; 
    }

    modifier passedTimeDestructProposal(uint _index) { 
        require (now > destructProposals[_index].limitTime, "The destruct proposal is still open for voting."); _; 
    }


    /* Events */

    /** @dev Emitted when the author creates the campaign.
     *  @param _ipfshash The url hash of the campaign data stored in IPFS.
     */
    event campaignCreated(bytes32 indexed _ipfshash);

    /** @dev Emitted when a new person contributes with the campaign.
     */
    event newContribution();

    /** @dev Emitted when the author creates a proposal to free founds.
     *  @param _ipfshash The url hash of the proposal data stored in IPFS.
     */
    event proposalCreated(bytes32 indexed _ipfshash);

    /** @dev Emitted when a proposal is Closed.
     */
    event proposalClosed();

     /** @dev Emitted when a member creates a proposal to destruct the campaign and get the founds back.
     *  @param _ipfshash The url hash of the destruct proposal data stored in IPFS.
     */
    event destructProposalCreated(bytes32 indexed _ipfshash);

    /** @dev Emitted when a  destruct proposal is Closed.
     */
    event destructProposalClosed();

    /** @dev Emitted when the author creates a progress update to show how the proyect is going.
     *  @param _ipfshash The url hash of the progress update data stored in IPFS.
     */
    event progressUpdate(bytes32 indexed _ipfshash);

    /** @dev Emitted when the status of the campaign change.
     */
    event changeStatusCampaign();


    /* Functions */

    /** @dev Allow not members to contribute with the campaign and be a member of it.
     */
    function contribute() public notMembering statusCreated payable {
        require(msg.value >= minimunContribution, "The contribution is insuficient");
        contributions[msg.sender] = msg.value;
        membersCount++;
        emit newContribution();
    }

    /** @dev Allow only owner to change the status of the cCampaign from CREATED to ACTIVE.
     */
    function setActive() public restricted statusCreated {
        
        require(address(this).balance >= goal,"The contributions are insufficient");
        status = Status.ACTIVE;

        emit changeStatusCampaign();
         
    }

    /** @dev Allow only owner to save a new progress Update data ipfs hash.
     *  @param _ipfshash url hash of the progress update data (description and pictures) previusly stored in IPFS.
     */
    function saveProgressUpdate(bytes32 _ipfshash) 
        public restricted statusActive {
        emit progressUpdate(_ipfshash); 
    }

    /** @dev Allow only owner to create a new proposal to get more founds.
     *  @param _value founds in wei that the owner want to withdraw.
     *  @param _recipient address where the founds are going to be after withdraw them.
     *  @param _ipfshash url hash of the proposal data (description and pictures) previusly stored in IPFS.
     */
    function createProposal(uint _value, address _recipient, bytes32 _ipfshash) 
        public restricted statusActive {

        require(address(this).balance >= _value, "The founds are insufficient");
        
        Proposal memory newProposal = Proposal({
            recipient : _recipient,
            value : _value,
            approvalsCount : 0,
            disapprovalsCount: 0,
            status: Status.ACTIVE,
            limitTime: now + 604800 // 7 days
        });

        proposals.push(newProposal);
        emit proposalCreated(_ipfshash);
         
    }

    /** @dev Allow only members to approve an active proposal that they haven't voted before.
     *  @param _index index of the proposal the member wants to approve.
     */
    function approveProposal(uint _index) public membering statusActive proposalActive(_index) beInTimeProposal(_index) {

        Proposal storage proposal = proposals[_index];
        require(!proposal.voters[msg.sender], "The proposal has been already voted by the sender");

        proposal.voters[msg.sender] = true;
        proposal.approvalsCount++;
        
    }

    /** @dev Allow only members to disapprove an active proposal that they haven't voted before.
     *  @param _index index of the proposal the member wants to disapprove.
     */
    function disapproveProposal(uint _index) public membering statusActive proposalActive(_index) beInTimeProposal(_index) {

        Proposal storage proposal = proposals[_index];
        require(!proposal.voters[msg.sender], "The proposal has been already voted by the sender");

        proposal.voters[msg.sender] = true;
        proposal.disapprovalsCount++;
        
    }

    /** @dev Allow only members to close an active proposal that already has its voting time over.
     *  @param _index index of the proposal the member wants to approve.
     */
    function closeProposal(uint _index) public membering statusActive proposalActive(_index) passedTimeProposal(_index) {

        Proposal storage proposal = proposals[_index];

        if (proposal.approvalsCount > proposal.disapprovalsCount) {
            proposal.status = Status.APPROVED; 
        }
        else {
            proposal.status = Status.DISAPPROVED;
        }

        emit proposalClosed();
    }

    /** @dev Allow only members to create a new proposal to finish de proyect and get the founds back.
     *  @param _ipfshash url hash of the destruct proposal data (description) previusly stored in IPFS.
     */
    function createDestructProposal(bytes32 _ipfshash) public membering statusActive {
        
        DestructProposal memory newDProposal = DestructProposal({
            approvalsCount : 0,
            disapprovalsCount: 0,
            status: Status.ACTIVE,
            limitTime: now + 604800 // 7 days
        });

        destructProposals.push(newDProposal);
        emit destructProposalCreated(_ipfshash);
         
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
            dProposal.status = Status.APPROVED; 
        }
        else {
            dProposal.status = Status.DISAPPROVED;
        }

        emit destructProposalClosed();
    }

     /* Aux functions */

    /** @dev Function to return if someone is member.
     */
    function isMember(address _address) public view returns (bool) {
        return contributions[_address]>0;
    }

    /** @dev Function to get the actual status of the campaign.
     */
    function getStatus() public view returns (Status) {
        return status;
    }

    /** @dev Function to get the data of the campaign
     */
    function getCampaignInfo() public view returns (address, Status, uint, uint, uint ) {
        return (owner, status, goal, minimunContribution, membersCount);
    } 

    /** @dev Function to get the data of a proposal.
     *  @param _index index of the proposal to return
     */
    function getProposal(uint _index) public view returns (address, uint, uint, uint, Status, uint, bool, bool) {
        Proposal storage proposal = proposals[_index];
        bool inTime = now <= proposal.limitTime;
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
    function getDestructProposal(uint _index) public view returns (uint, uint, Status, uint, bool, bool) {
        DestructProposal storage dProposal = destructProposals[_index];
        bool inTime = now <= dProposal.limitTime;
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