pragma solidity ^0.6.0;

contract CrowdFundingCampaing {

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
        mapping(address => bool) approvals;
        Status status;
    }

    /** @dev Struct destruct proposal
        This struct represents the proposals that members can make to get their founds back.
    **/
    struct DestructProposal{
        uint approvalsCount;
        mapping(address => bool) approvals;
        Status status;
    }


    /* Storage */

    Status public status;
    address public owner;
    uint public goal;
    uint public minimunContribution;
    mapping(address => bool) public members;
    mapping(address => uint) public contributions;
    uint public membersCount;
    Proposal[] public proposals;
    DestructProposal[] public destructProposals;
    

    /** @dev Constructor.
     *  @param _minimunContribution minimum contribution in wei that a person has to make to become a member.
     *  @param _goal goal in wei that the proyect has to reach to be succesfull.
     *  @param _ipfshash The url hash of the campaing data previusly stored in IPFS.
    **/
    constructor(uint _minimunContribution, uint _goal, bytes32 _ipfshash) public {
        owner = msg.sender;
        members[msg.sender] = true;
        goal = _goal;
        minimunContribution = _minimunContribution;
        status = Status.CREATED;
        membersCount = 0;

        emit campaingCreated(_ipfshash);
    }


    /* Modifiers */

    modifier restricted() { require(msg.sender==owner, "Sender is not the owner."); _; }

    modifier membering() { require(members[msg.sender], "Sender is not a member."); _; }

    modifier notMembering() { require(!members[msg.sender], "Sender is already a member."); _; }

    modifier statusCreated() 
        { require(status == Status.CREATED, "The campaing status is not created."); _; }

    modifier statusActive()
        { require(status == Status.ACTIVE, "The campaing status is not active."); _; }

    modifier proposalActive(uint _index) 
        { require(proposals[_index].status == Status.ACTIVE, "The proposal is not longer active."); _; }

    modifier proposalApproved(uint _index) 
        { require(proposals[_index].status == Status.APPROVED, "The proposal is not approved." ); _; }

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


    /* Events */

    /** @dev Emitted when the author creates the campaing.
     *  @param _ipfshash The url hash of the campaing data stored in IPFS.
     */
    event campaingCreated(bytes32 indexed _ipfshash);

    /** @dev Emitted when the author creates a proposal to free founds.
     *  @param _ipfshash The url hash of the proposal data stored in IPFS.
     */
    event proposalCreated(bytes32 indexed _ipfshash);

     /** @dev Emitted when a member creates a proposal to destruct the campaing and get the founds back.
     *  @param _ipfshash The url hash of the destruct proposal data stored in IPFS.
     */
    event destructProposalCreated(bytes32 indexed _ipfshash);

    /** @dev Emitted when the author creates a progress update to show how the proyect is going.
     *  @param _ipfshash The url hash of the progress update data stored in IPFS.
     */
    event progressUpdate(bytes32 indexed _ipfshash);


    /* Functions */

    /** @dev Allow not members to contribute with the campaing and be a member of it.
     */
    function contribute() public notMembering statusCreated payable {
        require(msg.value >= minimunContribution, "The contribution is insuficient");
        members[msg.sender] = true;
        contributions[msg.sender] = msg.value;
        membersCount++;
    }

    /** @dev Allow only owner to change the status of the campaing from CREATED to ACTIVE.
     */
    function setActive() public restricted statusCreated {
        
        require(address(this).balance >= goal,"The contributions are insufficient");
        status = Status.ACTIVE;
         
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
            status: Status.ACTIVE
        });

        proposals.push(newProposal);
        emit proposalCreated(_ipfshash);
         
    }

    /** @dev Allow only members to approve an active proposal that they haven't approved before.
     *  @param _index index of the proposal the member wants to approve.
     */
    function aproveProposal(uint _index) public membering statusActive proposalActive(_index) {

        Proposal storage proposal = proposals[_index];
        require(!proposal.approvals[msg.sender], "The proposal has been already approved by the sender");

        proposal.approvals[msg.sender] = true;
        proposal.approvalsCount++;
        
    }

    /** @dev Allow only members to create a new proposal to finish de proyect and get the founds back.
     *  @param _ipfshash url hash of the destruct proposal data (description) previusly stored in IPFS.
     */
    function createDestructProposal(bytes32 _ipfshash) public membering statusActive {
        
        DestructProposal memory newDProposal = DestructProposal({
            approvalsCount : 0,
            status: Status.ACTIVE
        });

        destructProposals.push(newDProposal);
        emit destructProposalCreated(_ipfshash);
         
    }

    /** @dev Allow only members to approve an active destrcut proposal that they haven't approved before.
     *  @param _index index of the destrcut proposal the member wants to approve.
     */
    function aproveDestructProposal(uint _index) public membering statusActive proposalActive(_index) {

        DestructProposal storage dProposal = destructProposals[_index];
        require(!dProposal.approvals[msg.sender], "The proposal has been already approved by the sender");

        dProposal.approvals[msg.sender] = true;
        dProposal.approvalsCount++;
        
    }

     /* Aux functions */

    /** @dev Function to return if someone is member.
     */
    function isMember(address _address) public view returns (bool) {
        return members[_address];
    }

    /** @dev Function to get the data of a proposal.
     *  @param _index index of the proposal to return
     */
    function getProposal(uint _index) public view returns (address, uint, uint, Status) {
        Proposal storage proposal = proposals[_index];
        return (proposal.recipient, proposal.value, proposal.approvalsCount, proposal.status);
    } 

    /** @dev Function to get the total number of proposals.
     */
    function getProposalsCount() public view returns (uint) {
        return proposals.length;
    }

     /** @dev Function to get the data of destruct proposal.
     *  @param _index index of the destruct proposal to return
     */
    function getDestuctProposal(uint _index) public view returns (uint, Status) {
        DestructProposal storage dProposal = destructProposals[_index];
        return (dProposal.approvalsCount, dProposal.status);
    } 

    /** @dev Function to get the total number of destruct proposals.
     */
    function getDestructProposalsCount() public view returns (uint) {
        return destructProposals.length;
    }

    /** @dev Function to get the actual status of the campaing.
     */
    function getStatus() public view returns (Status) {
        return status;
    }
   
}