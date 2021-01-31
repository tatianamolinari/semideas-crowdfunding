pragma solidity ^0.6.0;

import "./CrowdFundingCampaing.sol";

contract CrowdFundingCampaingCRUD {

     /**
     * Event for campaing creation
     * @param _manager who paid for the tokens
     * @param _campaingAddress address of new campaing
     */
    
    event CampaingCreation(address indexed _manager, address indexed _campaingAddress);



    address[] public listOfCFC;
    mapping(string => bool) names;
    mapping(string => address) campaingsByName;


    function createCrowdFundingCampaing(string calldata _name, uint _minimunContribution, uint _goal)
    external payable returns (address) {

        require(
            !names[_name],
            "Ya hay una campaña con ese nombre"
        );

        address newCFC = address(new CrowdFundingCampaing(_name, _minimunContribution, _goal, msg.sender));

        listOfCFC.push(newCFC);
        names[_name] = true;
        campaingsByName[_name] = newCFC;

        emit CampaingCreation(msg.sender, newCFC);
    }

    function getListOfCFC() public view returns (address[] memory){
        return listOfCFC;
    }

}
