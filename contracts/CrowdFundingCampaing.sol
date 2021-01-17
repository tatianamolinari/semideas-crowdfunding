pragma solidity ^0.6.0;

contract CrowdFundingCampaing {

    struct Proposal{
        uint value;
        address recipient;
        bool complete;
        uint approvalsCount;
        mapping(address => bool) approvals;
    }


    string public name;
    address public manager;
    uint public goal;
    uint public minimunContribution;
    bool active;
    mapping(address => bool) public members;
    uint public membersCount;
    Proposal[] public proposals;
    

    constructor(string memory _name, uint _minimunContribution, uint _goal,  address _manager) public {
        name = _name;
        manager = _manager;
        goal = _goal;
        minimunContribution = _minimunContribution;
        members[_manager] = true;
        active = true;
        membersCount = 0;
    }

    //modifiers
    modifier restricted() {
        require(
            msg.sender==manager,
            "Sender is not the manager authorized."
        );
        _;
    }

    modifier membering() {
        require(
            members[msg.sender],
            "Sender is not a member authorized."
        );
        _;
    }

    //functions
    function contribute() public payable {
        require(
            msg.value >= minimunContribution,
            "The contribution is insuficient");
        members[msg.sender] = true;
        membersCount++;

    }

    function createProposal(uint _value, address _recipient) public membering {
        
        Proposal memory newProposal = Proposal({
            recipient : _recipient,
            value : _value,
            complete : false,
            approvalsCount : 0
        });

        proposals.push(newProposal);
         
    }

    function aproveProposal(uint index) public membering {

        Proposal storage proposal = proposals[index];
        require(
            !proposal.approvals[msg.sender],
            "The proposal is been already approved by the sender"
        );

        proposal.approvals[msg.sender] = true;
        proposal.approvalsCount++;
        
    }

    //** Funciones solo para la vista *//

    function getSummary() public view returns (
        string memory, uint, uint, uint,  uint, address
    ) {

        return (
            name,
            goal,
            minimunContribution,
            address(this).balance,
            proposals.length,
            manager
        );

    }

    function getProposalsCount() public view returns (uint) {

        return proposals.length;

    }

   
}